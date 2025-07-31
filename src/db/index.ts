import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import ENV from '@src/common/constants/ENV';

const pool = new Pool({
  connectionString: ENV.PgConnectionString,
});

export const db = drizzle(pool, { schema });
export { schema };