import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Session } from '../auth/decorators/session.decorator.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import type { SessionPayload } from '../auth/schemas/session.schema.js';
import { ZodResponseInterceptor } from '../common/interceptors/zod-response.interceptor.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { Clinic } from '../db/schema.js';
import { CurrentClinic } from '../tenant/decorators/current-clinic.decorator.js';
import {
  createTriageBodySchema,
  triageResponseSchema,
  type CreateTriageBody,
} from './schemas/triage.schema.js';
import { TriagesService } from './triages.service.js';

@Controller('triages')
@UseGuards(AuthGuard)
export class TriagesController {
  constructor(private readonly triagesService: TriagesService) {}

  @Post()
  @UseInterceptors(new ZodResponseInterceptor(triageResponseSchema))
  create(
    @CurrentClinic() clinic: Clinic,
    @Session() session: SessionPayload,
    @Body(new ZodValidationPipe(createTriageBodySchema)) body: CreateTriageBody,
  ) {
    return this.triagesService.createTriage(clinic.id, session.sub, body);
  }

  @Get(':id')
  @UseInterceptors(new ZodResponseInterceptor(triageResponseSchema))
  getById(
    @CurrentClinic() clinic: Clinic,
    @Session() session: SessionPayload,
    @Param('id') id: string,
  ) {
    return this.triagesService.getTriageById(clinic.id, session.sub, id);
  }
}
