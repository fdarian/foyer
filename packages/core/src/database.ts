import { Context } from 'effect';
import type { createDatabaseClient } from '@foyer/db/client';

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class DatabaseClient extends Context.Tag('DatabaseClient')<
  DatabaseClient,
  DatabaseClient
>() {}
