import { z } from 'zod';

/** Shape of the JWT payload signed into the session token. */
export const sessionPayloadSchema = z.object({
  sub: z.uuid(), // user id
  jti: z.uuid(), // session id (matches the `sessions` table row)
  clinicId: z.uuid(),
  cpf: z.string().length(11),
  name: z.string(),
  phone: z.string().min(10).max(11),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export const meResponseSchema = z.object({
  id: z.uuid(),
  // Masked, e.g. "***.***.***-09" - see src/common/utils/mask.ts
  cpf: z.string().regex(/^\*{3}\.\*{3}\.\*{3}-\d{2}$/),
  name: z.string(),
  phone: z.string().min(10).max(11),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
