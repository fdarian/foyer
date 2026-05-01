import { Command } from '@effect/cli';
import * as platform from '@effect/platform';
import { BunContext, BunRuntime } from '@effect/platform-bun';
import { Effect } from 'effect';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const findWorkspaceRoot = (startDir: string): Effect.Effect<string> =>
  Effect.sync(() => {
    let dir = startDir;
    while (true) {
      const packageJsonPath = resolve(dir, 'package.json');
      if (existsSync(packageJsonPath)) {
        const content = readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(content);
        if (Array.isArray(pkg.workspaces)) {
          return dir;
        }
      }
      const parent = dirname(dir);
      if (parent === dir) {
        throw new Error('Could not find workspace root');
      }
      dir = parent;
    }
  });

const serveCommand = Command.make(
  'serve',
  {},
  () =>
    Effect.gen(function* () {
      const workspaceRoot = yield* findWorkspaceRoot(import.meta.dir);
      const proc = yield* platform.Command.make(
        'bun',
        'run',
        '--cwd',
        resolve(workspaceRoot, 'services', 'engine'),
        'dev',
      ).pipe(
        platform.Command.stdout('inherit'),
        platform.Command.stderr('inherit'),
        platform.Command.start,
      );
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => proc.kill()).pipe(Effect.ignore),
      );
      yield* proc.exitCode;
    }).pipe(Effect.scoped),
).pipe(Command.withDescription('Start the Foyer engine'));

const webCommand = Command.make(
  'web',
  {},
  () =>
    Effect.gen(function* () {
      const embeddedAssets = yield* Effect.promise(() =>
        // @ts-expect-error - generated file at build time
        import('web-ui.gen.ts')
          .then((m) => m.default as Record<string, string>)
          .catch(() => null),
      );

      if (embeddedAssets) {
        yield* Effect.sync(() => {
          Bun.serve({
            port: 3000,
            fetch(req) {
              const url = new URL(req.url);
              const pathname = url.pathname.replace(/^\//, '');
              const filePath =
                embeddedAssets[pathname] ?? embeddedAssets['index.html'];
              if (!filePath) {
                return new Response('Not Found', { status: 404 });
              }
              return new Response(Bun.file(filePath));
            },
          });
          console.log('Foyer web UI serving on http://localhost:3000');
        });
        yield* Effect.promise(() => new Promise<never>(() => {}));
        return;
      }

      const workspaceRoot = yield* findWorkspaceRoot(import.meta.dir);
      const proc = yield* platform.Command.make(
        'bun',
        'run',
        '--cwd',
        resolve(workspaceRoot, 'apps', 'web'),
        'dev',
      ).pipe(
        platform.Command.stdout('inherit'),
        platform.Command.stderr('inherit'),
        platform.Command.start,
      );
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => proc.kill()).pipe(Effect.ignore),
      );
      yield* proc.exitCode;
    }).pipe(Effect.scoped),
).pipe(Command.withDescription('Start the Foyer web UI'));

const root = Command.make('foyer').pipe(
  Command.withSubcommands([serveCommand, webCommand] as const),
  Command.withDescription('Foyer CLI'),
);

const runCli = Command.run(root, {
  name: 'foyer',
  version: '0.0.0',
  executable: 'foyer',
});

runCli(process.argv).pipe(
  Effect.provide(BunContext.layer),
  BunRuntime.runMain,
);
