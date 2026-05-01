import { Link, createFileRoute } from '@tanstack/react-router';
import {
  useListSources,
  useDeleteSource,
} from '../../lib/useApi';

export const Route = createFileRoute('/sources/')({
  component: SourcesListComponent,
});

function SourcesListComponent() {
  const sourcesQuery = useListSources();
  const deleteSource = useDeleteSource();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Sources</h1>
        <Link
          to="/sources/new"
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Source
        </Link>
      </div>

      {sourcesQuery.isLoading && <p>Loading...</p>}
      {sourcesQuery.isError && (
        <p className="text-red-600">Error: {sourcesQuery.error.message}</p>
      )}

      {sourcesQuery.data && sourcesQuery.data.length === 0 && (
        <p className="text-gray-500">No sources yet.</p>
      )}

      {sourcesQuery.data && sourcesQuery.data.length > 0 && (
        <ul className="space-y-2">
          {sourcesQuery.data.map((source) => (
            <li
              key={source.uuid}
              className="flex items-center justify-between rounded border bg-white p-3"
            >
              <div>
                <Link
                  to="/sources/$sourceUuid"
                  params={{ sourceUuid: source.uuid }}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {source.name}
                </Link>
                <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {source.kind}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${source.name}"?`)) {
                    deleteSource.mutate(source.uuid);
                  }
                }}
                className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
