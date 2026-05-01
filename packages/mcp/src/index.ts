import {
  type HttpLayerRouter,
  type HttpServerRequest,
  HttpServerResponse,
} from '@effect/platform';
import { makeExecutorToolInvoker } from '@executor-js/execution/core';
import { makeQuickJsExecutor } from '@executor-js/runtime-quickjs';
import { mcps, sources, tools } from '@foyer/db/schema';
import {
  addGraphqlSource,
  addMcpSource,
  addOpenApiSource,
  withExecutor,
} from '@foyer/executor';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { z } from 'zod';

const cache = new Map<
  string,
  { server: McpServer; transport: WebStandardStreamableHTTPServerTransport }
>();

export function invalidateMcpCache(mcpUuid: string) {
  const entry = cache.get(mcpUuid);
  if (entry) {
    entry.server.close();
    entry.transport.close();
    cache.delete(mcpUuid);
  }
}

async function buildMcpServer(mcpUuid: string, db: any) {
  const mcpRows = await db.select().from(mcps).where(eq(mcps.uuid, mcpUuid));
  const mcp = mcpRows[0];
  if (!mcp) {
    throw new Error('MCP not found');
  }

  const toolRows = await db.select().from(tools).where(eq(tools.mcpId, mcp.id));

  const server = new McpServer(
    { name: mcp.name, version: '1.0.0' },
    { capabilities: {} },
  );

  for (const toolRow of toolRows) {
    const sourceRows = await db
      .select()
      .from(sources)
      .where(eq(sources.id, toolRow.sourceId));
    const sourceRow = sourceRows[0];
    if (!sourceRow) continue;

    server.registerTool(
      toolRow.name,
      {
        description: toolRow.description || '',
        inputSchema: z.record(z.any()),
      },
      async (args) => {
        try {
          const result = await Effect.runPromise(
            Effect.gen(function* () {
              return yield* withExecutor(
                `mcp-${mcpUuid}-${toolRow.uuid}`,
                (executor) =>
                  Effect.gen(function* () {
                    if (sourceRow.kind === 'openapi') {
                      const config = sourceRow.config as Record<
                        string,
                        unknown
                      >;
                      const specUrl = String(
                        config.specUrl || config.url || '',
                      );
                      if (!specUrl) {
                        return yield* Effect.fail(
                          new Error('OpenAPI spec URL missing'),
                        );
                      }
                      const specText = yield* Effect.tryPromise({
                        try: () => fetch(specUrl).then((r) => r.text()),
                        catch: (cause) =>
                          new Error(`Failed to fetch spec: ${String(cause)}`),
                      });
                      yield* addOpenApiSource(executor, {
                        spec: specText,
                        namespace: sourceRow.name,
                        baseUrl:
                          config.baseUrl === undefined
                            ? undefined
                            : String(config.baseUrl),
                      });
                    } else if (sourceRow.kind === 'mcp') {
                      const config = sourceRow.config as Record<
                        string,
                        unknown
                      >;
                      yield* addMcpSource(executor, {
                        name: sourceRow.name,
                        endpoint: String(config.endpoint || ''),
                        remoteTransport:
                          config.remoteTransport === undefined
                            ? undefined
                            : (String(config.remoteTransport) as
                                | 'auto'
                                | 'sse'
                                | 'streamable-http'),
                        namespace: sourceRow.name,
                      });
                    } else if (sourceRow.kind === 'graphql') {
                      const config = sourceRow.config as Record<
                        string,
                        unknown
                      >;
                      yield* addGraphqlSource(executor, {
                        endpoint: String(config.endpoint || ''),
                        name: sourceRow.name,
                        namespace: sourceRow.name,
                      });
                    }
                  }),
                (executor) =>
                  Effect.gen(function* () {
                    const toolList = yield* executor.tools.list({
                      sourceId: sourceRow.name,
                    });
                    const targetTool = toolList.find(
                      (t) =>
                        t.name === toolRow.sourceOperation ||
                        t.id === toolRow.sourceOperation ||
                        t.name.endsWith(`.${toolRow.sourceOperation}`) ||
                        t.id.endsWith(`.${toolRow.sourceOperation}`),
                    );
                    if (!targetTool) {
                      return yield* Effect.fail(
                        new Error(`Tool ${toolRow.sourceOperation} not found`),
                      );
                    }

                    const invocationResult = yield* executor.tools.invoke(
                      targetTool.id,
                      args,
                      { onElicitation: 'accept-all' },
                    );

                    if (invocationResult.error) {
                      const errorText =
                        typeof invocationResult.error === 'object' &&
                        invocationResult.error !== null
                          ? JSON.stringify(invocationResult.error)
                          : String(invocationResult.error);
                      return yield* Effect.fail(new Error(errorText));
                    }

                    let finalResult = invocationResult.data;

                    if (toolRow.postProcessJs) {
                      const quickJs = makeQuickJsExecutor();
                      const invoker = makeExecutorToolInvoker(
                        executor as unknown as Parameters<
                          typeof makeExecutorToolInvoker
                        >[0],
                        {
                          invokeOptions: {
                            onElicitation: 'accept-all',
                          },
                        },
                      );
                      const wrappedCode = [
                        'const input = ',
                        JSON.stringify(args),
                        ';',
                        'const result = ',
                        JSON.stringify(finalResult),
                        ';',
                        'return eval(',
                        JSON.stringify(toolRow.postProcessJs),
                        ');',
                      ].join('\n');
                      const jsResult = yield* quickJs.execute(
                        wrappedCode,
                        invoker,
                      );
                      if (jsResult.error) {
                        return yield* Effect.fail(new Error(jsResult.error));
                      }
                      finalResult = jsResult.result;
                    }

                    return finalResult;
                  }),
              );
            }) as Effect.Effect<unknown, unknown, never>,
          );

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text' as const,
                text: String(error),
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  });
  await server.connect(transport);

  return { server, transport };
}

export function handleMcpRequest(
  _db: any,
): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  Error,
  HttpServerRequest.HttpServerRequest | HttpLayerRouter.RouteContext
> {
  return Effect.gen(function* () {
    return HttpServerResponse.text('hello');
  });
}

export async function handleMcpRequestRaw(
  request: Request,
  mcpUuid: string,
  db: any,
): Promise<Response> {
  let entry = cache.get(mcpUuid);
  if (!entry) {
    entry = await buildMcpServer(mcpUuid, db);
    cache.set(mcpUuid, entry);
  }
  return entry.transport.handleRequest(request);
}
