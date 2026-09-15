import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

export const DRIZZLE = Symbol('DRIZZLE');

export type Database = ReturnType<typeof drizzle<typeof schema>>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (): Database => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          // Don't crash the whole app on boot (useful for routes/tests that
          // never touch the database). Any query will fail with a clear
          // connection error until DATABASE_URL is configured.
          console.warn(
            '[DbModule] DATABASE_URL is not set - database queries will fail until it is configured.',
          );
        }
        return drizzle(
          connectionString ?? 'postgresql://user:password@localhost:5432/db',
          { schema },
        );
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule {}
