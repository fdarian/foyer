import { createPgliteClient } from './pglite';
import { createPostgresClient } from './postgres';

export function createDatabaseClient() {
  if (process.env.DATABASE_LITE === 'false') {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is required when DATABASE_LITE=false');
    }
    return createPostgresClient(url);
  }
  const path =
    process.env.DATABASE_LITE_PATH ?? 'services/engine/data/pglite/';
  return createPgliteClient(path);
}
