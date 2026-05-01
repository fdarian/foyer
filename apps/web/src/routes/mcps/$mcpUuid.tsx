import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/mcps/$mcpUuid')({
  component: McpDetailComponent,
});

function McpDetailComponent() {
  const params = Route.useParams();
  return <h1 className="text-2xl font-bold">MCP: {params.mcpUuid}</h1>;
}
