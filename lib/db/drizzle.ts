import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as supabaseSchema from './supabase-schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const connectionString = `${process.env.POSTGRES_URL}?sslmode=require`;

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export const supabaseDb = drizzle(client, { schema: supabaseSchema });
