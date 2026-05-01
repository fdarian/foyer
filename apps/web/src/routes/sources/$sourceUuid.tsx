import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  useGetSource,
  useUpdateSource,
  useDeleteSource,
} from '../../lib/useApi';

export const Route = createFileRoute('/sources/$sourceUuid')({
  component: SourceDetailComponent,
});

function SourceDetailComponent() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const sourceQuery = useGetSource(params.sourceUuid);
  const updateSource = useUpdateSource();
  const deleteSource = useDeleteSource();

  const [name, setName] = useState('');
  const [configJson, setConfigJson] = useState('{}');
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (sourceQuery.data) {
      setName(sourceQuery.data.name);
      setConfigJson(JSON.stringify(sourceQuery.data.config, null, 2));
    }
  }, [sourceQuery.data]);

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
      <h1 className="text-2xl font-bold mb-4">Edit Source</h1>

      {sourceQuery.isLoading && <p>Loading...</p>}
      {sourceQuery.isError && (
        <p className="text-red-600">Error: {sourceQuery.error.message}</p>
      )}

      {sourceQuery.data && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const config = parseConfig();
            if (!config) return;
            updateSource.mutate(
              { uuid: params.sourceUuid, payload: { name, config } },
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
            <input
              type="text"
              value={sourceQuery.data.kind}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
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
            <label className="block text-sm font-medium mb-1">
              Config (JSON)
            </label>
            <textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              rows={8}
              className="w-full rounded border px-3 py-2 font-mono text-sm"
            />
            {configError && (
              <p className="mt-1 text-sm text-red-600">{configError}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updateSource.isPending}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateSource.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this source?')) {
                  deleteSource.mutate(params.sourceUuid, {
                    onSuccess: () => {
                      navigate({ to: '/sources' });
                    },
                  });
                }
              }}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
