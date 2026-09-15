import {
  date,
  pgEnum,
  pgTable,
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

export const otpRequests = pgTable('otp_requests', {
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

export type OtpRequest = typeof otpRequests.$inferSelect;
export type NewOtpRequest = typeof otpRequests.$inferInsert;

// Sessions are also tracked in the database (keyed by the JWT's `jti` claim)
// so a session can be looked up/revoked server-side even though the token
// itself is a signed, stateless JWT.
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

export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'other',
  'prefer_not_to_say',
]);

export const educationLevelEnum = pgEnum('education_level', [
  'none',
  'elementary',
  'high_school',
  'technical',
  'undergraduate',
  'postgraduate',
  'master',
  'doctorate',
]);

// One-to-one profile table for the "patient" user type. The app has
// multiple user types; each gets its own profile table keyed by `userId`
// instead of cramming type-specific fields into `users`.
export const patientProfiles = pgTable('patient_profiles', {
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
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PatientProfile = typeof patientProfiles.$inferSelect;
export type NewPatientProfile = typeof patientProfiles.$inferInsert;
