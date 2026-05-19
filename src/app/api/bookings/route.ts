import { NextResponse } from "next/server";
import { bookingCreateSchema } from "@/lib/booking/schema";
import { getCombo } from "@/lib/data/combos";
import { sendConfirmationEmail } from "@/lib/email/send-confirmation";
import { createPixPayment } from "@/lib/pix/mercadopago";
import { upsertCalendarEvent } from "@/lib/calendar/google-calendar";
import { createAdminClient, createAnonClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bookingCreateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload inválido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  // 1) Resolver os serviços pelo slug
  const { data: dbServices, error: svcErr } = await supabase
    .from("services")
    .select("id, slug, name, duration_minutes, from_price_cents, requires_deposit")
    .in("slug", data.serviceSlugs);

  if (svcErr || !dbServices || dbServices.length !== data.serviceSlugs.length) {
    console.error("[bookings] service resolve failed", {
      requested: data.serviceSlugs,
      found: dbServices?.map((s) => s.slug) ?? [],
      error: svcErr,
    });
    return NextResponse.json(
      { error: "Serviços inválidos ou não encontrados" },
      { status: 400 },
    );
  }

  // 2) Resolver unidade pelo slug
  const { data: dbUnit, error: unitErr } = await supabase
    .from("units")
    .select("id, slug, name")
    .eq("slug", data.unitSlug)
    .single();

  if (unitErr || !dbUnit) {
    return NextResponse.json({ error: "Casa inválida" }, { status: 400 });
  }

  // 3) Resolver profissional (se __any__, deixa nulo; salão atribui depois)
  let dbStaffId: string | null = null;
  if (data.staffSlug !== "__any__") {
    const { data: dbStaff } = await supabase
      .from("staff")
      .select("id")
      .eq("slug", data.staffSlug)
      .maybeSingle();
    dbStaffId = dbStaff?.id ?? null;
  }

  // 4) Upsert cliente pelo telefone (normalizado)
  const phoneNorm = data.phone.replace(/\D/g, "");
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("phone", phoneNorm)
    .maybeSingle();

  let clientId: string;
  const nowIso = new Date().toISOString();

  if (existingClient) {
    clientId = existingClient.id;
    await supabase
      .from("clients")
      .update({
        name: data.name,
        email: data.email,
        last_seen_at: nowIso,
      })
      .eq("id", clientId);
  } else {
    const { data: newClient, error: clientErr } = await supabase
      .from("clients")
      .insert({
        name: data.name,
        email: data.email,
        phone: phoneNorm,
        notes: data.notes || null,
        last_seen_at: nowIso,
      })
      .select("id")
      .single();

    if (clientErr || !newClient) {
      console.error("[clients] insert failed:", clientErr);
      return NextResponse.json(
        { error: "Falha ao criar cliente" },
        { status: 500 },
      );
    }
    clientId = newClient.id;
  }

  // 5) Registrar consents LGPD
  const consentRows: {
    client_id: string;
    consent_type: "privacy_policy" | "terms_of_use" | "marketing_email" | "create_account";
    version: string;
    granted: boolean;
  }[] = [];

  if (data.consents.privacy_policy) {
    consentRows.push({
      client_id: clientId,
      consent_type: "privacy_policy",
      version: "v1",
      granted: true,
    });
  }
  if (data.consents.terms_of_use) {
    consentRows.push({
      client_id: clientId,
      consent_type: "terms_of_use",
      version: "v1",
      granted: true,
    });
  }
  if (data.consents.marketing_email) {
    consentRows.push({
      client_id: clientId,
      consent_type: "marketing_email",
      version: "v1",
      granted: true,
    });
  }
  if (data.consents.create_account) {
    consentRows.push({
      client_id: clientId,
      consent_type: "create_account",
      version: "v1",
      granted: true,
    });
  }
  if (consentRows.length > 0) {
    await supabase.from("client_consents").insert(consentRows);
  }

  // 6) Calcular preço efetivo (combo vs soma à la carte)
  const scheduledAt = new Date(`${data.date}T${data.time}:00-03:00`);
  const totalDuration = dbServices.reduce(
    (acc, s) => acc + s.duration_minutes,
    0,
  );
  const sumIndividualCents = dbServices.reduce(
    (acc, s) => acc + s.from_price_cents,
    0,
  );

  const combo = data.comboSlug ? getCombo(data.comboSlug) : null;
  const isComboMatch =
    !!combo &&
    data.serviceSlugs.length === combo.serviceSlugs.length &&
    combo.serviceSlugs.every((s) => data.serviceSlugs.includes(s));
  const comboPriceCents =
    isComboMatch && combo
      ? combo.priceCents ??
        combo.fromCents ??
        combo.variants?.[0]?.priceCents ??
        null
      : null;
  const totalCents =
    comboPriceCents !== null ? comboPriceCents : sumIndividualCents;
  const needsDeposit = dbServices.some((s) => s.requires_deposit);
  const depositCents = needsDeposit ? Math.round(totalCents * 0.3) : 0;
  const serviceLabel =
    isComboMatch && combo
      ? `${combo.title} (${dbServices.map((s) => s.name).join(" + ")})`
      : dbServices.map((s) => s.name).join(" + ");

  // 7) Criar booking. cancel_token e gerado por default na DB (uuid v4) e
  // serve pra autorizar o cancelamento via link - blinda contra IDOR. Buscamos
  // de volta pra incluir nos links.
  const { data: dbBooking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      client_id: clientId,
      staff_id: dbStaffId,
      unit_id: dbUnit.id,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: totalDuration,
      status: needsDeposit ? "pending_payment" : "confirmed",
      total_cents: totalCents,
      deposit_cents: depositCents,
      combo_slug: isComboMatch && combo ? combo.slug : null,
      client_notes: data.notes || null,
    })
    .select("id, cancel_token")
    .single();

  if (bookingErr || !dbBooking) {
    console.error("[bookings] insert failed:", bookingErr);
    return NextResponse.json(
      { error: "Falha ao criar agendamento" },
      { status: 500 },
    );
  }
  const bookingId = dbBooking.id;
  const cancelToken: string | null =
    (dbBooking as { cancel_token?: string | null }).cancel_token ?? null;

  // 8) Criar booking_services (N:M)
  const bsRows = dbServices.map((sv, i) => ({
    booking_id: bookingId,
    service_id: sv.id,
    position: i,
    duration_minutes: sv.duration_minutes,
    price_cents: sv.from_price_cents,
  }));
  const { error: bsErr } = await supabase
    .from("booking_services")
    .insert(bsRows);
  if (bsErr) console.error("[booking_services] insert failed:", bsErr);

  const env = getEnv();

  // 9) Pagamento Pix (opcional, se configurado)
  let payment: Awaited<ReturnType<typeof createPixPayment>> | null = null;
  if (needsDeposit && env.MERCADOPAGO_ACCESS_TOKEN) {
    payment = await createPixPayment({
      bookingId,
      amountCents: depositCents,
      payerEmail: data.email,
      payerName: data.name,
      description: `Sinal · ${serviceLabel} · Silvia's Hair`,
    });

    if (payment) {
      await supabase.from("payments").insert({
        booking_id: bookingId,
        amount_cents: payment.amountCents,
        status: "pending",
        provider: "mercadopago",
        provider_payment_id: payment.providerPaymentId ?? null,
        pix_qr_code: payment.pixQrCode,
        pix_qr_base64: payment.pixQrBase64,
        pix_copy_paste: payment.pixCopyPaste,
        expires_at: payment.expiresAt,
      });
    }
  }

  // 10) Google Calendar (opcional)
  if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    upsertCalendarEvent({
      bookingId,
      title: `${data.name} · ${serviceLabel}`,
      description: `Cliente: ${data.name}\nTelefone: ${data.phone}\nServiços: ${serviceLabel}\nObservações: ${data.notes || "—"}`,
      startsAt: scheduledAt,
      durationMinutes: totalDuration,
    }).catch((err) => console.error("[calendar] falha não-crítica:", err));
  }

  // 11) Magic link (opcional, se cliente pediu criar conta).
  // Precisa do cliente ANON — service role não consegue chamar signInWithOtp.
  if (data.consents.create_account) {
    try {
      const anon = createAnonClient();
      const siteUrl =
        env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
      const { error } = await anon.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${siteUrl}/conta/entrar/callback?next=${encodeURIComponent("/conta")}`,
          shouldCreateUser: true,
        },
      });
      if (error) {
        console.error(
          "[magic-link] pos-reserva falha não-crítica:",
          error.message,
        );
      }
    } catch (err) {
      console.error("[magic-link] pos-reserva exception:", err);
    }
  }

  // 12) E-mail de confirmação (opcional)
  if (env.RESEND_API_KEY) {
    sendConfirmationEmail({
      to: data.email,
      name: data.name,
      serviceName: serviceLabel,
      scheduledAt,
      bookingId,
      cancelToken: cancelToken ?? undefined,
      pixCopyPaste: payment?.pixCopyPaste,
    }).catch((err) => console.error("[email] falha não-crítica:", err));
  }

  return NextResponse.json({
    id: bookingId,
    cancelToken,
    status: needsDeposit ? "pending_payment" : "confirmed",
    payment: payment
      ? {
          qrCode: payment.pixQrCode,
          qrBase64: payment.pixQrBase64,
          copyPaste: payment.pixCopyPaste,
          amountCents: payment.amountCents,
          expiresAt: payment.expiresAt,
        }
      : null,
  });
}
