import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
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
      <form
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
        className="space-y-4 max-w-md"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={createMcp.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createMcp.isPending ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
