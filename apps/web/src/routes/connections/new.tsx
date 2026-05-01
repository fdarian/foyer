import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import {
  useCreateConnection,
  useOAuthStart,
} from '../../lib/useApi';

export const Route = createFileRoute('/connections/new')({
  component: NewConnectionComponent,
});

const OAUTH_POPUP_MESSAGE_TYPE = 'oauth-popup-result';
const OAUTH_CHANNEL_NAME = 'foyer-oauth';

function NewConnectionComponent() {
  const navigate = useNavigate();
  const createConnection = useCreateConnection();
  const oauthStart = useOAuthStart();
  const [tab, setTab] = useState<'apikey' | 'oauth'>('apikey');

  // API Key fields
  const [apiProvider, setApiProvider] = useState('');
  const [apiKey, setApiKey] = useState('');

  // OAuth fields
  const [oauthProvider, setOauthProvider] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [authorizationEndpoint, setAuthorizationEndpoint] = useState('');
  const [tokenEndpoint, setTokenEndpoint] = useState('');
  const [redirectUrl, setRedirectUrl] = useState(
    `${window.location.origin}/oauth/callback`,
  );
  const [scopes, setScopes] = useState('');
  const [oauthStatus, setOauthStatus] = useState<string | null>(null);

  const handleOAuthMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (
        typeof data === 'object' &&
        data !== null &&
        data.type === OAUTH_POPUP_MESSAGE_TYPE
      ) {
        if (data.ok) {
          setOauthStatus('OAuth connected successfully');
        } else {
          setOauthStatus(`OAuth failed: ${data.error ?? 'Unknown error'}`);
        }
      }
    },
    [],
  );

  useEffect(() => {
    window.addEventListener('message', handleOAuthMessage);
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, [handleOAuthMessage]);

  function openOAuthPopup(authorizationUrl: string) {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      authorizationUrl,
      'foyer-oauth-popup',
      `width=${width},height=${height},left=${left},top=${top}`,
    );
    if (!popup) {
      alert('Popup blocked. Please allow popups for this site.');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New Connection</h1>

      <div className="flex gap-4 border-b mb-4">
        <button
          type="button"
          onClick={() => setTab('apikey')}
          className={`pb-2 text-sm font-medium ${
            tab === 'apikey'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          API Key
        </button>
        <button
          type="button"
          onClick={() => setTab('oauth')}
          className={`pb-2 text-sm font-medium ${
            tab === 'oauth'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          OAuth
        </button>
      </div>

      {tab === 'apikey' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createConnection.mutate(
              {
                provider: apiProvider,
                providerState: { apiKey },
              },
              {
                onSuccess: () => {
                  navigate({ to: '/connections' });
                },
              },
            );
          }}
          className="space-y-4 max-w-md"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Provider
            </label>
            <input
              type="text"
              value={apiProvider}
              onChange={(e) => setApiProvider(e.target.value)}
              required
              placeholder="e.g. openai"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={createConnection.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createConnection.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {tab === 'oauth' && (
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">
              Provider
            </label>
            <input
              type="text"
              value={oauthProvider}
              onChange={(e) => setOauthProvider(e.target.value)}
              placeholder="e.g. google"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Endpoint
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Authorization Endpoint
            </label>
            <input
              type="text"
              value={authorizationEndpoint}
              onChange={(e) => setAuthorizationEndpoint(e.target.value)}
              placeholder="https://example.com/oauth/authorize"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Token Endpoint
            </label>
            <input
              type="text"
              value={tokenEndpoint}
              onChange={(e) => setTokenEndpoint(e.target.value)}
              placeholder="https://example.com/oauth/token"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Redirect URL
            </label>
            <input
              type="text"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Scopes (comma-separated)
            </label>
            <input
              type="text"
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              placeholder="read,write"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setOauthStatus(null);
              const connectionId = crypto.randomUUID();
              oauthStart.mutate(
                {
                  endpoint,
                  connectionId,
                  redirectUrl,
                  provider: oauthProvider,
                  scopes: scopes
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
                  clientId,
                  clientSecret: clientSecret || undefined,
                  authorizationEndpoint,
                  tokenEndpoint,
                },
                {
                  onSuccess: (result) => {
                    openOAuthPopup(result.authorizationUrl);
                  },
                  onError: (error) => {
                    setOauthStatus(`Error: ${error.message}`);
                  },
                },
              );
            }}
            disabled={oauthStart.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {oauthStart.isPending ? 'Starting...' : 'Connect via OAuth'}
          </button>

          {oauthStatus && (
            <p
              className={`text-sm ${
                oauthStatus.startsWith('OAuth connected')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {oauthStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
