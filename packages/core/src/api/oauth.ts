import { HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export const OAuthStartInput = Schema.Struct({
  endpoint: Schema.String,
  connectionId: Schema.String,
  redirectUrl: Schema.String,
  provider: Schema.String,
  scopes: Schema.optionalWith(Schema.Array(Schema.String), { as: 'option' }),
  clientId: Schema.optionalWith(Schema.String, { as: 'option' }),
  clientSecret: Schema.optionalWith(Schema.String, { as: 'option' }),
  authorizationEndpoint: Schema.optionalWith(Schema.String, { as: 'option' }),
  tokenEndpoint: Schema.optionalWith(Schema.String, { as: 'option' }),
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
          code: Schema.optionalWith(Schema.String, { as: 'option' }),
          error: Schema.optionalWith(Schema.String, { as: 'option' }),
        }),
      )
      .addSuccess(Schema.String),
  ) {}
