import {
  CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import type { Request } from 'express';
import { DRIZZLE, type Database } from '../../db/db.module.js';
import { sessions } from '../../db/schema.js';
import {
  sessionPayloadSchema,
  type SessionPayload,
} from '../schemas/session.schema.js';

declare module 'express' {
  interface Request {
    session?: SessionPayload;
  }
}

/**
 * Verifies the caller sent a valid, signed session (JWT) in the
 * `Authorization: Bearer <token>` header, and that the matching session row
 * in the database (keyed by the token's `jti` claim) exists, is unexpired
 * and hasn't been revoked. Exposes the payload as `request.session` for
 * downstream handlers.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE) private readonly db: Database,
  ) {}

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

    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, result.data.jti));

    if (
      !session ||
      session.revokedAt ||
      Date.now() > session.expiresAt.getTime()
    ) {
      throw new UnauthorizedException('invalid or expired session');
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
