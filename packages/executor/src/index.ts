import { graphqlPlugin } from '@executor-js/plugin-graphql';
import { mcpPlugin } from '@executor-js/plugin-mcp';
import { openApiPlugin } from '@executor-js/plugin-openapi';
import {
  createExecutor,
  makeTestConfig,
  Scope,
  ScopeId,
} from '@executor-js/sdk/core';
import { ConnectionService } from '@foyer/core/connection';
import { SecretService } from '@foyer/core/secret';
import { Effect } from 'effect';

export type CustomExecutor = Effect.Effect.Success<
  ReturnType<typeof buildEphemeralExecutor>
>;

function buildEphemeralExecutor(profileId: string) {
  const testConfig = makeTestConfig({
    plugins: [mcpPlugin(), openApiPlugin(), graphqlPlugin()] as const,
  });
  const effect = createExecutor({
    ...testConfig,
    scope: new Scope({
      id: (ScopeId as unknown as { make: (s: string) => string }).make(
        profileId,
      ),
      name: 'foyer',
      createdAt: new Date(),
    }),
  });
  /**
   * `createExecutor` infers `R = unknown` — cast at this boundary so
   * callers don't leak `unknown` through their R channel.
   */
  return effect as Effect.Effect<
    Effect.Effect.Success<typeof effect>,
    Effect.Effect.Error<typeof effect>
  >;
}

export function withExecutor<A, E, R>(
  profileId: string,
  setup: (executor: CustomExecutor) => Effect.Effect<unknown, E, R>,
  action: (executor: CustomExecutor) => Effect.Effect<A, E, R>,
  options?: { readonly onClose?: () => void },
): Effect.Effect<A, E | Error, R> {
  return Effect.gen(function* () {
    const executor = yield* buildEphemeralExecutor(profileId);
    const closeEffect = Effect.gen(function* () {
      yield* executor.close();
      options?.onClose?.();
    });
    return yield* Effect.gen(function* () {
      yield* setup(executor);
      return yield* action(executor);
    }).pipe(Effect.ensuring(closeEffect));
  }) as Effect.Effect<A, E | Error, R>;
}

// ---------------------------------------------------------------------------
// Auth resolution helpers — resolve credentials via core/secret + core/connection
// ---------------------------------------------------------------------------

export type ResolvedAuth = {
  kind: 'bearer' | 'apiKey';
  header?: string;
  value: string;
};

export function resolveBearerToken(
  connectionId?: number | null,
  secretId?: number | null,
): Effect.Effect<string | null, Error> {
  return Effect.gen(function* () {
    if (connectionId) {
      const connectionService = yield* ConnectionService;
      const token = yield* connectionService.accessToken(connectionId);
      return token;
    }
    if (secretId) {
      const secretService = yield* SecretService;
      const value = yield* secretService.get(secretId);
      return value;
    }
    return null;
  });
}

export function buildMcpAuthHeaders(
  auth: ResolvedAuth | null | undefined,
): Record<string, string> | undefined {
  if (!auth) return undefined;
  if (auth.kind === 'bearer') {
    return { Authorization: `Bearer ${auth.value}` };
  }
  return { [auth.header || 'X-API-Key']: auth.value };
}

export function buildOpenApiAuthHeaders(
  auth: ResolvedAuth | null | undefined,
): Record<string, string> | undefined {
  if (!auth) return undefined;
  if (auth.kind === 'bearer') {
    return { Authorization: `Bearer ${auth.value}` };
  }
  return { [auth.header || 'X-API-Key']: auth.value };
}

// ---------------------------------------------------------------------------
// Source addition helpers — one per kind
// ---------------------------------------------------------------------------

export function addMcpSource(
  executor: CustomExecutor,
  config: {
    name: string;
    endpoint: string;
    remoteTransport?: 'streamable-http' | 'sse' | 'auto';
    namespace?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
  },
) {
  return executor.mcp.addSource({
    transport: 'remote',
    name: config.name,
    endpoint: config.endpoint,
    remoteTransport: config.remoteTransport,
    namespace: config.namespace,
    headers: config.headers,
    queryParams: config.queryParams,
  });
}

export function addOpenApiSource(
  executor: CustomExecutor,
  config: {
    spec: string;
    name?: string;
    baseUrl?: string;
    namespace?: string;
    headers?: Record<string, string>;
  },
) {
  return executor.openapi.addSpec({
    spec: config.spec,
    name: config.name,
    baseUrl: config.baseUrl,
    namespace: config.namespace,
    headers: config.headers,
  });
}

export function addGraphqlSource(
  executor: CustomExecutor,
  config: {
    endpoint: string;
    name?: string;
    introspectionJson?: string;
    namespace?: string;
    headers?: Record<string, string>;
  },
) {
  return executor.graphql.addSource({
    endpoint: config.endpoint,
    name: config.name,
    introspectionJson: config.introspectionJson,
    namespace: config.namespace,
    headers: config.headers,
  });
}
