type CreatePixParams = {
  bookingId: string;
  amountCents: number;
  payerEmail: string;
  payerName: string;
  description: string;
};

export type PixPayment = {
  providerPaymentId: string;
  amountCents: number;
  pixQrCode: string;
  pixQrBase64: string;
  pixCopyPaste: string;
  expiresAt: string;
};

/**
 * Cria cobrança Pix via Mercado Pago.
 * Custo: 0,99% por transação Pix (pago pelo recebedor — Silvia).
 * Sem mensalidade nem setup fee.
 */
export async function createPixPayment(params: CreatePixParams): Promise<PixPayment | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;

  const [firstName, ...rest] = params.payerName.split(" ");
  const lastName = rest.join(" ") || "—";
  const idempotencyKey = `booking-${params.bookingId}`;

  const res = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      transaction_amount: params.amountCents / 100,
      description: params.description,
      payment_method_id: "pix",
      external_reference: params.bookingId,
      payer: {
        email: params.payerEmail,
        first_name: firstName,
        last_name: lastName,
      },
      date_of_expiration: new Date(Date.now() + 30 * 60_000).toISOString(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mercado Pago ${res.status}: ${body}`);
  }
  const data = (await res.json()) as {
    id: number;
    status: string;
    date_of_expiration: string;
    point_of_interaction?: {
      transaction_data?: {
        qr_code: string;
        qr_code_base64: string;
        ticket_url: string;
      };
    };
  };

  const tx = data.point_of_interaction?.transaction_data;
  if (!tx) throw new Error("Mercado Pago: resposta sem qr_code");

  return {
    providerPaymentId: String(data.id),
    amountCents: params.amountCents,
    pixQrCode: tx.qr_code,
    pixQrBase64: tx.qr_code_base64,
    pixCopyPaste: tx.qr_code,
    expiresAt: data.date_of_expiration,
  };
}
