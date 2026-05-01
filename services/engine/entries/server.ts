import * as BunHttpServer from '@effect/platform-bun/BunHttpServer';
import * as BunRuntime from '@effect/platform-bun/BunRuntime';
import { Config, Layer } from 'effect';
import { DatabaseClient } from '@foyer/core/database';
import { createDatabaseClient, migratePglite } from '@foyer/db/client';
import { ApiLive, server } from '../src/server/main.ts';

const pglitePath = new URL('../data/pglite', import.meta.url).pathname;
process.env.DATABASE_LITE_PATH = pglitePath;

const client = createDatabaseClient();

if (process.env.DATABASE_LITE !== 'false') {
  const migrationsPath = new URL(
    '../../../packages/db/drizzle',
    import.meta.url,
  ).pathname;
  await migratePglite(client as any, migrationsPath);
}

const DatabaseClientLive = Layer.succeed(DatabaseClient, client);

const ContextLayers = Layer.mergeAll(
  BunHttpServer.layerConfig(
    Config.all({
      port: Config.port('PORT').pipe(Config.withDefault('3301')),
    }),
  ),
);

const ServerLive = server.pipe(
  Layer.provide(
    ApiLive.pipe(
      Layer.provide(DatabaseClientLive),
      Layer.provideMerge(ContextLayers),
    ),
  ),
);

Layer.launch(ServerLive).pipe(BunRuntime.runMain);
