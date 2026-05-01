import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const createPostgresClient = (url: string) => {
  const client = postgres(url);
  return drizzle(client);
};
