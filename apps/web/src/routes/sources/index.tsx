import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sources/')({
  component: SourcesListComponent,
});

function SourcesListComponent() {
  return <h1 className="text-2xl font-bold">Sources</h1>;
}
