import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReminderEmail } from "@/lib/email/send-reminder";

/**
 * Cron de lembrete 24h antes do atendimento.
 *
 * Disparo: Cloudflare Cron Trigger configurado em wrangler.jsonc (todo dia
 * as 12:00 BRT = 15:00 UTC). Tambem aceita invocacao manual via GET, mas
 * exige header X-Cron-Secret pra evitar abuso publico.
 *
 * Logica:
 * 1) Janela: bookings com scheduled_at entre [agora + 23h] e [agora + 25h].
 *    Janela de 2h pra cobrir o dia inteiro com 1 execucao diaria.
 * 2) So envia pra bookings confirmados (nao cancelados, nao pending_payment,
 *    nao no_show).
 * 3) Marca em reminder_sent_at no booking pra nao reenviar.
 *    NOTE: se a coluna ainda nao existir, faz fallback e simplesmente
 *    nao deduplica - aceitavel num primeiro deploy.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("x-cron-secret");
  // Em producao exige secret. Em dev libera pra facilitar teste manual.
  if (process.env.NODE_ENV === "production" && secret && header !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // Selecao inicial. Sempre seleciona cancel_token e reminder_sent_at; se as
  // colunas nao existirem, faz fallback no catch.
  let bookings: BookingForReminder[] = [];
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id, scheduled_at, status, cancel_token, reminder_sent_at,
        clients ( name, email ),
        units ( name, address ),
        booking_services ( services ( name ) )
      `,
      )
      .gte("scheduled_at", windowStart.toISOString())
      .lt("scheduled_at", windowEnd.toISOString())
      .in("status", ["confirmed", "checked_in"]);
    if (error) throw error;
    bookings = (data as unknown as BookingForReminder[]) ?? [];
  } catch (err) {
    // Fallback sem cancel_token / reminder_sent_at
    console.warn(
      "[cron/reminders] fallback select (missing column?):",
      (err as Error).message,
    );
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id, scheduled_at, status,
        clients ( name, email ),
        units ( name, address ),
        booking_services ( services ( name ) )
      `,
      )
      .gte("scheduled_at", windowStart.toISOString())
      .lt("scheduled_at", windowEnd.toISOString())
      .in("status", ["confirmed", "checked_in"]);
    if (error) {
      console.error("[cron/reminders] select failed:", error);
      return NextResponse.json(
        { error: "Failed to query bookings" },
        { status: 500 },
      );
    }
    bookings = (data as unknown as BookingForReminder[]) ?? [];
  }

  let sent = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const b of bookings) {
    if (b.reminder_sent_at) {
      skipped += 1;
      continue;
    }
    const email = b.clients?.email;
    const name = b.clients?.name;
    if (!email || !name) {
      skipped += 1;
      continue;
    }
    const serviceName =
      b.booking_services
        ?.map((bs) => bs.services?.name)
        .filter(Boolean)
        .join(" + ") || "Atendimento";

    try {
      await sendReminderEmail({
        to: email,
        name,
        serviceName,
        scheduledAt: new Date(b.scheduled_at),
        bookingId: b.id,
        cancelToken: b.cancel_token ?? null,
        unitName: b.units?.name ?? "Silvia's Hair",
        unitAddress: b.units?.address ?? "",
      });

      // Marca como enviado (se coluna existir)
      const { error: updErr } = await supabase
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", b.id);
      if (updErr && !updErr.message?.includes("reminder_sent_at")) {
        console.error(
          "[cron/reminders] marking reminder_sent_at failed:",
          updErr,
        );
      }
      sent += 1;
    } catch (err) {
      failed.push(b.id);
      console.error("[cron/reminders] send failed for", b.id, err);
    }
  }

  return NextResponse.json({
    ok: true,
    window: { start: windowStart.toISOString(), end: windowEnd.toISOString() },
    total: bookings.length,
    sent,
    skipped,
    failed: failed.length,
  });
}

type BookingForReminder = {
  id: string;
  scheduled_at: string;
  status: string;
  cancel_token?: string | null;
  reminder_sent_at?: string | null;
  clients: { name: string; email: string | null } | null;
  units: { name: string; address: string } | null;
  booking_services: { services: { name: string } | null }[];
};
