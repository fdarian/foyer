import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useCreateSource } from '../../lib/useApi';

export const Route = createFileRoute('/sources/new')({
  component: NewSourceComponent,
});

function NewSourceComponent() {
  const navigate = useNavigate();
  const createSource = useCreateSource();
  const [kind, setKind] = useState<'mcp' | 'openapi' | 'graphql'>('openapi');
  const [name, setName] = useState('');
  const [configJson, setConfigJson] = useState('{}');
  const [configError, setConfigError] = useState<string | null>(null);

  function parseConfig(): Record<string, unknown> | null {
    try {
      const parsed = JSON.parse(configJson);
      if (typeof parsed !== 'object' || parsed === null) {
        setConfigError('Config must be a JSON object');
        return null;
      }
      setConfigError(null);
      return parsed as Record<string, unknown>;
    } catch (err) {
      setConfigError(
        err instanceof Error ? err.message : 'Invalid JSON',
      );
      return null;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New Source</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const config = parseConfig();
          if (!config) return;
          createSource.mutate(
            { kind, name, config },
            {
              onSuccess: () => {
                navigate({ to: '/sources' });
              },
            },
          );
        }}
        className="space-y-4 max-w-lg"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Kind</label>
          <select
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as 'mcp' | 'openapi' | 'graphql')
            }
            className="w-full rounded border px-3 py-2"
          >
            <option value="openapi">OpenAPI</option>
            <option value="mcp">MCP</option>
            <option value="graphql">GraphQL</option>
          </select>
        </div>
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
          <label className="block text-sm font-medium mb-1">Config (JSON)</label>
          <textarea
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            rows={8}
            className="w-full rounded border px-3 py-2 font-mono text-sm"
          />
          {configError && (
            <p className="mt-1 text-sm text-red-600">{configError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Example for OpenAPI:{' '}
            {JSON.stringify({ url: 'https://example.com/openapi.json' })}
          </p>
        </div>
        <button
          type="submit"
          disabled={createSource.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createSource.isPending ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
