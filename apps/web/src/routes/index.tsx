import { createFileRoute } from '@tanstack/react-router';
import { useListMcps } from '../lib/useApi';

export const Route = createFileRoute('/')({
  component: DashboardComponent,
});

function DashboardComponent() {
  const mcpsQuery = useListMcps();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {mcpsQuery.isLoading && <p>Loading...</p>}
      {mcpsQuery.isError && <p>Error: {mcpsQuery.error.message}</p>}
      {mcpsQuery.data && (
        <div>
          <h2 className="text-lg font-semibold mb-2">MCPs</h2>
          {mcpsQuery.data.length === 0 ? (
            <p className="text-gray-500">No MCPs yet.</p>
          ) : (
            <ul>
              {mcpsQuery.data.map((mcp) => (
                <li key={mcp.uuid}>{mcp.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
