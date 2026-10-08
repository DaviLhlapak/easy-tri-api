import { z } from 'zod';
import { preprocessJsonFromFormData } from '../../common/utils/formdata.js';

export const triageTypeValues = [
  'new',
  'follow-up',
  'return',
  'routine',
] as const;

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

const physicalSymptomEntrySchema = z.object({
  bodyPart: z.string().trim().min(1).max(100),
  answers: z.record(z.string().trim().min(1).max(100), z.unknown()),
});

const constitutionalSymptomEntrySchema = z.object({
  symptom: z.string().trim().min(1).max(100),
  intensity: z.enum(symptomIntensityValues),
  quantity: z.number().int().min(1).optional(),
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
  renewPrescription: z.string().transform((value) => value === 'true'),
  requestMedicalExams: z.string().transform((value) => value === 'true'),
  physicalSymptoms: z.preprocess(
    preprocessJsonFromFormData,
    z.array(physicalSymptomEntrySchema).default([]).nullish(),
  ),
  constitutionalSymptoms: z.preprocess(
    preprocessJsonFromFormData,
    z.array(constitutionalSymptomEntrySchema).default([]).nullish(),
  ),
  physicalActivity: z.preprocess(
    preprocessJsonFromFormData,
    physicalActivitySchema.nullish(),
  ),
  habits: z.preprocess(preprocessJsonFromFormData, habitsSchema.nullish()),
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
