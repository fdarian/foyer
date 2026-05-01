import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { McpDefinitionForm } from './McpDefinitionForm';

const meta: Meta<typeof McpDefinitionForm> = {
  component: McpDefinitionForm,
  title: 'McpDefinitionForm',
};

export default meta;
type Story = StoryObj<typeof McpDefinitionForm>;

function Wrapper(props: { isPending?: boolean }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  return (
    <McpDefinitionForm
      name={name}
      description={description}
      onNameChange={setName}
      onDescriptionChange={setDescription}
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
