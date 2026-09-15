import { z } from 'zod';

/** Shape of the JWT payload signed into the session token. */
export const sessionPayloadSchema = z.object({
  sub: z.string().uuid(), // user id
  jti: z.string().uuid(), // session id (matches the `sessions` table row)
  cpf: z.string().length(11),
  name: z.string(),
  phone: z.string().min(10).max(11),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export const meResponseSchema = z.object({
  id: z.string().uuid(),
  cpf: z.string().length(11),
  name: z.string(),
  phone: z.string().min(10).max(11),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
