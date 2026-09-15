import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const db = drizzle(connectionString);

await migrate(db, { migrationsFolder: './drizzle' });

console.log('Migrations applied successfully');
