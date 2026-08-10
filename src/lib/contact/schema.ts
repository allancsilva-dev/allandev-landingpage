import { z } from "zod";

export const projectTypes = [
  "site",
  "sistema-web",
  "api",
  "mobile",
  "banco-de-dados",
  "infraestrutura",
  "consultoria",
  "outro",
] as const;

export const contactSchema = z.object({
  nome: z.string().trim().min(2).max(80),
  email: z.email().max(254),
  empresa: z.string().trim().max(80).optional().default(""),
  tipoProjeto: z.enum(projectTypes),
  mensagem: z.string().trim().min(20).max(2000),
  consentimento: z.literal(true),
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().min(1).max(2048),
  requestId: z.uuid(),
});

export type ContactInput = z.infer<typeof contactSchema>;
