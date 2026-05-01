import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tools/new')({
  component: NewToolComponent,
});

function NewToolComponent() {
  return <h1 className="text-2xl font-bold">New Tool</h1>;
}
