import { config } from 'dotenv';
import path from 'path';

// Load the specific env file
config({ path: path.resolve(process.cwd(), 'config/.env.development') });


import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.PG_CONNECTION_STRING!,
  },
});