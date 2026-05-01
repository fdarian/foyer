import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/mcps/new')({
  component: NewMcpComponent,
});

function NewMcpComponent() {
  return <h1 className="text-2xl font-bold">New MCP</h1>;
}
