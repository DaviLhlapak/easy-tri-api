import { z } from 'zod';

export const sessionPayloadSchema = z.object({
  sub: z.uuid(),
  jti: z.uuid(),
  clinicId: z.uuid(),
  cpf: z.string().length(11),
  name: z.string(),
  phone: z.string().min(10).max(11),
  type: z.enum(['doctor', 'patient', 'guest']),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export const meResponseSchema = z.object({
  id: z.uuid(),
  cpf: z.string().regex(/^\*{3}\.\*{3}\.\*{3}-\d{2}$/),
  name: z.string(),
  phone: z.string().min(10).max(11),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
