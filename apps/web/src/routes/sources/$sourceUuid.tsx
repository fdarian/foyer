import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  useGetSource,
  useUpdateSource,
  useDeleteSource,
} from '../../lib/useApi';
import { SourceForm } from '../../components/SourceForm';

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
        <>
          <SourceForm
            kind={sourceQuery.data.kind}
            name={name}
            configJson={configJson}
            configError={configError}
            onKindChange={() => {}}
            onNameChange={setName}
            onConfigJsonChange={setConfigJson}
            isPending={updateSource.isPending}
            submitLabel="Save"
            pendingLabel="Saving..."
            readOnlyKind
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
          />
          <div className="mt-4">
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
        </>
      )}
    </div>
  );
}
