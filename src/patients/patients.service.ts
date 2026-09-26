import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../db/db.module.js';
import { patients } from '../db/schema.js';
import type {
  PatientProfileResponse,
  UpsertPatientProfileBody,
} from './schemas/patient-profile.schema.js';

@Injectable()
export class PatientsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getProfile(
    clinicId: string,
    userId: string,
  ): Promise<PatientProfileResponse> {
    const [profile] = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.clinicId, clinicId), eq(patients.userId, userId)));

    if (!profile) {
      throw new NotFoundException('patient profile not found');
    }

    return toResponse(profile);
  }

  async upsertProfile(
    clinicId: string,
    userId: string,
    data: UpsertPatientProfileBody,
  ): Promise<PatientProfileResponse> {
    const [profile] = await this.db
      .insert(patients)
      .values({ clinicId, userId, ...data })
      .onConflictDoUpdate({
        target: patients.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();

    return toResponse(profile);
  }
}

function toResponse(
  profile: typeof patients.$inferSelect,
): PatientProfileResponse {
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
    previousIllnesses: profile.previousIllnesses,
    previousSurgeries: profile.previousSurgeries,
    familyMedicalHistory: profile.familyMedicalHistory,
    medications: profile.medications,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
