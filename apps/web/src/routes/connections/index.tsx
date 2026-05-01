import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/connections/')({
  component: ConnectionsListComponent,
});

function ConnectionsListComponent() {
  return <h1 className="text-2xl font-bold">Connections</h1>;
}
