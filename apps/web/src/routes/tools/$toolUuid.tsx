import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tools/$toolUuid')({
  component: ToolDetailComponent,
});

function ToolDetailComponent() {
  const params = Route.useParams();
  return <h1 className="text-2xl font-bold">Tool: {params.toolUuid}</h1>;
}
