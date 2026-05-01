import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useDeleteMcp, useListMcps } from '../../lib/useApi';

export const Route = createFileRoute('/mcps/')({
  component: McpsListComponent,
});

function McpsListComponent() {
  const mcpsQuery = useListMcps();
  const deleteMcp = useDeleteMcp();
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">MCPs</h1>
        <Link
          to="/mcps/new"
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          New MCP
        </Link>
      </div>

      {mcpsQuery.isLoading && <p>Loading...</p>}
      {mcpsQuery.isError && (
        <p className="text-red-600">Error: {mcpsQuery.error.message}</p>
      )}

      {mcpsQuery.data && mcpsQuery.data.length === 0 && (
        <p className="text-gray-500">No MCPs yet.</p>
      )}

      {mcpsQuery.data && mcpsQuery.data.length > 0 && (
        <ul className="space-y-2">
          {mcpsQuery.data.map((mcp) => (
            <li
              key={mcp.uuid}
              className="flex items-center justify-between rounded border bg-white p-3"
            >
              <Link
                to="/mcps/$mcpUuid"
                params={{ mcpUuid: mcp.uuid }}
                className="font-medium text-blue-600 hover:underline"
              >
                {mcp.name}
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${mcp.name}"?`)) {
                    deleteMcp.mutate(mcp.uuid, {
                      onSuccess: () => {
                        navigate({ to: '/mcps' });
                      },
                    });
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
