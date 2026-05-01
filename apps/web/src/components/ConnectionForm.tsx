import type React from 'react';

export type ConnectionFormProps = {
  tab: 'apikey' | 'oauth';
  onTabChange: (tab: 'apikey' | 'oauth') => void;

  apiProvider: string;
  apiKey: string;
  onApiProviderChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onApiKeySubmit: (e: React.FormEvent) => void;

  oauthProvider: string;
  endpoint: string;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  redirectUrl: string;
  scopes: string;
  oauthStatus: string | null;
  onOauthProviderChange: (value: string) => void;
  onEndpointChange: (value: string) => void;
  onClientIdChange: (value: string) => void;
  onClientSecretChange: (value: string) => void;
  onAuthorizationEndpointChange: (value: string) => void;
  onTokenEndpointChange: (value: string) => void;
  onRedirectUrlChange: (value: string) => void;
  onScopesChange: (value: string) => void;
  onOauthConnect: () => void;

  isPending: boolean;
  oauthPending: boolean;
};

export function ConnectionForm(props: ConnectionFormProps) {
  return (
    <div>
      <div className="flex gap-4 border-b mb-4">
        <button
          type="button"
          onClick={() => props.onTabChange('apikey')}
          className={`pb-2 text-sm font-medium ${
            props.tab === 'apikey'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          API Key
        </button>
        <button
          type="button"
          onClick={() => props.onTabChange('oauth')}
          className={`pb-2 text-sm font-medium ${
            props.tab === 'oauth'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          OAuth
        </button>
      </div>

      {props.tab === 'apikey' && (
        <form onSubmit={props.onApiKeySubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <input
              type="text"
              value={props.apiProvider}
              onChange={(e) => props.onApiProviderChange(e.target.value)}
              required
              placeholder="e.g. openai"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={props.apiKey}
              onChange={(e) => props.onApiKeyChange(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={props.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {props.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {props.tab === 'oauth' && (
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <input
              type="text"
              value={props.oauthProvider}
              onChange={(e) => props.onOauthProviderChange(e.target.value)}
              placeholder="e.g. google"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endpoint</label>
            <input
              type="text"
              value={props.endpoint}
              onChange={(e) => props.onEndpointChange(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client ID</label>
            <input
              type="text"
              value={props.clientId}
              onChange={(e) => props.onClientIdChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={props.clientSecret}
              onChange={(e) => props.onClientSecretChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Authorization Endpoint
            </label>
            <input
              type="text"
              value={props.authorizationEndpoint}
              onChange={(e) =>
                props.onAuthorizationEndpointChange(e.target.value)
              }
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
              value={props.tokenEndpoint}
              onChange={(e) => props.onTokenEndpointChange(e.target.value)}
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
              value={props.redirectUrl}
              onChange={(e) => props.onRedirectUrlChange(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Scopes (comma-separated)
            </label>
            <input
              type="text"
              value={props.scopes}
              onChange={(e) => props.onScopesChange(e.target.value)}
              placeholder="read,write"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={props.onOauthConnect}
            disabled={props.oauthPending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {props.oauthPending ? 'Starting...' : 'Connect via OAuth'}
          </button>

          {props.oauthStatus && (
            <p
              className={`text-sm ${
                props.oauthStatus.startsWith('OAuth connected')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {props.oauthStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
