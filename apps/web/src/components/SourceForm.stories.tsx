import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SourceForm } from './SourceForm';

const meta: Meta<typeof SourceForm> = {
  component: SourceForm,
  title: 'SourceForm',
};

export default meta;
type Story = StoryObj<typeof SourceForm>;

function Wrapper(props: { isPending?: boolean; readOnlyKind?: boolean }) {
  const [kind, setKind] = useState<'mcp' | 'openapi' | 'graphql'>('openapi');
  const [name, setName] = useState('');
  const [configJson, setConfigJson] = useState('{}');
  const [configError, setConfigError] = useState<string | null>(null);

  return (
    <SourceForm
      kind={kind}
      name={name}
      configJson={configJson}
      configError={configError}
      onKindChange={setKind}
      onNameChange={setName}
      onConfigJsonChange={setConfigJson}
      onSubmit={(e) => {
        e.preventDefault();
        alert(`Submit: ${name}`);
      }}
      isPending={props.isPending ?? false}
      submitLabel="Create"
      pendingLabel="Creating..."
      readOnlyKind={props.readOnlyKind}
    />
  );
}

export const Default: Story = {
  render: () => <Wrapper />,
};

export const Pending: Story = {
  render: () => <Wrapper isPending />,
};

export const EditMode: Story = {
  render: () => <Wrapper readOnlyKind />,
};
