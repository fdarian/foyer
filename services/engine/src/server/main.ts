import {
  HttpApiBuilder,
  HttpApiScalar,
  HttpLayerRouter,
  HttpServerRequest,
  HttpServerResponse,
} from '@effect/platform';
import { FoyerApi } from '@foyer/core/api';
import {
  ConnectionService,
  ConnectionServiceLive,
} from '@foyer/core/connection';
import { DatabaseClient } from '@foyer/core/database';
import { OAuthService, OAuthServiceLive } from '@foyer/core/oauth';
import { popupDocument } from '@foyer/core/oauth-popup';
import { SecretServiceLive } from '@foyer/core/secret';
import { connections, mcps, sources, tools } from '@foyer/db/schema';
import { handleMcpRequestRaw } from '@foyer/mcp';
import { eq } from 'drizzle-orm';
import { Effect, Layer } from 'effect';

const userId = 'local';

const AdminApiLive = HttpApiBuilder.group(FoyerApi, 'admin', (handlers) =>
  handlers
    .handle('listMcps', () =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db.select().from(mcps).where(eq(mcps.userId, userId)),
        );
        return rows.map((row) => ({
          id: row.id,
          uuid: row.uuid,
          name: row.name,
          description: row.description,
          createdAt: row.createdAt,
        }));
      }).pipe(Effect.orDie),
    )
    .handle('createMcp', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db
            .insert(mcps)
            .values({
              name: request.payload.name,
              userId,
              description: request.payload.description ?? null,
            })
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Failed to create MCP'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          name: row.name,
          description: row.description,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('getMcp', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db.select().from(mcps).where(eq(mcps.uuid, request.path.uuid)),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('MCP not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          name: row.name,
          description: row.description,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('updateMcp', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const updateData: Record<string, unknown> = {};
        if (request.payload.name !== undefined) {
          updateData.name = request.payload.name;
        }
        if (request.payload.description !== undefined) {
          updateData.description = request.payload.description;
        }
        const rows = yield* Effect.tryPromise(() =>
          db
            .update(mcps)
            .set(updateData)
            .where(eq(mcps.uuid, request.path.uuid))
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('MCP not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          name: row.name,
          description: row.description,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('deleteMcp', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db.delete(mcps).where(eq(mcps.uuid, request.path.uuid)).returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('MCP not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          name: row.name,
          description: row.description,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('listSources', () =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db.select().from(sources).where(eq(sources.userId, userId)),
        );
        return rows.map((row) => ({
          id: row.id,
          uuid: row.uuid,
          kind: row.kind,
          name: row.name,
          config: row.config,
          connectionId: row.connectionId,
          createdAt: row.createdAt,
        }));
      }).pipe(Effect.orDie),
    )
    .handle('createSource', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db
            .insert(sources)
            .values({
              kind: request.payload.kind,
              name: request.payload.name,
              userId,
              config: request.payload.config,
              connectionId: request.payload.connectionId ?? null,
            })
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Failed to create source'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          kind: row.kind,
          name: row.name,
          config: row.config,
          connectionId: row.connectionId,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('getSource', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db.select().from(sources).where(eq(sources.uuid, request.path.uuid)),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Source not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          kind: row.kind,
          name: row.name,
          config: row.config,
          connectionId: row.connectionId,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('updateSource', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const updateData: Record<string, unknown> = {};
        if (request.payload.name !== undefined) {
          updateData.name = request.payload.name;
        }
        if (request.payload.config !== undefined) {
          updateData.config = request.payload.config;
        }
        if (request.payload.connectionId !== undefined) {
          updateData.connectionId = request.payload.connectionId;
        }
        const rows = yield* Effect.tryPromise(() =>
          db
            .update(sources)
            .set(updateData)
            .where(eq(sources.uuid, request.path.uuid))
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Source not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          kind: row.kind,
          name: row.name,
          config: row.config,
          connectionId: row.connectionId,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('deleteSource', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db
            .delete(sources)
            .where(eq(sources.uuid, request.path.uuid))
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Source not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          kind: row.kind,
          name: row.name,
          config: row.config,
          connectionId: row.connectionId,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('listTools', () =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() => db.select().from(tools));
        return rows;
      }).pipe(Effect.orDie),
    )
    .handle('createTool', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db
            .insert(tools)
            .values({
              mcpId: request.payload.mcpId,
              name: request.payload.name,
              description: request.payload.description ?? null,
              inputSchema: request.payload.inputSchema,
              sourceId: request.payload.sourceId,
              sourceOperation: request.payload.sourceOperation,
              postProcessJs: request.payload.postProcessJs ?? null,
            })
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Failed to create tool'));
        }
        return row;
      }).pipe(Effect.orDie),
    )
    .handle('getTool', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db.select().from(tools).where(eq(tools.uuid, request.path.uuid)),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Tool not found'));
        }
        return row;
      }).pipe(Effect.orDie),
    )
    .handle('updateTool', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const updateData: Record<string, unknown> = {};
        if (request.payload.name !== undefined) {
          updateData.name = request.payload.name;
        }
        if (request.payload.description !== undefined) {
          updateData.description = request.payload.description;
        }
        if (request.payload.inputSchema !== undefined) {
          updateData.inputSchema = request.payload.inputSchema;
        }
        if (request.payload.sourceId !== undefined) {
          updateData.sourceId = request.payload.sourceId;
        }
        if (request.payload.sourceOperation !== undefined) {
          updateData.sourceOperation = request.payload.sourceOperation;
        }
        if (request.payload.postProcessJs !== undefined) {
          updateData.postProcessJs = request.payload.postProcessJs;
        }
        const rows = yield* Effect.tryPromise(() =>
          db
            .update(tools)
            .set(updateData)
            .where(eq(tools.uuid, request.path.uuid))
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Tool not found'));
        }
        return row;
      }).pipe(Effect.orDie),
    )
    .handle('deleteTool', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db.delete(tools).where(eq(tools.uuid, request.path.uuid)).returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Tool not found'));
        }
        return row;
      }).pipe(Effect.orDie),
    )
    .handle('listConnections', () =>
      Effect.gen(function* () {
        const service = yield* ConnectionService;
        const rows = yield* service.list(userId);
        return rows;
      }).pipe(Effect.orDie),
    )
    .handle('createConnection', (request) =>
      Effect.gen(function* () {
        const service = yield* ConnectionService;
        const row = yield* service.create({
          userId,
          provider: request.payload.provider,
          providerState: request.payload.providerState,
        });
        return row;
      }).pipe(Effect.orDie),
    )
    .handle('getConnection', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(connections)
            .where(eq(connections.uuid, request.path.uuid)),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Connection not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          provider: row.provider,
          accessTokenSecretId: row.accessTokenSecretId,
          refreshTokenSecretId: row.refreshTokenSecretId,
          expiresAt: row.expiresAt,
          providerState: row.providerState,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('updateConnection', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const updateData: Record<string, unknown> = {};
        if (request.payload.provider !== undefined) {
          updateData.provider = request.payload.provider;
        }
        if (request.payload.providerState !== undefined) {
          updateData.providerState = request.payload.providerState;
        }
        const rows = yield* Effect.tryPromise(() =>
          db
            .update(connections)
            .set(updateData)
            .where(eq(connections.uuid, request.path.uuid))
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Connection not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          provider: row.provider,
          accessTokenSecretId: row.accessTokenSecretId,
          refreshTokenSecretId: row.refreshTokenSecretId,
          expiresAt: row.expiresAt,
          providerState: row.providerState,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    )
    .handle('deleteConnection', (request) =>
      Effect.gen(function* () {
        const db = yield* DatabaseClient;
        const rows = yield* Effect.tryPromise(() =>
          db
            .delete(connections)
            .where(eq(connections.uuid, request.path.uuid))
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Connection not found'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          provider: row.provider,
          accessTokenSecretId: row.accessTokenSecretId,
          refreshTokenSecretId: row.refreshTokenSecretId,
          expiresAt: row.expiresAt,
          providerState: row.providerState,
          createdAt: row.createdAt,
        };
      }).pipe(Effect.orDie),
    ),
);

const OAuthApiLive = HttpApiBuilder.group(FoyerApi, 'oauth', (handlers) =>
  handlers
    .handle('start', (request) =>
      Effect.gen(function* () {
        const service = yield* OAuthService;
        const result = yield* service.start({
          endpoint: request.payload.endpoint,
          connectionId: request.payload.connectionId,
          redirectUrl: request.payload.redirectUrl,
          provider: request.payload.provider,
          userId,
          scopes: request.payload.scopes
            ? [...request.payload.scopes]
            : undefined,
          clientId: request.payload.clientId,
          clientSecret: request.payload.clientSecret,
          authorizationEndpoint: request.payload.authorizationEndpoint,
          tokenEndpoint: request.payload.tokenEndpoint,
        });
        return result;
      }).pipe(Effect.orDie),
    )
    .handle('callback', (request) =>
      Effect.gen(function* () {
        const service = yield* OAuthService;
        const result = yield* service.complete({
          state: request.urlParams.state,
          code: request.urlParams.code,
          error: request.urlParams.error,
        });
        const html = popupDocument(
          {
            type: 'oauth-popup-result',
            ok: true,
            sessionId: request.urlParams.state,
            auth: { connectionId: result.connectionId },
          },
          'foyer-oauth',
        );
        return HttpServerResponse.raw(html, {
          contentType: 'text/html',
        });
      }).pipe(Effect.orDie),
    ),
);

const McpRoute = HttpLayerRouter.add(
  '*',
  '/mcp/:uuid',
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const webRequest = yield* HttpServerRequest.toWeb(request);
    const params = yield* HttpLayerRouter.params;
    const mcpUuid = params.uuid;
    if (!mcpUuid) {
      return yield* Effect.fail(new Error('Missing MCP UUID'));
    }
    const db = yield* DatabaseClient;
    const response = yield* Effect.tryPromise({
      try: () => handleMcpRequestRaw(webRequest, mcpUuid, db),
      catch: (cause) => new Error(String(cause)),
    });
    return HttpServerResponse.fromWeb(response);
  }),
);

const routes = Layer.mergeAll(
  McpRoute,
  HttpLayerRouter.addHttpApi(FoyerApi, { openapiPath: '/spec.json' }),
  HttpApiScalar.layerHttpLayerRouter({ api: FoyerApi, path: '/' }),
  HttpLayerRouter.cors(),
);

export const server = HttpLayerRouter.serve(routes);

export const ApiLive = Layer.mergeAll(AdminApiLive, OAuthApiLive).pipe(
  Layer.provide(OAuthServiceLive),
  Layer.provide(ConnectionServiceLive),
  Layer.provide(SecretServiceLive),
);
