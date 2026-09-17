import { z } from 'zod';

export const verifyOtpBodySchema = z.object({
  requestId: z.uuid('requestId must be a valid uuid'),
  code: z.string().regex(/^\d{6}$/, 'code must be a 6-digit number'),
});

export type VerifyOtpBody = z.infer<typeof verifyOtpBodySchema>;

export const verifyOtpResponseSchema = z.object({
  session: z.string().min(1),
  user: z.object({
    name: z.string(),
    cpf: z.string().regex(/^\*{3}\.\*{3}\.\*{3}-\d{2}$/),
    phone: z.string().min(10).max(11),
  }),
});

export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;
