import { migrate as pgliteMigrate } from 'drizzle-orm/pglite/migrator';
import type { createPgliteClient } from './pglite';

export async function migratePglite(
  db: ReturnType<typeof createPgliteClient>,
  migrationsFolder: string,
) {
  await pgliteMigrate(db, { migrationsFolder });
}
