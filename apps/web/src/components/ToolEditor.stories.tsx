import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ToolEditor } from './ToolEditor';

const meta: Meta<typeof ToolEditor> = {
  component: ToolEditor,
  title: 'ToolEditor',
};

export default meta;
type Story = StoryObj<typeof ToolEditor>;

const sampleMcps = [
  { id: 1, name: 'Production MCP' },
  { id: 2, name: 'Staging MCP' },
];

const sampleSources = [
  { id: 1, name: 'Petstore API', kind: 'openapi' },
  { id: 2, name: 'GitHub GraphQL', kind: 'graphql' },
];

function Wrapper(props: { isPending?: boolean }) {
  const [mcpId, setMcpId] = useState(0);
  const [sourceId, setSourceId] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceOperation, setSourceOperation] = useState('');
  const [inputSchema, setInputSchema] = useState(
    JSON.stringify({ type: 'object', properties: {} }, null, 2),
  );
  const [postProcessJs, setPostProcessJs] = useState('');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  return (
    <ToolEditor
      mcps={sampleMcps}
      sources={sampleSources}
      mcpId={mcpId}
      sourceId={sourceId}
      name={name}
      description={description}
      sourceOperation={sourceOperation}
      inputSchema={inputSchema}
      postProcessJs={postProcessJs}
      schemaError={schemaError}
      onMcpIdChange={setMcpId}
      onSourceIdChange={setSourceId}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onSourceOperationChange={setSourceOperation}
      onInputSchemaChange={setInputSchema}
      onPostProcessJsChange={setPostProcessJs}
      onSubmit={(e) => {
        e.preventDefault();
        alert(`Submit: ${name}`);
      }}
      isPending={props.isPending ?? false}
      submitLabel="Create"
      pendingLabel="Creating..."
    />
  );
}

export const Default: Story = {
  render: () => <Wrapper />,
};

export const Pending: Story = {
  render: () => <Wrapper isPending />,
};
