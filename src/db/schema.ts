import {
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  cpf: varchar('cpf', { length: 11 }).notNull().unique(),
  phone: varchar('phone', { length: 11 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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
  userId: uuid('user_id')
    .primaryKey()
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
