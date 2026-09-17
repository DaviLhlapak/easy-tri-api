import { z } from 'zod';

export const maritalStatusValues = [
  'single',
  'married',
  'divorced',
  'widowed',
  'other',
] as const;
export const genderValues = ['male', 'female', 'other'] as const;
export const educationLevelValues = [
  'none',
  'elementary',
  'high_school',
  'technical',
  'undergraduate',
  'postgraduate',
] as const;

const stateCode = z
  .string()
  .trim()
  .length(2, 'state must be a 2-letter code')
  .transform((value) => value.toUpperCase());

const stringList = z.array(z.string().trim().min(1)).default([]);

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
  previousIllnesses: stringList,
  previousSurgeries: stringList,
  familyMedicalHistory: z.string().trim().min(1).max(2000).nullish(),
  medications: stringList,
});

export type UpsertPatientProfileBody = z.infer<
  typeof upsertPatientProfileBodySchema
>;

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
  previousIllnesses: z.array(z.string()),
  previousSurgeries: z.array(z.string()),
  familyMedicalHistory: z.string().nullable(),
  medications: z.array(z.string()),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type PatientProfileResponse = z.infer<
  typeof patientProfileResponseSchema
>;
