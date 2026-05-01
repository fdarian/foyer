import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import {
  useCreateConnection,
  useOAuthStart,
} from '../../lib/useApi';
import { ConnectionForm } from '../../components/ConnectionForm';

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

  const [apiProvider, setApiProvider] = useState('');
  const [apiKey, setApiKey] = useState('');

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
      <ConnectionForm
        tab={tab}
        onTabChange={setTab}
        apiProvider={apiProvider}
        apiKey={apiKey}
        onApiProviderChange={setApiProvider}
        onApiKeyChange={setApiKey}
        onApiKeySubmit={(e) => {
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
        oauthProvider={oauthProvider}
        endpoint={endpoint}
        clientId={clientId}
        clientSecret={clientSecret}
        authorizationEndpoint={authorizationEndpoint}
        tokenEndpoint={tokenEndpoint}
        redirectUrl={redirectUrl}
        scopes={scopes}
        oauthStatus={oauthStatus}
        onOauthProviderChange={setOauthProvider}
        onEndpointChange={setEndpoint}
        onClientIdChange={setClientId}
        onClientSecretChange={setClientSecret}
        onAuthorizationEndpointChange={setAuthorizationEndpoint}
        onTokenEndpointChange={setTokenEndpoint}
        onRedirectUrlChange={setRedirectUrl}
        onScopesChange={setScopes}
        onOauthConnect={() => {
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
        isPending={createConnection.isPending}
        oauthPending={oauthStart.isPending}
      />
    </div>
  );
}
