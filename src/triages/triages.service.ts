import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DRIZZLE, type Database } from '../db/db.module.js';
import {
  patients,
  triageConstitutionalSymptoms,
  triageHabits,
  triagePhysicalActivities,
  triagePhysicalSymptoms,
  triages,
} from '../db/schema.js';
import type {
  CreateTriageBody,
  TriageResponse,
} from './schemas/triage.schema.js';

@Injectable()
export class TriagesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async createTriage(
    clinicId: string,
    userId: string,
    body: CreateTriageBody,
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
      extraQueries.push(
        this.db.insert(triagePhysicalSymptoms).values({
          triageId,
          bodyPart: body.physicalSymptoms.bodyPart,
          answers: body.physicalSymptoms.answers,
        }),
      );
    }

    if (body.constitutionalSymptom) {
      extraQueries.push(
        this.db.insert(triageConstitutionalSymptoms).values({
          triageId,
          symptom: body.constitutionalSymptom.symptom,
          intensity: body.constitutionalSymptom.intensity,
          quantity: body.constitutionalSymptom.quantity,
        }),
      );
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

    // The neon-http driver doesn't support db.transaction(), but batch()
    // runs every query as a single atomic transaction over one HTTP call.
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

    const [[physicalSymptoms], [constitutionalSymptom], [physicalActivity], [habits]] =
      await Promise.all([
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
      physicalSymptoms ?? null,
      constitutionalSymptom ?? null,
      physicalActivity ?? null,
      habits ?? null,
    );
  }
}

function toResponse(
  triage: typeof triages.$inferSelect,
  physicalSymptoms: typeof triagePhysicalSymptoms.$inferSelect | null,
  constitutionalSymptom:
    | typeof triageConstitutionalSymptoms.$inferSelect
    | null,
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
    physicalSymptoms: physicalSymptoms
      ? {
          bodyPart: physicalSymptoms.bodyPart,
          answers: physicalSymptoms.answers as {
            questionKey: string;
            answer: unknown;
          }[],
        }
      : null,
    constitutionalSymptom: constitutionalSymptom
      ? {
          symptom: constitutionalSymptom.symptom,
          intensity: constitutionalSymptom.intensity,
          quantity: constitutionalSymptom.quantity,
        }
      : null,
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
