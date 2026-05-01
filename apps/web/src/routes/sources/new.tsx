import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { SourceForm } from '../../components/SourceForm';
import { useCreateSource } from '../../lib/useApi';

export const Route = createFileRoute('/sources/new')({
  component: NewSourceComponent,
});

function NewSourceComponent() {
  const navigate = useNavigate();
  const createSource = useCreateSource();
  const [kind, setKind] = useState<'mcp' | 'openapi' | 'graphql'>('openapi');
  const [name, setName] = useState('');
  const [configJson, setConfigJson] = useState('{}');
  const [configError, setConfigError] = useState<string | null>(null);

  function parseConfig(): Record<string, unknown> | null {
    try {
      const parsed = JSON.parse(configJson);
      if (typeof parsed !== 'object' || parsed === null) {
        setConfigError('Config must be a JSON object');
        return null;
      }
      setConfigError(null);
      return parsed as Record<string, unknown>;
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Invalid JSON');
      return null;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New Source</h1>
      <SourceForm
        kind={kind}
        name={name}
        configJson={configJson}
        configError={configError}
        onKindChange={setKind}
        onNameChange={setName}
        onConfigJsonChange={setConfigJson}
        isPending={createSource.isPending}
        submitLabel="Create"
        pendingLabel="Creating..."
        onSubmit={(e) => {
          e.preventDefault();
          const config = parseConfig();
          if (!config) return;
          createSource.mutate(
            { kind, name, config },
            {
              onSuccess: () => {
                navigate({ to: '/sources' });
              },
            },
          );
        }}
      />
    </div>
  );
}
