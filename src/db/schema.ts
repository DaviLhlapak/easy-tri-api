import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const clinics = pgTable('clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  subdomain: varchar('subdomain', { length: 63 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    cpf: varchar('cpf', { length: 11 }).notNull(),
    phone: varchar('phone', { length: 11 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('users_clinic_cpf_idx').on(table.clinicId, table.cpf),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const verificationCodes = pgTable('verification_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type VerificationCode = typeof verificationCodes.$inferSelect;
export type NewVerificationCode = typeof verificationCodes.$inferInsert;

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export const maritalStatusEnum = pgEnum('marital_status', [
  'single',
  'married',
  'divorced',
  'widowed',
  'other',
]);

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

export const educationLevelEnum = pgEnum('education_level', [
  'none',
  'elementary',
  'high_school',
  'technical',
  'undergraduate',
  'postgraduate',
]);

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  birthDate: date('birth_date', { mode: 'string' }).notNull(),
  maritalStatus: maritalStatusEnum('marital_status').notNull(),
  gender: genderEnum('gender').notNull(),
  educationLevel: educationLevelEnum('education_level').notNull(),
  currentCity: varchar('current_city', { length: 255 }).notNull(),
  currentState: varchar('current_state', { length: 2 }).notNull(),
  bornCity: varchar('born_city', { length: 255 }).notNull(),
  bornState: varchar('born_state', { length: 2 }).notNull(),
  occupation: varchar('occupation', { length: 255 }).notNull(),
  previousIllnesses: text('previous_illnesses').array().notNull().default([]),
  previousSurgeries: text('previous_surgeries').array().notNull().default([]),
  familyMedicalHistory: text('family_medical_history'),
  medications: text('medications').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export const triageTypeEnum = pgEnum('triage_type', [
  'new',
  'follow-up',
  'return',
  'routine',
]);

export const triageStatusEnum = pgEnum('triage_status', [
  'waiting',
  'in_review',
  'in_progress',
  'completed',
  'cancelled',
]);

export const triages = pgTable('triages', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  triageType: triageTypeEnum('triage_type').notNull(),
  status: triageStatusEnum('status').notNull().default('waiting'),
  complaint: text('complaint'),
  renewPrescription: boolean('renew_prescription').notNull().default(false),
  requestMedicalExams: boolean('request_medical_exams')
    .notNull()
    .default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Triage = typeof triages.$inferSelect;
export type NewTriage = typeof triages.$inferInsert;

export const triageExams = pgTable('triage_exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  triageId: uuid('triage_id')
    .notNull()
    .references(() => triages.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
});

export type TriageExam = typeof triageExams.$inferSelect;
export type NewTriageExam = typeof triageExams.$inferInsert;

export const triagePhysicalSymptoms = pgTable(
  'triage_physical_symptoms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    triageId: uuid('triage_id')
      .notNull()
      .references(() => triages.id, { onDelete: 'cascade' }),
    bodyPart: varchar('body_part', { length: 100 }).notNull(),
    answers: jsonb('answers').notNull().default({}),
  },
  (table) => [
    uniqueIndex('triage_physical_symptoms_triage_body_part_idx').on(
      table.triageId,
      table.bodyPart,
    ),
  ],
);

export type TriagePhysicalSymptom = typeof triagePhysicalSymptoms.$inferSelect;
export type NewTriagePhysicalSymptom =
  typeof triagePhysicalSymptoms.$inferInsert;

export const symptomIntensityEnum = pgEnum('symptom_intensity', [
  'mild',
  'moderate',
  'severe',
]);

export const triageConstitutionalSymptoms = pgTable(
  'triage_constitutional_symptoms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    triageId: uuid('triage_id')
      .notNull()
      .references(() => triages.id, { onDelete: 'cascade' }),
    symptom: varchar('symptom', { length: 100 }).notNull(),
    intensity: symptomIntensityEnum('intensity').notNull(),
    quantity: integer('quantity'),
  },
  (table) => [
    uniqueIndex('triage_constitutional_symptoms_triage_symptom_idx').on(
      table.triageId,
      table.symptom,
    ),
  ],
);

export type TriageConstitutionalSymptom =
  typeof triageConstitutionalSymptoms.$inferSelect;
export type NewTriageConstitutionalSymptom =
  typeof triageConstitutionalSymptoms.$inferInsert;

export const triagePhysicalActivities = pgTable('triage_physical_activities', {
  triageId: uuid('triage_id')
    .primaryKey()
    .references(() => triages.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  daysPerWeek: integer('days_per_week').notNull(),
  minutesPerDay: integer('minutes_per_day').notNull(),
});

export type TriagePhysicalActivity =
  typeof triagePhysicalActivities.$inferSelect;
export type NewTriagePhysicalActivity =
  typeof triagePhysicalActivities.$inferInsert;

export const alcoholStatusEnum = pgEnum('alcohol_status', [
  'never',
  'former',
  'current',
]);

export const smokingStatusEnum = pgEnum('smoking_status', [
  'never',
  'former',
  'current',
]);

export const triageHabits = pgTable('triage_habits', {
  triageId: uuid('triage_id')
    .primaryKey()
    .references(() => triages.id, { onDelete: 'cascade' }),
  alcoholStatus: alcoholStatusEnum('alcohol_status').notNull().default('never'),
  alcoholFrequency: varchar('alcohol_frequency', { length: 100 }),
  alcoholQuantity: varchar('alcohol_quantity', { length: 100 }),
  smokingStatus: smokingStatusEnum('smoking_status').notNull().default('never'),
  cigarettesPerDay: integer('cigarettes_per_day'),
  smokingYears: integer('smoking_years'),
  dietDescription: text('diet_description'),
  dietaryRestrictions: text('dietary_restrictions')
    .array()
    .notNull()
    .default([]),
});

export type TriageHabits = typeof triageHabits.$inferSelect;
export type NewTriageHabits = typeof triageHabits.$inferInsert;
