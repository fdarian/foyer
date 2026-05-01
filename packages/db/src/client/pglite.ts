import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

export const createPgliteClient = (path: string) => {
  mkdirSync(dirname(path), { recursive: true });
  const client = new PGlite(path);
  return drizzle(client);
};
