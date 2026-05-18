import { lookupBooking } from "@/lib/booking/lookup";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIcsDate(d: Date): string {
  // Formato UTC: 20260518T120000Z
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const booking = await lookupBooking(id);
  if (!booking) {
    return new Response("Booking not found", { status: 404 });
  }

  const start = booking.scheduledAt;
  const end = new Date(
    start.getTime() + booking.durationMinutes * 60 * 1000,
  );

  const summary = `Silvia's Hair · ${booking.services.map((s) => s.name).join(" + ")}`;
  const description = [
    `Casa: ${booking.unitName} · ${booking.unitShoppingName}`,
    `Endereço: ${booking.unitAddress}`,
    booking.staffName ? `Profissional: ${booking.staffName}` : null,
    `Duração: ${booking.durationMinutes} min`,
    "",
    `Código do agendamento: ${booking.shortCode}`,
  ]
    .filter(Boolean)
    .join("\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Silvia's Hair//Agendamento//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@silviashair.com.br`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(`${booking.unitName} · ${booking.unitAddress}`)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Lembrete · Silvia's Hair em 1 hora",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    status: 200,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="silvias-hair-${booking.shortCode}.ics"`,
      "cache-control": "no-store",
    },
  });
}
