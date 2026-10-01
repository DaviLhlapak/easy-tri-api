import { z } from 'zod';

export const triageTypeValues = [
  'new',
  'follow-up',
  'return',
  'routine',
] as const;

// Reflects the patient's position in the clinic's flow: they submit the
// intake form and wait in line ('waiting'), staff analyzes what they
// submitted ('in_review'), they get called in and are seen by the doctor
// ('in_progress'), and finally the visit wraps up ('completed').
// 'cancelled' covers no-shows/withdrawals.
export const triageStatusValues = [
  'waiting',
  'in_review',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export const symptomIntensityValues = ['mild', 'moderate', 'severe'] as const;

export const alcoholStatusValues = ['never', 'former', 'current'] as const;
export const smokingStatusValues = ['never', 'former', 'current'] as const;

// A patient can select several body parts, each with its own answers.
// The questionnaire varies by body part and medical type, so answers
// are a flexible key/value map rather than a fixed set of fields.
const physicalSymptomEntrySchema = z.object({
  bodyPart: z.string().trim().min(1).max(100),
  answers: z.record(z.string().trim().min(1).max(100), z.unknown()),
});

const constitutionalSymptomEntrySchema = z.object({
  symptom: z.string().trim().min(1).max(100),
  intensity: z.enum(symptomIntensityValues),
  quantity: z.number().int().min(1).default(1),
});

const physicalActivitySchema = z.object({
  name: z.string().trim().min(1).max(255),
  daysPerWeek: z.number().int().min(0).max(7),
  minutesPerDay: z.number().int().min(0),
});

const habitsSchema = z.object({
  alcoholStatus: z.enum(alcoholStatusValues).default('never'),
  alcoholFrequency: z.string().trim().min(1).max(100).nullish(),
  alcoholQuantity: z.string().trim().min(1).max(100).nullish(),
  smokingStatus: z.enum(smokingStatusValues).default('never'),
  cigarettesPerDay: z.number().int().min(0).nullish(),
  smokingYears: z.number().int().min(0).nullish(),
  dietDescription: z.string().trim().min(1).max(2000).nullish(),
  dietaryRestrictions: z.array(z.string().trim().min(1)).default([]),
});

export const createTriageBodySchema = z.object({
  triageType: z.enum(triageTypeValues),
  complaint: z.string().trim().min(1).max(2000).nullish(),
  renewPrescription: z.boolean().default(false),
  requestMedicalExams: z.boolean().default(false),
  physicalSymptoms: z.array(physicalSymptomEntrySchema).default([]),
  constitutionalSymptoms: z.array(constitutionalSymptomEntrySchema).default([]),
  physicalActivity: physicalActivitySchema.nullish(),
  habits: habitsSchema.nullish(),
});

export type CreateTriageBody = z.infer<typeof createTriageBodySchema>;

export const triageResponseSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  triageType: z.enum(triageTypeValues),
  status: z.enum(triageStatusValues),
  complaint: z.string().nullable(),
  renewPrescription: z.boolean(),
  requestMedicalExams: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  physicalSymptoms: z.array(physicalSymptomEntrySchema).nullable().default([]),
  constitutionalSymptoms: z
    .array(constitutionalSymptomEntrySchema)
    .nullable()
    .default([]),
  physicalActivity: physicalActivitySchema.nullable(),
  habits: habitsSchema.nullable(),
});

export type TriageResponse = z.infer<typeof triageResponseSchema>;
