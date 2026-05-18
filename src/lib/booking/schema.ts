import { z } from "zod";

export const bookingDraftSchema = z.object({
  serviceSlugs: z.array(z.string().min(1)).min(1).max(4),
  unitSlug: z.string().min(1),
  staffSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  comboSlug: z.string().min(1).optional(),
});

export const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

export const contactSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo."),
  email: z.string().email("E-mail inválido."),
  phone: z
    .string()
    .regex(phoneRegex, "Use formato (86) 9XXXX-XXXX.")
    .transform((v) => v.replace(/\D/g, "")),
  notes: z.string().max(500).optional().default(""),
  consents: z.object({
    privacy_policy: z.literal(true, {
      errorMap: () => ({ message: "Aceite obrigatório para agendar." }),
    }),
    terms_of_use: z.literal(true, {
      errorMap: () => ({ message: "Aceite obrigatório para agendar." }),
    }),
    marketing_email: z.boolean().default(false),
    create_account: z.boolean().default(false),
  }),
});

export const bookingCreateSchema = bookingDraftSchema.merge(contactSchema);

export type BookingDraft = z.infer<typeof bookingDraftSchema>;
export type ContactPayload = z.infer<typeof contactSchema>;
export type BookingCreate = z.infer<typeof bookingCreateSchema>;
