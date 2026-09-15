import { CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { sessionPayloadSchema, type SessionPayload } from '../schemas/session.schema.js';

declare module 'express' {
  interface Request {
    session?: SessionPayload;
  }
}

/**
 * Verifies the caller sent a valid, signed session (JWT) in the
 * `Authorization: Bearer <token>` header, and exposes its payload as
 * `request.session` for downstream handlers.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('missing session token');
    }

    let payload: unknown;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('invalid or expired session');
    }

    const result = sessionPayloadSchema.safeParse(payload);
    if (!result.success) {
      throw new UnauthorizedException('invalid session payload');
    }

    request.session = result.data;
    return true;
  }
}

function extractBearerToken(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (!header) {
    return undefined;
  }
  const [type, token] = header.split(' ');
  return type === 'Bearer' && token ? token : undefined;
}
