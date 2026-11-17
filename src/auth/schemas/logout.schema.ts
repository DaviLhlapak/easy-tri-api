import { z } from 'zod';

export const logoutResponseSchema = z.object({
  revoked: z.boolean(),
});

export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
