import { FoyerApi } from '@foyer/core/api';
import {
  HttpApiBuilder,
  HttpApiScalar,
  HttpLayerRouter,
  HttpServerResponse,
} from '@effect/platform';
import { Effect, Layer } from 'effect';

const AdminApiLive = HttpApiBuilder.group(
  FoyerApi,
  'admin',
  (handlers) =>
    handlers.handle('listMcps', () => Effect.succeed([])),
);

const McpStubRoute = HttpLayerRouter.add(
  'GET',
  '/mcp/:uuid',
  Effect.succeed(HttpServerResponse.json({ tools: [] })),
);

const routes = Layer.mergeAll(
  McpStubRoute,
  HttpLayerRouter.addHttpApi(FoyerApi, { openapiPath: '/spec.json' }),
  HttpApiScalar.layerHttpLayerRouter({ api: FoyerApi, path: '/' }),
  HttpLayerRouter.cors(),
);

export const server = HttpLayerRouter.serve(routes);

export const ApiLive = Layer.mergeAll(AdminApiLive);
