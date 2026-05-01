import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

export const createPgliteClient = (path: string) => {
  const client = new PGlite(path);
  return drizzle(client);
};
