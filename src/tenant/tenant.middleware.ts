import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  type NestMiddleware,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { DRIZZLE, type Database } from '../db/db.module.js';
import { clinics, type Clinic } from '../db/schema.js';
import { CLINIC_SUBDOMAIN_HEADER } from './tenant.constants.js';

declare module 'express' {
  interface Request {
    clinic?: Clinic;
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers[CLINIC_SUBDOMAIN_HEADER];
    const subdomain = Array.isArray(header) ? header[0] : header;

    if (!subdomain || !subdomain.trim()) {
      throw new BadRequestException(
        `missing "${CLINIC_SUBDOMAIN_HEADER}" header`,
      );
    }

    const normalizedSubdomain = subdomain.trim().toLowerCase();

    const [clinic] = await this.db
      .select()
      .from(clinics)
      .where(eq(clinics.subdomain, normalizedSubdomain));

    if (!clinic || !clinic.isActive) {
      throw new NotFoundException('clinic not found');
    }

    req.clinic = clinic;
    next();
  }
}
