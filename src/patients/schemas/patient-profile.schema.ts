import { z } from 'zod';

export const maritalStatusValues = ['single', 'married', 'divorced', 'widowed', 'other'] as const;
export const genderValues = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export const educationLevelValues = [
  'none',
  'elementary',
  'high_school',
  'technical',
  'undergraduate',
  'postgraduate',
  'master',
  'doctorate',
] as const;

const stateCode = z
  .string()
  .trim()
  .length(2, 'state must be a 2-letter code')
  .transform((value) => value.toUpperCase());

export const upsertPatientProfileBodySchema = z.object({
  birthDate: z.iso.date(),
  maritalStatus: z.enum(maritalStatusValues),
  gender: z.enum(genderValues),
  educationLevel: z.enum(educationLevelValues),
  currentCity: z.string().trim().min(1).max(255),
  currentState: stateCode,
  bornCity: z.string().trim().min(1).max(255),
  bornState: stateCode,
  occupation: z.string().trim().min(1).max(255),
});

export type UpsertPatientProfileBody = z.infer<typeof upsertPatientProfileBodySchema>;

export const patientProfileResponseSchema = z.object({
  userId: z.uuid(),
  birthDate: z.iso.date(),
  maritalStatus: z.enum(maritalStatusValues),
  gender: z.enum(genderValues),
  educationLevel: z.enum(educationLevelValues),
  currentCity: z.string(),
  currentState: z.string(),
  bornCity: z.string(),
  bornState: z.string(),
  occupation: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type PatientProfileResponse = z.infer<typeof patientProfileResponseSchema>;
