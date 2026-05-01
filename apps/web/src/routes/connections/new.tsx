import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/connections/new')({
  component: NewConnectionComponent,
});

function NewConnectionComponent() {
  return <h1 className="text-2xl font-bold">New Connection</h1>;
}
