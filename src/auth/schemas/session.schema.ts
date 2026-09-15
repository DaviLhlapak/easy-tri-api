import { z } from 'zod';

/** Shape of the JWT payload signed into the session token. */
export const sessionPayloadSchema = z.object({
  sub: z.string().length(11), // cpf
  name: z.string(),
  phone: z.string().min(10).max(11),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export const meResponseSchema = z.object({
  cpf: z.string().length(11),
  name: z.string(),
  phone: z.string().min(10).max(11),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
