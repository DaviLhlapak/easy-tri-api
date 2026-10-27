import { z } from 'zod';

export const patientsResponseSchema = z
  .object({
    id: z.uuid(),
    cpf: z.string().regex(/^\*{3}\.\*{3}\.\*{3}-\d{2}$/),
    name: z.string(),
    phone: z
      .string()
      .min(10)
      .max(11)
      .regex(/^\*{6,7}\d{4}$/),
    birthDate: z.iso.date(),
    updatedAt: z.iso.datetime(),
  })
  .array();

export type PatientsResponse = z.infer<typeof patientsResponseSchema>;
