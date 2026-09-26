import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Session } from '../auth/decorators/session.decorator.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { SessionPayload } from '../auth/schemas/session.schema.js';
import { ZodResponseInterceptor } from '../common/interceptors/zod-response.interceptor.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { CurrentClinic } from '../tenant/decorators/current-clinic.decorator.js';
import type { Clinic } from '../db/schema.js';
import { PatientsService } from './patients.service.js';
import {
  patientProfileResponseSchema,
  upsertPatientProfileBodySchema,
  type UpsertPatientProfileBody,
} from './schemas/patient-profile.schema.js';

@Controller('patients')
@UseGuards(AuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('me')
  @UseInterceptors(new ZodResponseInterceptor(patientProfileResponseSchema))
  getMyProfile(
    @CurrentClinic() clinic: Clinic,
    @Session() session: SessionPayload,
  ) {
    return this.patientsService.getProfile(clinic.id, session.sub);
  }

  @Put('me')
  @UseInterceptors(new ZodResponseInterceptor(patientProfileResponseSchema))
  upsertMyProfile(
    @CurrentClinic() clinic: Clinic,
    @Session() session: SessionPayload,
    @Body(new ZodValidationPipe(upsertPatientProfileBodySchema))
    body: UpsertPatientProfileBody,
  ) {
    return this.patientsService.upsertProfile(clinic.id, session.sub, body);
  }
}
