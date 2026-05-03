import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import * as BunHttpServer from '@effect/platform-bun/BunHttpServer';
import { DatabaseClient, type DatabaseClientType } from '@foyer/core/database';
import { createDatabaseClient, migratePglite } from '@foyer/db/client';
import { Config, type Effect, Layer } from 'effect';
import { ApiLive, server } from './server/main.ts';

const findMigrationsPath = (startDir: string): string => {
  let dir = startDir;
  while (true) {
    const candidate = resolve(dir, 'packages', 'db', 'drizzle');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error('Could not find migrations directory');
    }
    dir = parent;
  }
};

const isCompiledBinary = import.meta.path.includes('$bunfs');

// @ts-expect-error - only resolved at compile time in binary
import pgliteDataPath from '../../../node_modules/.bun/@electric-sql+pglite@0.3.16/node_modules/@electric-sql/pglite/dist/pglite.data' with {
  type: 'file',
};
// @ts-expect-error - only resolved at compile time in binary
import pgliteWasmPath from '../../../node_modules/.bun/@electric-sql+pglite@0.3.16/node_modules/@electric-sql/pglite/dist/pglite.wasm' with {
  type: 'file',
};

export const boot = async (): Promise<Effect.Effect<never, never, never>> => {
  console.log('[boot] process.cwd():', process.cwd());
  console.log('[boot] process.argv[1]:', process.argv[1]);
  const pglitePath = isCompiledBinary
    ? ':memory:'
    : resolve(process.cwd(), 'data', 'pglite');
  process.env.DATABASE_LITE_PATH = pglitePath;

  let client: DatabaseClientType;
  if (isCompiledBinary) {
    const fsBundle = Bun.file(pgliteDataPath);
    const wasmBuffer = await Bun.file(pgliteWasmPath).arrayBuffer();
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    client = createDatabaseClient({ fsBundle, wasmModule });
  } else {
    client = createDatabaseClient();
  }

  if (process.env.DATABASE_LITE !== 'false') {
    const migrationsPath = findMigrationsPath(process.cwd());
    await migratePglite(
      client as Parameters<typeof migratePglite>[0],
      migrationsPath,
    );
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
      Layer.mergeAll(
        ApiLive.pipe(Layer.provide(DatabaseClientLive)),
        DatabaseClientLive,
        ContextLayers,
      ),
    ),
  );

  return Layer.launch(ServerLive) as Effect.Effect<never, never, never>;
};
