import { SetMetadata } from '@nestjs/common';
import type { SessionPayload } from '../schemas/session.schema.js';

export const ROLES_KEY = 'roles';

export type Role = SessionPayload['type'];

/**
 * Restricts a route to sessions whose `type` matches one of the given roles.
 * Must be combined with `@UseGuards(AuthGuard, RolesGuard)`, since RolesGuard
 * relies on `request.session` being set by AuthGuard.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
