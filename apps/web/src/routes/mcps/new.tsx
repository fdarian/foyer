import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { McpDefinitionForm } from '../../components/McpDefinitionForm';
import { useCreateMcp } from '../../lib/useApi';

export const Route = createFileRoute('/mcps/new')({
  component: NewMcpComponent,
});

function NewMcpComponent() {
  const navigate = useNavigate();
  const createMcp = useCreateMcp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New MCP</h1>
      <McpDefinitionForm
        name={name}
        description={description}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        isPending={createMcp.isPending}
        submitLabel="Create"
        pendingLabel="Creating..."
        onSubmit={(e) => {
          e.preventDefault();
          createMcp.mutate(
            {
              name,
              description: description || undefined,
            },
            {
              onSuccess: () => {
                navigate({ to: '/mcps' });
              },
            },
          );
        }}
      />
    </div>
  );
}
