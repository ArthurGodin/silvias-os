import { Resend } from "resend";
import { formatDateLong, formatBRL } from "@/lib/utils";

type Params = {
  to: string;
  name: string;
  serviceName: string;
  scheduledAt: Date;
  bookingId: string;
  pixCopyPaste?: string;
};

export async function sendConfirmationEmail(params: Params) {
  if (!process.env.RESEND_API_KEY) return null;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const dateLabel = formatDateLong(params.scheduledAt);
  const timeLabel = params.scheduledAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;font-family:'Manrope',system-ui,sans-serif;background:#FAF7F2;color:#2E3842;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fefcf9;border:1px solid rgba(46,56,66,0.16);">
        <tr><td style="padding:48px 40px 24px;">
          <p style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:28px;margin:0;letter-spacing:-0.02em;">Silvia&rsquo;s Hair</p>
          <p style="text-transform:uppercase;letter-spacing:0.22em;font-size:11px;color:#8E8892;margin-top:8px;">Estilo &amp; Personalidade</p>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <hr style="border:none;border-top:1px solid rgba(46,56,66,0.16);margin:0;" />
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:14px;margin:0;text-transform:uppercase;letter-spacing:0.22em;color:#8E8892;">Confirmação · ${params.bookingId.slice(0, 8).toUpperCase()}</p>
          <h1 style="font-family:'Fraunces',Georgia,serif;font-size:36px;line-height:1.1;margin:16px 0 24px;letter-spacing:-0.02em;font-weight:400;">
            ${params.name.split(" ")[0]}, seu horário está reservado.
          </h1>
          <p style="font-size:16px;line-height:1.6;color:#393F49;margin:0 0 32px;">
            Estamos te esperando para <strong>${params.serviceName}</strong>.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(46,56,66,0.16);">
            <tr>
              <td style="padding:24px 0;border-bottom:1px solid rgba(46,56,66,0.16);">
                <p style="text-transform:uppercase;letter-spacing:0.22em;font-size:10px;color:#8E8892;margin:0;">Data</p>
                <p style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:22px;margin:8px 0 0;">${dateLabel}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 0;border-bottom:1px solid rgba(46,56,66,0.16);">
                <p style="text-transform:uppercase;letter-spacing:0.22em;font-size:10px;color:#8E8892;margin:0;">Horário</p>
                <p style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:22px;margin:8px 0 0;">${timeLabel}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 0;">
                <p style="text-transform:uppercase;letter-spacing:0.22em;font-size:10px;color:#8E8892;margin:0;">Serviço</p>
                <p style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:22px;margin:8px 0 0;">${params.serviceName}</p>
              </td>
            </tr>
          </table>

          ${params.pixCopyPaste ? `
            <div style="margin-top:32px;padding:24px;background:#FAF7F2;border:1px solid rgba(46,56,66,0.16);">
              <p style="text-transform:uppercase;letter-spacing:0.22em;font-size:10px;color:#8E8892;margin:0 0 16px;">Sinal Pix</p>
              <p style="font-size:14px;color:#393F49;line-height:1.6;margin:0 0 12px;">Confirme em até 30 minutos:</p>
              <p style="font-family:monospace;font-size:11px;word-break:break-all;background:#fff;padding:12px;color:#2E3842;border:1px solid rgba(46,56,66,0.16);">${params.pixCopyPaste}</p>
            </div>
          ` : ""}

          <p style="margin-top:40px;font-size:14px;color:#8E8892;">
            Precisa cancelar ou remarcar? Responda este e-mail ou nos chame no WhatsApp.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px 40px;border-top:1px solid rgba(46,56,66,0.16);">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:#8E8892;margin:0;text-align:center;">silviashair.com.br · Teresina, PI</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Silvia's Hair <ola@silviashair.com.br>",
    to: params.to,
    subject: `Reservado · ${params.serviceName} · ${dateLabel}`,
    html,
  });
}
