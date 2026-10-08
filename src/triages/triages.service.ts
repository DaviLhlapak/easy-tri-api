import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DRIZZLE, type Database } from '../db/db.module.js';
import {
  patients,
  triageConstitutionalSymptoms,
  triageExams,
  triageHabits,
  triagePhysicalActivities,
  triagePhysicalSymptoms,
  triages,
} from '../db/schema.js';
import type {
  CreateTriageBody,
  TriageResponse,
} from './schemas/triage.schema.js';
import { StoredUpload } from '@nestjs/storage';

@Injectable()
export class TriagesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async createTriage(
    clinicId: string,
    userId: string,
    body: CreateTriageBody,
    exams?: StoredUpload[],
  ): Promise<TriageResponse> {
    const [patient] = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.clinicId, clinicId), eq(patients.userId, userId)));

    if (!patient) {
      throw new NotFoundException(
        'patient profile not found - complete your profile before submitting a triage',
      );
    }

    const triageId = randomUUID();

    const queries = [
      this.db
        .insert(triages)
        .values({
          id: triageId,
          clinicId,
          patientId: patient.id,
          triageType: body.triageType,
          complaint: body.complaint ?? null,
          renewPrescription: body.renewPrescription,
          requestMedicalExams: body.requestMedicalExams,
        })
        .returning(),
    ] as const;

    const extraQueries = [];

    if (body.physicalSymptoms) {
      for (const entry of body.physicalSymptoms) {
        extraQueries.push(
          this.db.insert(triagePhysicalSymptoms).values({
            triageId,
            bodyPart: entry.bodyPart,
            answers: entry.answers,
          }),
        );
      }
    }

    if (body.constitutionalSymptoms) {
      for (const entry of body.constitutionalSymptoms) {
        extraQueries.push(
          this.db.insert(triageConstitutionalSymptoms).values({
            triageId,
            symptom: entry.symptom,
            intensity: entry.intensity,
            quantity: entry.quantity,
          }),
        );
      }
    }

    if (exams) {
      for (const exam of exams) {
        extraQueries.push(
          this.db.insert(triageExams).values({
            triageId,
            fileName: exam.originalname,
            mimeType: exam.mimetype,
            sizeBytes: exam.size,
            storageKey: exam.key,
          }),
        );
      }
    }

    if (body.physicalActivity) {
      extraQueries.push(
        this.db.insert(triagePhysicalActivities).values({
          triageId,
          name: body.physicalActivity.name,
          daysPerWeek: body.physicalActivity.daysPerWeek,
          minutesPerDay: body.physicalActivity.minutesPerDay,
        }),
      );
    }

    if (body.habits) {
      extraQueries.push(
        this.db.insert(triageHabits).values({
          triageId,
          alcoholStatus: body.habits.alcoholStatus,
          alcoholFrequency: body.habits.alcoholFrequency ?? null,
          alcoholQuantity: body.habits.alcoholQuantity ?? null,
          smokingStatus: body.habits.smokingStatus,
          cigarettesPerDay: body.habits.cigarettesPerDay ?? null,
          smokingYears: body.habits.smokingYears ?? null,
          dietDescription: body.habits.dietDescription ?? null,
          dietaryRestrictions: body.habits.dietaryRestrictions,
        }),
      );
    }

    await this.db.batch([...queries, ...extraQueries] as any);

    return this.getTriageById(clinicId, userId, triageId);
  }

  async getTriageById(
    clinicId: string,
    userId: string,
    triageId: string,
  ): Promise<TriageResponse> {
    const [row] = await this.db
      .select({ triage: triages, patient: patients })
      .from(triages)
      .innerJoin(patients, eq(triages.patientId, patients.id))
      .where(
        and(
          eq(triages.id, triageId),
          eq(triages.clinicId, clinicId),
          eq(patients.userId, userId),
        ),
      );

    if (!row) {
      throw new NotFoundException('triage not found');
    }

    const [
      physicalSymptoms,
      constitutionalSymptoms,
      [physicalActivity],
      [habits],
    ] = await Promise.all([
      this.db
        .select()
        .from(triagePhysicalSymptoms)
        .where(eq(triagePhysicalSymptoms.triageId, triageId)),
      this.db
        .select()
        .from(triageConstitutionalSymptoms)
        .where(eq(triageConstitutionalSymptoms.triageId, triageId)),
      this.db
        .select()
        .from(triagePhysicalActivities)
        .where(eq(triagePhysicalActivities.triageId, triageId)),
      this.db
        .select()
        .from(triageHabits)
        .where(eq(triageHabits.triageId, triageId)),
    ]);

    return toResponse(
      row.triage,
      physicalSymptoms,
      constitutionalSymptoms,
      physicalActivity ?? null,
      habits ?? null,
    );
  }
}

function toResponse(
  triage: typeof triages.$inferSelect,
  physicalSymptoms: (typeof triagePhysicalSymptoms.$inferSelect)[],
  constitutionalSymptoms: (typeof triageConstitutionalSymptoms.$inferSelect)[],
  physicalActivity: typeof triagePhysicalActivities.$inferSelect | null,
  habits: typeof triageHabits.$inferSelect | null,
): TriageResponse {
  return {
    id: triage.id,
    patientId: triage.patientId,
    triageType: triage.triageType,
    status: triage.status,
    complaint: triage.complaint,
    renewPrescription: triage.renewPrescription,
    requestMedicalExams: triage.requestMedicalExams,
    createdAt: triage.createdAt.toISOString(),
    updatedAt: triage.updatedAt.toISOString(),
    physicalSymptoms: physicalSymptoms.map((entry) => ({
      bodyPart: entry.bodyPart,
      answers: entry.answers as Record<string, unknown>,
    })),
    constitutionalSymptoms: constitutionalSymptoms.map((entry) => ({
      symptom: entry.symptom,
      intensity: entry.intensity,
      quantity: entry.quantity ?? undefined,
    })),
    physicalActivity: physicalActivity
      ? {
          name: physicalActivity.name,
          daysPerWeek: physicalActivity.daysPerWeek,
          minutesPerDay: physicalActivity.minutesPerDay,
        }
      : null,
    habits: habits
      ? {
          alcoholStatus: habits.alcoholStatus,
          alcoholFrequency: habits.alcoholFrequency,
          alcoholQuantity: habits.alcoholQuantity,
          smokingStatus: habits.smokingStatus,
          cigarettesPerDay: habits.cigarettesPerDay,
          smokingYears: habits.smokingYears,
          dietDescription: habits.dietDescription,
          dietaryRestrictions: habits.dietaryRestrictions,
        }
      : null,
  };
}
