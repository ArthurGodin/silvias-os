import { Resend } from "resend";
import { formatDateLong } from "@/lib/utils";

type Params = {
  to: string;
  name: string;
  serviceName: string;
  scheduledAt: Date;
  bookingId: string;
  cancelToken?: string | null;
  unitName: string;
  unitAddress: string;
};

export async function sendReminderEmail(params: Params) {
  if (!process.env.RESEND_API_KEY) return null;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const dateLabel = formatDateLong(params.scheduledAt);
  const timeLabel = params.scheduledAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://silviashair.com.br"}/agendamento/${params.bookingId}${params.cancelToken ? `?cancel=${params.cancelToken}` : ""}`;

  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;font-family:'Manrope',system-ui,sans-serif;background:#FAF7F2;color:#2E3842;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fefcf9;border:1px solid rgba(46,56,66,0.16);">
        <tr><td style="padding:48px 40px 24px;">
          <p style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:28px;margin:0;letter-spacing:-0.02em;">Silvia&rsquo;s Hair</p>
          <p style="text-transform:uppercase;letter-spacing:0.22em;font-size:11px;color:#8E8892;margin-top:8px;">Lembrete &middot; Amanhã</p>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <hr style="border:none;border-top:1px solid rgba(46,56,66,0.16);margin:0;" />
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="font-family:'Fraunces',Georgia,serif;font-size:32px;line-height:1.15;margin:0 0 24px;letter-spacing:-0.02em;font-weight:400;">
            ${params.name.split(" ")[0]}, seu horário é <em>amanhã.</em>
          </h1>
          <p style="font-size:16px;line-height:1.6;color:#393F49;margin:0 0 28px;">
            Estamos preparando tudo pro seu <strong>${params.serviceName}</strong>.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(46,56,66,0.16);">
            <tr>
              <td style="padding:20px 0;border-bottom:1px solid rgba(46,56,66,0.16);">
                <p style="text-transform:uppercase;letter-spacing:0.22em;font-size:10px;color:#8E8892;margin:0;">Quando</p>
                <p style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:20px;margin:6px 0 0;">${dateLabel} &middot; ${timeLabel}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 0;">
                <p style="text-transform:uppercase;letter-spacing:0.22em;font-size:10px;color:#8E8892;margin:0;">Onde</p>
                <p style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:20px;margin:6px 0 0;">${params.unitName}</p>
                <p style="font-size:13px;color:#8E8892;margin:4px 0 0;">${params.unitAddress}</p>
              </td>
            </tr>
          </table>

          <div style="margin-top:32px;padding:20px;background:#FAF7F2;border:1px solid #BF9B5B;">
            <p style="margin:0;font-size:14px;color:#393F49;line-height:1.55;">
              Precisa <strong>cancelar ou remarcar</strong>? Faça pelo link abaixo até <strong>24h antes</strong>:
            </p>
            <p style="margin:12px 0 0;">
              <a href="${trackingUrl}" style="color:#8C6F3A;font-weight:600;text-decoration:underline;">${trackingUrl}</a>
            </p>
          </div>

          <p style="margin-top:32px;font-size:13px;color:#8E8892;line-height:1.6;">
            Dica: chegue 5 minutos antes para um café. Se atrasar muito, podemos precisar reagendar.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px 40px;border-top:1px solid rgba(46,56,66,0.16);">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:#8E8892;margin:0;text-align:center;">silviashair.com.br &middot; Teresina, PI</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ??
      "Silvia's Hair <ola@silviashair.com.br>",
    to: params.to,
    subject: `Lembrete · Amanhã, ${timeLabel} · ${params.serviceName}`,
    html,
  });
}
