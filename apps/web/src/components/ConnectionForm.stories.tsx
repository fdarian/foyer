import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ConnectionForm } from './ConnectionForm';

const meta: Meta<typeof ConnectionForm> = {
  component: ConnectionForm,
  title: 'ConnectionForm',
};

export default meta;
type Story = StoryObj<typeof ConnectionForm>;

function Wrapper(props: {
  defaultTab?: 'apikey' | 'oauth';
  isPending?: boolean;
  oauthPending?: boolean;
}) {
  const [tab, setTab] = useState<'apikey' | 'oauth'>(
    props.defaultTab ?? 'apikey',
  );
  const [apiProvider, setApiProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [oauthProvider, setOauthProvider] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [authorizationEndpoint, setAuthorizationEndpoint] = useState('');
  const [tokenEndpoint, setTokenEndpoint] = useState('');
  const [redirectUrl, setRedirectUrl] = useState(
    'http://localhost:3000/oauth/callback',
  );
  const [scopes, setScopes] = useState('');
  const [oauthStatus, setOauthStatus] = useState<string | null>(null);

  return (
    <ConnectionForm
      tab={tab}
      onTabChange={setTab}
      apiProvider={apiProvider}
      apiKey={apiKey}
      onApiProviderChange={setApiProvider}
      onApiKeyChange={setApiKey}
      onApiKeySubmit={(e) => {
        e.preventDefault();
        alert(`API Key submit: ${apiProvider}`);
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
        setOauthStatus('Starting OAuth...');
      }}
      isPending={props.isPending ?? false}
      oauthPending={props.oauthPending ?? false}
    />
  );
}

export const ApiKeyTab: Story = {
  render: () => <Wrapper defaultTab="apikey" />,
};

export const OAuthTab: Story = {
  render: () => <Wrapper defaultTab="oauth" />,
};

export const Pending: Story = {
  render: () => <Wrapper isPending />,
};
