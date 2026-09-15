import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { SessionPayload } from '../schemas/session.schema.js';

/**
 * Extracts the authenticated session payload set by AuthGuard.
 * Only usable on routes protected by @UseGuards(AuthGuard).
 */
export const Session = createParamDecorator((_data: unknown, ctx: ExecutionContext): SessionPayload => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.session!;
});
