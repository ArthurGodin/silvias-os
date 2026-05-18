type UpsertParams = {
  bookingId: string;
  title: string;
  description: string;
  startsAt: Date;
  durationMinutes: number;
};

/**
 * Sincronização one-way (DB → Calendar) usando service account.
 *
 * Pré-requisito: configurar conta de serviço no Google Cloud, compartilhar
 * o calendário de cada profissional com o e-mail dela e setar GOOGLE_PRIVATE_KEY,
 * GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_CALENDAR_OWNER_EMAIL no .env.
 */
export async function upsertCalendarEvent(params: UpsertParams) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  const calendarOwner = process.env.GOOGLE_CALENDAR_OWNER_EMAIL;
  if (!email || !key || !calendarOwner) return null;

  const accessToken = await getAccessToken(email, key);
  const endsAt = new Date(params.startsAt.getTime() + params.durationMinutes * 60_000);

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarOwner)}/events`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      summary: params.title,
      description: params.description,
      start: { dateTime: params.startsAt.toISOString(), timeZone: "America/Fortaleza" },
      end: { dateTime: endsAt.toISOString(), timeZone: "America/Fortaleza" },
      extendedProperties: { private: { bookingId: params.bookingId } },
      reminders: { useDefault: true },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API ${res.status}: ${text}`);
  }
  return res.json() as Promise<{ id: string }>;
}

async function getAccessToken(serviceAccountEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const header = { alg: "RS256", typ: "JWT" };

  const enc = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const toSign = `${enc(header)}.${enc(payload)}`;

  const crypto = await import("crypto");
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(toSign);
  const signature = signer.sign(privateKey.replace(/\\n/g, "\n")).toString("base64url");
  const jwt = `${toSign}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Falha ao obter token Google: ${tokenRes.status}`);
  }
  const data = (await tokenRes.json()) as { access_token: string };
  return data.access_token;
}
