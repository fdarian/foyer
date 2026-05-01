import * as BunHttpServer from '@effect/platform-bun/BunHttpServer';
import * as BunRuntime from '@effect/platform-bun/BunRuntime';
import { Config, Layer } from 'effect';
import { ApiLive, server } from '../src/server/main.ts';

const ContextLayers = Layer.mergeAll(
  BunHttpServer.layerConfig(
    Config.all({
      port: Config.port('PORT').pipe(Config.withDefault('3301')),
    }),
  ),
);

const ServerLive = server.pipe(Layer.provide(ApiLive.pipe(Layer.provideMerge(ContextLayers))));

Layer.launch(ServerLive).pipe(BunRuntime.runMain);
