import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

export const createPgliteClient = (path: string) => {
  mkdirSync(dirname(path), { recursive: true });
  const client = new PGlite(path);
  return drizzle(client);
};
