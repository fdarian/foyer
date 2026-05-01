import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sources/new')({
  component: NewSourceComponent,
});

function NewSourceComponent() {
  return <h1 className="text-2xl font-bold">New Source</h1>;
}
