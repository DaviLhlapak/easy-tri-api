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

@Injectable()
export class ZodResponseInterceptor implements NestInterceptor {
  constructor(private readonly schema: ZodType) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        const result = this.schema.safeParse(data);
        if (!result.success) {
          throw new InternalServerErrorException(
            'Response failed schema validation',
          );
        }
        return result.data;
      }),
    );
  }
}
