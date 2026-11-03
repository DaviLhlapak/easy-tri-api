import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Session } from '../auth/decorators/session.decorator.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { SessionPayload } from '../auth/schemas/session.schema.js';
import { ZodResponseInterceptor } from '../common/interceptors/zod-response.interceptor.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { Clinic } from '../db/schema.js';
import { CurrentClinic } from '../tenant/decorators/current-clinic.decorator.js';
import {
  createTriageBodySchema,
  triageResponseSchema,
  updateTriageStatusBodySchema,
  type CreateTriageBody,
  type UpdateTriageStatusBody,
} from './schemas/triage.schema.js';
import { TriagesService } from './triages.service.js';
import {
  InjectDisk,
  StorageDisk,
  StoredUpload,
  uploadToDisk,
} from '@nestjs/storage';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ALLOWED_EXAM_MIME_TYPES,
  MAX_EXAM_FILE_SIZE_BYTES,
  MAX_EXAM_FILES_PER_UPLOAD,
} from './exam-file-rules.js';
import {
  triagesPendingCountResponseSchema,
  triagesResponseSchema,
} from './schemas/triages.schema.js';

@Controller('triages')
@UseGuards(AuthGuard, RolesGuard)
export class TriagesController {
  constructor(
    private readonly triagesService: TriagesService,
    @InjectDisk('exams') private readonly exams: StorageDisk,
  ) {}

  @Post()
  @Roles('patient', 'guest')
  @UseInterceptors(
    FilesInterceptor('exams', MAX_EXAM_FILES_PER_UPLOAD, {
      storage: uploadToDisk({
        disk: 'exams',
        contentTypes: ALLOWED_EXAM_MIME_TYPES,
      }),
      limits: {
        fileSize: MAX_EXAM_FILE_SIZE_BYTES,
        files: MAX_EXAM_FILES_PER_UPLOAD,
      },
    }),
  )
  @UseInterceptors(new ZodResponseInterceptor(triageResponseSchema))
  create(
    @CurrentClinic() clinic: Clinic,
    @Session() session: SessionPayload,
    @Body(new ZodValidationPipe(createTriageBodySchema)) body: CreateTriageBody,
    @UploadedFiles() exams: StoredUpload[] | undefined,
  ) {
    return this.triagesService.createTriage(
      clinic.id,
      session.sub,
      body,
      exams,
    );
  }

  @Patch(':id/status')
  @Roles('doctor')
  @UseInterceptors(new ZodResponseInterceptor(triageResponseSchema))
  updateStatus(
    @CurrentClinic() clinic: Clinic,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTriageStatusBodySchema))
    body: UpdateTriageStatusBody,
  ) {
    return this.triagesService.updateTriageStatus(clinic.id, id, body);
  }

  @Get('pending-count')
  @Roles('doctor')
  @UseInterceptors(
    new ZodResponseInterceptor(triagesPendingCountResponseSchema),
  )
  getPendingCount(@CurrentClinic() clinic: Clinic) {
    return this.triagesService.getPendingTriagesCount(clinic.id);
  }

  @Get(':id')
  @Roles('doctor')
  @UseInterceptors(new ZodResponseInterceptor(triageResponseSchema))
  getById(@CurrentClinic() clinic: Clinic, @Param('id') id: string) {
    return this.triagesService.getTriageById(clinic.id, id);
  }

  @Get()
  @Roles('doctor')
  @UseInterceptors(new ZodResponseInterceptor(triagesResponseSchema))
  getTriages(@CurrentClinic() clinic: Clinic) {
    return this.triagesService.getTriages(clinic.id);
  }
}
