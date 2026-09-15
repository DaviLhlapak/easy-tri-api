import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  InternalServerErrorException,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ZodType } from 'zod';

/**
 * Validates (and strips unknown fields from) a handler's response payload
 * against a zod schema before it is sent to the client. This guarantees the
 * API never returns data that doesn't match its documented contract.
 */
@Injectable()
export class ZodResponseInterceptor implements NestInterceptor {
  constructor(private readonly schema: ZodType) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        const result = this.schema.safeParse(data);
        if (!result.success) {
          throw new InternalServerErrorException('Response failed schema validation');
        }
        return result.data;
      }),
    );
  }
}
