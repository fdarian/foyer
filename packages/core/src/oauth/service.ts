import { oauth2Sessions, secrets } from '@foyer/db/schema';
import { eq } from 'drizzle-orm';
import { Context, Effect, Layer, Schema } from 'effect';
import { ConnectionService } from '../connection/service.ts';
import { DatabaseClient } from '../database.ts';
import { SecretService } from '../secret/service.ts';
import {
  buildAuthorizationUrl,
  createPkceCodeChallenge,
  createPkceCodeVerifier,
  exchangeAuthorizationCode,
} from './helpers.ts';

export interface OAuthService {
  readonly probe: (endpoint: string) => Effect.Effect<
    {
      readonly supportsOAuth: boolean;
      readonly authorizationServerUrl: string | null;
    },
    Error
  >;
  readonly start: (input: {
    readonly endpoint: string;
    readonly connectionId: string;
    readonly redirectUrl: string;
    readonly provider: string;
    readonly userId: string;
    readonly scopes?: string[];
    readonly clientId?: string;
    readonly clientSecret?: string;
    readonly authorizationEndpoint?: string;
    readonly tokenEndpoint?: string;
  }) => Effect.Effect<
    { readonly sessionId: string; readonly authorizationUrl: string },
    Error
  >;
  readonly complete: (input: {
    readonly state: string;
    readonly code?: string;
    readonly error?: string;
  }) => Effect.Effect<
    { readonly connectionId: string; readonly expiresAt: number | null },
    Error
  >;
}

export class OAuthService extends Context.Tag('OAuthService')<
  OAuthService,
  OAuthService
>() {}

const SESSION_TTL_MS = 15 * 60 * 1000;

const OAUTH2_PROVIDER_KEY = 'oauth2';

interface SessionMetadata {
  readonly kind: 'authorization-code';
  readonly endpoint: string;
  readonly connectionId: string;
  readonly redirectUrl: string;
  readonly tokenEndpoint: string;
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly scopes: string[];
}

const SessionMetadata = Schema.Struct({
  kind: Schema.Literal('authorization-code'),
  endpoint: Schema.String,
  connectionId: Schema.String,
  redirectUrl: Schema.String,
  tokenEndpoint: Schema.String,
  clientId: Schema.String,
  clientSecret: Schema.optionalWith(Schema.String, { as: 'option' }),
  scopes: Schema.Array(Schema.String),
});

const encodeSessionMetadata = Schema.encodeSync(SessionMetadata);
const decodeSessionMetadata = Schema.decodeUnknownSync(SessionMetadata);

export const OAuthServiceLive = Layer.effect(
  OAuthService,
  Effect.gen(function* () {
    const db = yield* DatabaseClient;
    const connectionService = yield* ConnectionService;
    const secretService = yield* SecretService;

    const probe = (
      endpoint: string,
    ): Effect.Effect<
      {
        readonly supportsOAuth: boolean;
        readonly authorizationServerUrl: string | null;
      },
      Error
    > =>
      Effect.gen(function* () {
        const isBearerChallenge = yield* Effect.tryPromise({
          try: async () => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  accept: 'application/json',
                },
                body: JSON.stringify({}),
                signal: controller.signal,
              });
              if (response.status !== 401) return false;
              const wwwAuth =
                response.headers.get('www-authenticate') ??
                response.headers.get('WWW-Authenticate');
              return !!wwwAuth && /^\s*bearer\b/i.test(wwwAuth);
            } finally {
              clearTimeout(timer);
            }
          },
          catch: () => false,
        }).pipe(Effect.catchAll(() => Effect.succeed(false)));

        let authorizationServerUrl: string | null = null;
        try {
          const url = new URL(endpoint);
          authorizationServerUrl = `${url.protocol}//${url.host}`;
        } catch {
          authorizationServerUrl = null;
        }

        return {
          supportsOAuth: isBearerChallenge || authorizationServerUrl !== null,
          authorizationServerUrl,
        };
      });

    const start = (input: {
      readonly endpoint: string;
      readonly connectionId: string;
      readonly redirectUrl: string;
      readonly provider: string;
      readonly userId: string;
      readonly scopes?: string[];
      readonly clientId?: string;
      readonly clientSecret?: string;
      readonly authorizationEndpoint?: string;
      readonly tokenEndpoint?: string;
    }): Effect.Effect<
      { readonly sessionId: string; readonly authorizationUrl: string },
      Error
    > =>
      Effect.gen(function* () {
        if (!input.authorizationEndpoint || !input.tokenEndpoint) {
          return yield* Effect.fail(
            new Error(
              'authorizationEndpoint and tokenEndpoint are required for the authorization-code flow',
            ),
          );
        }
        if (!input.clientId) {
          return yield* Effect.fail(
            new Error('clientId is required for the authorization-code flow'),
          );
        }

        const sessionId = crypto.randomUUID();
        const codeVerifier = createPkceCodeVerifier();
        const codeChallenge = yield* Effect.promise(() =>
          createPkceCodeChallenge(codeVerifier),
        );

        const authorizationUrl = buildAuthorizationUrl({
          authorizationUrl: input.authorizationEndpoint,
          clientId: input.clientId,
          redirectUrl: input.redirectUrl,
          scopes: input.scopes ?? [],
          state: sessionId,
          codeChallenge,
        });

        const metadata: SessionMetadata = {
          kind: 'authorization-code',
          endpoint: input.endpoint,
          connectionId: input.connectionId,
          redirectUrl: input.redirectUrl,
          tokenEndpoint: input.tokenEndpoint,
          clientId: input.clientId,
          clientSecret: input.clientSecret,
          scopes: input.scopes ?? [],
        };

        yield* Effect.tryPromise(() =>
          db.insert(oauth2Sessions).values({
            state: sessionId,
            codeVerifier,
            provider: input.provider,
            userId: input.userId,
            connectionId: input.connectionId,
            redirectUrl: input.redirectUrl,
            metadata: encodeSessionMetadata(metadata) as Record<
              string,
              unknown
            >,
            expiresAt: new Date(Date.now() + SESSION_TTL_MS),
          }),
        );

        return { sessionId, authorizationUrl };
      });

    const complete = (input: {
      readonly state: string;
      readonly code?: string;
      readonly error?: string;
    }): Effect.Effect<
      { readonly connectionId: string; readonly expiresAt: number | null },
      Error
    > =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(oauth2Sessions)
            .where(eq(oauth2Sessions.state, input.state)),
        );
        const session = rows[0];
        if (!session) {
          return yield* Effect.fail(
            new Error(`OAuth session not found: ${input.state}`),
          );
        }

        // Always delete the session after completion attempt
        const deleteSession = Effect.tryPromise(() =>
          db
            .delete(oauth2Sessions)
            .where(eq(oauth2Sessions.state, input.state)),
        );

        if (input.error) {
          yield* deleteSession;
          return yield* Effect.fail(
            new Error(`Authorization error: ${input.error}`),
          );
        }
        if (!input.code) {
          yield* deleteSession;
          return yield* Effect.fail(new Error('Missing authorization code'));
        }
        if (session.expiresAt <= new Date()) {
          yield* deleteSession;
          return yield* Effect.fail(new Error('OAuth session expired'));
        }

        const metadata = decodeSessionMetadata(session.metadata);

        const tokens = yield* exchangeAuthorizationCode({
          tokenUrl: metadata.tokenEndpoint,
          clientId: metadata.clientId,
          clientSecret: metadata.clientSecret,
          redirectUrl: metadata.redirectUrl,
          codeVerifier: session.codeVerifier,
          code: input.code,
        }).pipe(Effect.tapError(() => deleteSession));

        const expiresAt =
          typeof tokens.expires_in === 'number'
            ? Date.now() + tokens.expires_in * 1000
            : null;

        const accessSecret = yield* secretService.put({
          name: 'OAuth Access Token',
          value: tokens.access_token,
          userId: session.userId,
        });

        const refreshSecret = tokens.refresh_token
          ? yield* secretService.put({
              name: 'OAuth Refresh Token',
              value: tokens.refresh_token,
              userId: session.userId,
            })
          : null;

        const providerState: Record<string, unknown> = {
          kind: 'authorization-code',
          tokenEndpoint: metadata.tokenEndpoint,
          clientId: metadata.clientId,
          scopes: metadata.scopes,
        };

        const connection = yield* connectionService.create({
          userId: session.userId,
          provider: OAUTH2_PROVIDER_KEY,
          providerState,
          accessTokenSecretId: accessSecret.id,
          refreshTokenSecretId: refreshSecret ? refreshSecret.id : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        // Update secrets to be owned by the connection
        yield* Effect.tryPromise(() =>
          db
            .update(secrets)
            .set({ ownedByConnectionId: connection.id })
            .where(eq(secrets.id, accessSecret.id)),
        );
        if (refreshSecret) {
          yield* Effect.tryPromise(() =>
            db
              .update(secrets)
              .set({ ownedByConnectionId: connection.id })
              .where(eq(secrets.id, refreshSecret.id)),
          );
        }

        yield* deleteSession;

        return {
          connectionId: connection.uuid,
          expiresAt,
        };
      });

    return { probe, start, complete };
  }),
);
