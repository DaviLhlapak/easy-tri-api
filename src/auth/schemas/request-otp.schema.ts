import { z } from 'zod';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const requestOtpBodySchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  cpf: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length === 11, 'cpf must have 11 digits'),
  phone: z
    .string()
    .transform(onlyDigits)
    .refine(
      (value) => value.length >= 10 && value.length <= 11,
      'phone must have 10 or 11 digits',
    ),
});

export type RequestOtpBody = z.infer<typeof requestOtpBodySchema>;

export const requestOtpResponseSchema = z.object({
  requestId: z.uuid(),
  code: z.string().regex(/^\d{6}$/),
  expiresAt: z.iso.datetime(),
});

export type RequestOtpResponse = z.infer<typeof requestOtpResponseSchema>;
