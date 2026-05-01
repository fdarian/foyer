import { connections } from '@foyer/db/schema';
import { eq } from 'drizzle-orm';
import { Context, Effect, Layer } from 'effect';
import { DatabaseClient } from '../database.ts';
import { SecretService } from '../secret/service.ts';

export interface ConnectionServiceShape {
  readonly list: (userId: string) => Effect.Effect<
    Array<{
      readonly id: number;
      readonly uuid: string;
      readonly provider: string;
      readonly accessTokenSecretId: number | null;
      readonly refreshTokenSecretId: number | null;
      readonly expiresAt: Date | null;
      readonly providerState: Readonly<Record<string, unknown>>;
      readonly createdAt: Date;
    }>,
    Error
  >;
  readonly create: (input: {
    readonly userId: string;
    readonly provider: string;
    readonly providerState: Readonly<Record<string, unknown>>;
    readonly accessTokenSecretId?: number | null;
    readonly refreshTokenSecretId?: number | null;
    readonly expiresAt?: Date | null;
  }) => Effect.Effect<
    {
      readonly id: number;
      readonly uuid: string;
      readonly provider: string;
      readonly accessTokenSecretId: number | null;
      readonly refreshTokenSecretId: number | null;
      readonly expiresAt: Date | null;
      readonly providerState: Readonly<Record<string, unknown>>;
      readonly createdAt: Date;
    },
    Error
  >;
  readonly accessToken: (id: number) => Effect.Effect<string | null, Error>;
  readonly remove: (id: number) => Effect.Effect<void, Error>;
}

export class ConnectionService extends Context.Tag('ConnectionService')<
  ConnectionService,
  ConnectionServiceShape
>() {}

export const ConnectionServiceLive = Layer.effect(
  ConnectionService,
  Effect.gen(function* () {
    const db = yield* DatabaseClient;
    const secretService = yield* SecretService;

    const list = (
      userId: string,
    ): Effect.Effect<
      Array<{
        readonly id: number;
        readonly uuid: string;
        readonly provider: string;
        readonly accessTokenSecretId: number | null;
        readonly refreshTokenSecretId: number | null;
        readonly expiresAt: Date | null;
        readonly providerState: Readonly<Record<string, unknown>>;
        readonly createdAt: Date;
      }>,
      Error
    > =>
      Effect.tryPromise({
        try: () =>
          db.select().from(connections).where(eq(connections.userId, userId)),
        catch: (cause: unknown) => new Error(String(cause)),
      }).pipe(
        Effect.map((rows) =>
          rows.map((row) => ({
            id: row.id,
            uuid: row.uuid,
            provider: row.provider,
            accessTokenSecretId: row.accessTokenSecretId,
            refreshTokenSecretId: row.refreshTokenSecretId,
            expiresAt: row.expiresAt,
            providerState: row.providerState as Readonly<Record<string, unknown>>,
            createdAt: row.createdAt,
          })),
        ),
      );

    const create = (input: {
      readonly userId: string;
      readonly provider: string;
      readonly providerState: Readonly<Record<string, unknown>>;
      readonly accessTokenSecretId?: number | null;
      readonly refreshTokenSecretId?: number | null;
      readonly expiresAt?: Date | null;
    }): Effect.Effect<
      {
        readonly id: number;
        readonly uuid: string;
        readonly provider: string;
        readonly accessTokenSecretId: number | null;
        readonly refreshTokenSecretId: number | null;
        readonly expiresAt: Date | null;
        readonly providerState: Readonly<Record<string, unknown>>;
        readonly createdAt: Date;
      },
      Error
    > =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise(() =>
          db
            .insert(connections)
            .values({
              userId: input.userId,
              provider: input.provider,
              providerState: input.providerState,
              accessTokenSecretId: input.accessTokenSecretId ?? null,
              refreshTokenSecretId: input.refreshTokenSecretId ?? null,
              expiresAt: input.expiresAt ?? null,
            })
            .returning(),
        );
        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(new Error('Failed to insert connection'));
        }
        return {
          id: row.id,
          uuid: row.uuid,
          provider: row.provider,
          accessTokenSecretId: row.accessTokenSecretId,
          refreshTokenSecretId: row.refreshTokenSecretId,
          expiresAt: row.expiresAt,
          providerState: row.providerState as Readonly<Record<string, unknown>>,
          createdAt: row.createdAt,
        };
      });

    const accessToken = (id: number): Effect.Effect<string | null, Error> =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () =>
            db.select().from(connections).where(eq(connections.id, id)),
          catch: (cause: unknown) => new Error(String(cause)),
        });
        const row = rows[0];
        if (!row?.accessTokenSecretId) return null;

        // v1: return the stored access token without refresh.
        // Refresh logic will be wired in a follow-up.
        const token = yield* secretService.get(row.accessTokenSecretId);
        return token;
      });

    const remove = (id: number): Effect.Effect<void, Error> =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          db
            .delete(connections)
            .where(eq(connections.id, id))
            .execute()
            .then(() => {}),
        ).pipe(Effect.mapError((e) => new Error(String(e))));
      });

    return { list, create, accessToken, remove };
  }),
);
