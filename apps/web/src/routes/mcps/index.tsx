import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/mcps/')({
  component: McpsListComponent,
});

function McpsListComponent() {
  return <h1 className="text-2xl font-bold">MCPs</h1>;
}
