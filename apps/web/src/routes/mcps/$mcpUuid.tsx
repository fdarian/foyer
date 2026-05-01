import { Link, createFileRoute } from '@tanstack/react-router';
import {
  useGetMcp,
  useListTools,
  useDeleteTool,
} from '../../lib/useApi';
import { McpUrlCard } from '../../components/McpUrlCard';

export const Route = createFileRoute('/mcps/$mcpUuid')({
  component: McpDetailComponent,
});

function McpDetailComponent() {
  const params = Route.useParams();
  const mcpQuery = useGetMcp(params.mcpUuid);
  const toolsQuery = useListTools();
  const deleteTool = useDeleteTool();
  const baseUrl =
    import.meta.env.VITE_ENGINE_URL ?? 'http://localhost:3301';
  const mcpUrl = `${baseUrl}/mcp/${params.mcpUuid}`;

  async function copyUrl() {
    await navigator.clipboard.writeText(mcpUrl);
    alert('Copied to clipboard');
  }

  const mcpTools =
    toolsQuery.data?.filter((tool) => tool.mcpId === mcpQuery.data?.id) ??
    [];

  return (
    <div className="space-y-6">
      {mcpQuery.isLoading && <p>Loading...</p>}
      {mcpQuery.isError && (
        <p className="text-red-600">Error: {mcpQuery.error.message}</p>
      )}

      {mcpQuery.data && (
        <>
          <div>
            <h1 className="text-2xl font-bold">{mcpQuery.data.name}</h1>
            {mcpQuery.data.description && (
              <p className="text-gray-600 mt-1">
                {mcpQuery.data.description}
              </p>
            )}
          </div>

          <McpUrlCard mcpUrl={mcpUrl} onCopy={copyUrl} />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Tools</h2>
              <Link
                to="/tools/new"
                search={{ mcpId: mcpQuery.data.id }}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Tool
              </Link>
            </div>

            {toolsQuery.isLoading && <p>Loading tools...</p>}
            {mcpTools.length === 0 && (
              <p className="text-gray-500">No tools yet.</p>
            )}
            {mcpTools.length > 0 && (
              <ul className="space-y-2">
                {mcpTools.map((tool) => (
                  <li
                    key={tool.uuid}
                    className="flex items-center justify-between rounded border bg-white p-3"
                  >
                    <Link
                      to="/tools/$toolUuid"
                      params={{ toolUuid: tool.uuid }}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {tool.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(`Delete tool "${tool.name}"?`)
                        ) {
                          deleteTool.mutate(tool.uuid);
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
        </>
      )}
    </div>
  );
}
