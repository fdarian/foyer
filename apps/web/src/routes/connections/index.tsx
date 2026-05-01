import { createFileRoute, Link } from '@tanstack/react-router';
import { useDeleteConnection, useListConnections } from '../../lib/useApi';

export const Route = createFileRoute('/connections/')({
  component: ConnectionsListComponent,
});

function ConnectionsListComponent() {
  const connectionsQuery = useListConnections();
  const deleteConnection = useDeleteConnection();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Connections</h1>
        <Link
          to="/connections/new"
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Connection
        </Link>
      </div>

      {connectionsQuery.isLoading && <p>Loading...</p>}
      {connectionsQuery.isError && (
        <p className="text-red-600">Error: {connectionsQuery.error.message}</p>
      )}

      {connectionsQuery.data && connectionsQuery.data.length === 0 && (
        <p className="text-gray-500">No connections yet.</p>
      )}

      {connectionsQuery.data && connectionsQuery.data.length > 0 && (
        <ul className="space-y-2">
          {connectionsQuery.data.map((connection) => (
            <li
              key={connection.uuid}
              className="flex items-center justify-between rounded border bg-white p-3"
            >
              <div>
                <span className="font-medium">{connection.provider}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {connection.uuid.slice(0, 8)}...
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete connection "${connection.provider}"?`,
                    )
                  ) {
                    deleteConnection.mutate(connection.uuid);
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
