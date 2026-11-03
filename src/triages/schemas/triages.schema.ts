import z from 'zod';
import { triageStatusValues, triageTypeValues } from './triage.schema.js';

export const triagesResponseSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    cpf: z.string().regex(/^\*{3}\.\*{3}\.\*{3}-\d{2}$/),
    triageType: z.enum(triageTypeValues),
    status: z.enum(triageStatusValues),
    renewPrescription: z.boolean(),
    requestMedicalExams: z.boolean(),
    createdAt: z.iso.datetime(),
  })
  .array();

export type TriagesResponse = z.infer<typeof triagesResponseSchema>;

export const triagesPendingCountResponseSchema = z.object({
  count: z.number().int().nonnegative(),
});

export type TriagesPendingCountResponse = z.infer<
  typeof triagesPendingCountResponseSchema
>;
