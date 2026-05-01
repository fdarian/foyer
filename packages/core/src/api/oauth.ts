import { HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export const OAuthStartInput = Schema.Struct({
  endpoint: Schema.String,
  connectionId: Schema.String,
  redirectUrl: Schema.String,
  provider: Schema.String,
  scopes: Schema.optional(Schema.Array(Schema.String)),
  clientId: Schema.optional(Schema.String),
  clientSecret: Schema.optional(Schema.String),
  authorizationEndpoint: Schema.optional(Schema.String),
  tokenEndpoint: Schema.optional(Schema.String),
});

export type OAuthStartInput = typeof OAuthStartInput.Type;

export const OAuthStartResult = Schema.Struct({
  sessionId: Schema.String,
  authorizationUrl: Schema.String,
});

export type OAuthStartResult = typeof OAuthStartResult.Type;

export const OAuthCallbackResult = Schema.Struct({
  connectionId: Schema.String,
});

export type OAuthCallbackResult = typeof OAuthCallbackResult.Type;

export class OAuthApi extends HttpApiGroup.make('oauth')
  .add(
    HttpApiEndpoint.post('start', '/oauth/start')
      .setPayload(OAuthStartInput)
      .addSuccess(OAuthStartResult),
  )
  .add(
    HttpApiEndpoint.get('callback', '/oauth/callback')
      .setUrlParams(
        Schema.Struct({
          state: Schema.String,
          code: Schema.optional(Schema.String),
          error: Schema.optional(Schema.String),
        }),
      )
      .addSuccess(Schema.String),
  ) {}
