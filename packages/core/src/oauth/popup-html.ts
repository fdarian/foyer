import { Cause, Effect } from 'effect';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const OAUTH_POPUP_MESSAGE_TYPE = 'oauth-popup-result' as const;

export interface OAuthPopupResult<TAuth> {
  readonly type: typeof OAUTH_POPUP_MESSAGE_TYPE;
  readonly ok: boolean;
  readonly sessionId: string | null;
  readonly error?: string;
  readonly auth?: TAuth;
}

export const isOAuthPopupResult = (
  value: unknown,
): value is OAuthPopupResult<unknown> =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  value.type === OAUTH_POPUP_MESSAGE_TYPE;

// ---------------------------------------------------------------------------
// HTML generation
// ---------------------------------------------------------------------------

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const serializeForScript = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');

export const popupDocument = <TAuth>(
  payload: OAuthPopupResult<TAuth>,
  channelName: string,
): string => {
  const serialized = serializeForScript(payload);
  const title = payload.ok ? 'Connected' : 'Connection failed';
  const message = payload.ok
    ? 'Authentication complete. This window will close automatically.'
    : payload.error;
  const statusColor = payload.ok ? '#22c55e' : '#ef4444';
  const icon = payload.ok
    ? '<path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<path d="M7 7l6 6M13 7l-6 6" stroke="white" stroke-width="2" stroke-linecap="round"/>';
  const escapedChannel = escapeHtml(channelName);

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(title)}</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa;color:#111">
<style>@media(prefers-color-scheme:dark){body{background:#09090b!important;color:#fafafa!important}p{color:#a1a1aa!important}}</style>
<main style="text-align:center;max-width:360px;padding:24px">
<div style="width:40px;height:40px;border-radius:50%;background:${statusColor};margin:0 auto 16px;display:flex;align-items:center;justify-content:center">
<svg width="20" height="20" viewBox="0 0 20 20" fill="none">${icon}</svg>
</div>
<h1 style="margin:0 0 8px;font-size:18px;font-weight:600">${escapeHtml(title)}</h1>
<p style="margin:0;font-size:14px;color:#666;line-height:1.5">${escapeHtml(message ?? '')}</p>
</main>
<script>
(()=>{const p=${serialized};try{if(window.opener)window.opener.postMessage(p,window.location.origin);if("BroadcastChannel"in window){const c=new BroadcastChannel("${escapedChannel}");c.postMessage(p);setTimeout(()=>c.close(),100)}}finally{setTimeout(()=>window.close(),150)}})();
</script>
</body></html>`;
};

// ---------------------------------------------------------------------------
// Callback wrapper
// ---------------------------------------------------------------------------

export type OAuthCallbackUrlParams = {
  readonly state: string;
  readonly code?: string | null;
  readonly error?: string | null;
  readonly error_description?: string | null;
};

export type RunOAuthCallbackInput<TAuth, E, R> = {
  readonly complete: (params: {
    readonly state: string;
    readonly code: string | null;
    readonly error: string | null;
  }) => Effect.Effect<TAuth, E, R>;
  readonly urlParams: OAuthCallbackUrlParams;
  readonly toErrorMessage: (error: unknown) => string;
  readonly channelName: string;
};

export const runOAuthCallback = <TAuth, E, R>(
  input: RunOAuthCallbackInput<TAuth, E, R>,
): Effect.Effect<string, never, R> =>
  input
    .complete({
      state: input.urlParams.state,
      code: input.urlParams.code ?? null,
      error: input.urlParams.error ?? input.urlParams.error_description ?? null,
    })
    .pipe(
      Effect.map(
        (auth): OAuthPopupResult<TAuth> => ({
          type: OAUTH_POPUP_MESSAGE_TYPE,
          ok: true,
          sessionId: input.urlParams.state,
          auth,
        }),
      ),
      Effect.catchAllCause((cause) =>
        Effect.succeed<OAuthPopupResult<TAuth>>({
          type: OAUTH_POPUP_MESSAGE_TYPE,
          ok: false,
          sessionId: input.urlParams.state ?? null,
          error: input.toErrorMessage(Cause.squash(cause)),
        }),
      ),
      Effect.map((result) => popupDocument(result, input.channelName)),
    );
