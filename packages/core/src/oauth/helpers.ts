import { Data, Effect } from 'effect';
import * as oauth from 'oauth4webapi';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class OAuth2Error extends Data.TaggedError('OAuth2Error')<{
  readonly message: string;
  readonly error?: string;
  readonly cause?: unknown;
}> {}

// ---------------------------------------------------------------------------
// PKCE (RFC 7636)
// ---------------------------------------------------------------------------

export const createPkceCodeVerifier = (): string =>
  oauth.generateRandomCodeVerifier();

export const createPkceCodeChallenge = (verifier: string): Promise<string> =>
  oauth.calculatePKCECodeChallenge(verifier);

// ---------------------------------------------------------------------------
// Authorization URL builder
// ---------------------------------------------------------------------------

export type BuildAuthorizationUrlInput = {
  readonly authorizationUrl: string;
  readonly clientId: string;
  readonly redirectUrl: string;
  readonly scopes: readonly string[];
  readonly state: string;
  readonly codeChallenge: string;
  readonly scopeSeparator?: string;
  readonly extraParams?: Readonly<Record<string, string>>;
};

export const buildAuthorizationUrl = (
  input: BuildAuthorizationUrlInput,
): string => {
  const url = new URL(input.authorizationUrl);
  const separator = input.scopeSeparator ?? ' ';
  url.searchParams.set('client_id', input.clientId);
  url.searchParams.set('redirect_uri', input.redirectUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', input.scopes.join(separator));
  url.searchParams.set('state', input.state);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('code_challenge', input.codeChallenge);
  if (input.extraParams) {
    for (const [k, v] of Object.entries(input.extraParams)) {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
};

// ---------------------------------------------------------------------------
// Token response shape
// ---------------------------------------------------------------------------

export type OAuth2TokenResponse = {
  readonly access_token: string;
  readonly token_type?: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly scope?: string;
};

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

const toOAuth2Error = (cause: unknown): OAuth2Error => {
  if (typeof cause === 'object' && cause !== null) {
    const c = cause as {
      error?: unknown;
      error_description?: unknown;
      message?: unknown;
    };
    const code = typeof c.error === 'string' ? c.error : undefined;
    const description =
      typeof c.error_description === 'string'
        ? c.error_description
        : typeof c.message === 'string'
          ? c.message
          : undefined;
    return new OAuth2Error({
      message: `OAuth token exchange failed: ${description ?? code ?? 'unknown error'}`,
      error: code,
      cause,
    });
  }
  return new OAuth2Error({
    message: `OAuth token exchange failed: ${String(cause)}`,
    cause,
  });
};

// ---------------------------------------------------------------------------
// oauth4webapi adapter helpers
// ---------------------------------------------------------------------------

const asFromTokenUrl = (tokenUrl: string): oauth.AuthorizationServer => {
  const url = new URL(tokenUrl);
  return {
    issuer: `${url.protocol}//${url.host}`,
    token_endpoint: tokenUrl,
  };
};

const asFromTokenUrlAndIssuer = (
  tokenUrl: string,
  issuerUrl: string | null | undefined,
): oauth.AuthorizationServer => {
  const as = asFromTokenUrl(tokenUrl);
  return issuerUrl ? { ...as, issuer: issuerUrl } : as;
};

const isLoopbackHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:') return false;
    const hostname = url.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.startsWith('127.')
    );
  } catch {
    return false;
  }
};

const oauth4webapiRequestOptions = (
  targetUrl: string,
  timeoutMs: number = 20000,
): Record<string, unknown> => {
  const options: Record<string, unknown> = {
    signal: AbortSignal.timeout(timeoutMs),
  };
  if (isLoopbackHttpUrl(targetUrl)) {
    (options as { [oauth.allowInsecureRequests]?: boolean })[
      oauth.allowInsecureRequests
    ] = true;
  }
  return options;
};

type ClientAuthMethod = 'body' | 'basic';

const pickClientAuth = (
  clientSecret: string | null | undefined,
  method: ClientAuthMethod,
): oauth.ClientAuth => {
  if (!clientSecret) return oauth.None();
  return method === 'basic'
    ? oauth.ClientSecretBasic(clientSecret)
    : oauth.ClientSecretPost(clientSecret);
};

const tokenResponseFrom = (
  r: oauth.TokenEndpointResponse,
): OAuth2TokenResponse => ({
  access_token: r.access_token,
  token_type: r.token_type,
  refresh_token: r.refresh_token,
  expires_in: typeof r.expires_in === 'number' ? r.expires_in : undefined,
  scope: r.scope,
});

// ---------------------------------------------------------------------------
// Exchange authorization code -> tokens
// ---------------------------------------------------------------------------

export type ExchangeAuthorizationCodeInput = {
  readonly tokenUrl: string;
  readonly issuerUrl?: string | null;
  readonly clientId: string;
  readonly clientSecret?: string | null;
  readonly redirectUrl: string;
  readonly codeVerifier: string;
  readonly code: string;
  readonly clientAuth?: ClientAuthMethod;
};

export const exchangeAuthorizationCode = (
  input: ExchangeAuthorizationCodeInput,
): Effect.Effect<OAuth2TokenResponse, OAuth2Error> =>
  Effect.tryPromise({
    try: async () => {
      const as = asFromTokenUrlAndIssuer(input.tokenUrl, input.issuerUrl);
      const client: oauth.Client = { client_id: input.clientId };
      const clientAuth = pickClientAuth(
        input.clientSecret,
        input.clientAuth ?? 'body',
      );
      const params = new URLSearchParams({
        code: input.code,
        redirect_uri: input.redirectUrl,
        code_verifier: input.codeVerifier,
      });
      const response = await oauth.genericTokenEndpointRequest(
        as,
        client,
        clientAuth,
        'authorization_code',
        params,
        oauth4webapiRequestOptions(input.tokenUrl),
      );
      const result = await oauth.processGenericTokenEndpointResponse(
        as,
        client,
        response,
      );
      return tokenResponseFrom(result);
    },
    catch: toOAuth2Error,
  });

// ---------------------------------------------------------------------------
// Refresh access token
// ---------------------------------------------------------------------------

export type RefreshAccessTokenInput = {
  readonly tokenUrl: string;
  readonly issuerUrl?: string | null;
  readonly clientId: string;
  readonly clientSecret?: string | null;
  readonly refreshToken: string;
  readonly clientAuth?: ClientAuthMethod;
};

export const refreshAccessToken = (
  input: RefreshAccessTokenInput,
): Effect.Effect<OAuth2TokenResponse, OAuth2Error> =>
  Effect.tryPromise({
    try: async () => {
      const as = asFromTokenUrlAndIssuer(input.tokenUrl, input.issuerUrl);
      const client: oauth.Client = { client_id: input.clientId };
      const clientAuth = pickClientAuth(
        input.clientSecret,
        input.clientAuth ?? 'body',
      );
      const response = await oauth.refreshTokenGrantRequest(
        as,
        client,
        clientAuth,
        input.refreshToken,
        oauth4webapiRequestOptions(input.tokenUrl),
      );
      const result = await oauth.processRefreshTokenResponse(
        as,
        client,
        response,
      );
      return tokenResponseFrom(result);
    },
    catch: toOAuth2Error,
  });

// ---------------------------------------------------------------------------
// Should refresh predicate
// ---------------------------------------------------------------------------

export const OAUTH2_REFRESH_SKEW_MS = 60_000;

export const shouldRefreshToken = (input: {
  readonly expiresAt: number | null;
  readonly now?: number;
  readonly skewMs?: number;
}): boolean => {
  if (input.expiresAt === null) return false;
  const now = input.now ?? Date.now();
  const skew = input.skewMs ?? OAUTH2_REFRESH_SKEW_MS;
  return input.expiresAt <= now + skew;
};
