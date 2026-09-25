import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Clinic } from '../../db/schema.js';

export const CurrentClinic = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Clinic => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.clinic!;
  },
);
