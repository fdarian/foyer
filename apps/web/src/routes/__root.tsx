import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl gap-6">
          <Link to="/" className="font-semibold text-gray-900">
            Foyer
          </Link>
          <Link to="/mcps" className="text-gray-600 hover:text-gray-900">
            MCPs
          </Link>
          <Link to="/sources" className="text-gray-600 hover:text-gray-900">
            Sources
          </Link>
          <Link to="/connections" className="text-gray-600 hover:text-gray-900">
            Connections
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
