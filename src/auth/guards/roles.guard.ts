import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY, type Role } from '../decorators/roles.decorator.js';

/**
 * Enforces the roles set by `@Roles(...)` on a route or controller.
 * Requires `AuthGuard` to run first, since it reads `request.session`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session;

    if (!session || !requiredRoles.includes(session.type)) {
      throw new ForbiddenException(
        'you do not have permission to access this resource',
      );
    }

    return true;
  }
}
