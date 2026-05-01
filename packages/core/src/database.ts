import type { createDatabaseClient } from '@foyer/db/client';
import { Context } from 'effect';

export type DatabaseClientType = ReturnType<typeof createDatabaseClient>;

export class DatabaseClient extends Context.Tag('DatabaseClient')<
  DatabaseClient,
  DatabaseClientType
>() {}
