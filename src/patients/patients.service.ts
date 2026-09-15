import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../db/db.module.js';
import { patientProfiles } from '../db/schema.js';
import type { PatientProfileResponse, UpsertPatientProfileBody } from './schemas/patient-profile.schema.js';

@Injectable()
export class PatientsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getProfile(userId: string): Promise<PatientProfileResponse> {
    const [profile] = await this.db.select().from(patientProfiles).where(eq(patientProfiles.userId, userId));

    if (!profile) {
      throw new NotFoundException('patient profile not found');
    }

    return toResponse(profile);
  }

  async upsertProfile(userId: string, data: UpsertPatientProfileBody): Promise<PatientProfileResponse> {
    const [profile] = await this.db
      .insert(patientProfiles)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: patientProfiles.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();

    return toResponse(profile);
  }
}

function toResponse(profile: typeof patientProfiles.$inferSelect): PatientProfileResponse {
  return {
    userId: profile.userId,
    birthDate: profile.birthDate,
    maritalStatus: profile.maritalStatus,
    gender: profile.gender,
    educationLevel: profile.educationLevel,
    currentCity: profile.currentCity,
    currentState: profile.currentState,
    bornCity: profile.bornCity,
    bornState: profile.bornState,
    occupation: profile.occupation,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
