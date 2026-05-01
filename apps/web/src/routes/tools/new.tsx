import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ToolEditor } from '../../components/ToolEditor';
import { useCreateTool, useListMcps, useListSources } from '../../lib/useApi';

export const Route = createFileRoute('/tools/new')({
  component: NewToolComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mcpId: typeof search.mcpId === 'number' ? search.mcpId : undefined,
    };
  },
});

function NewToolComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const mcpsQuery = useListMcps();
  const sourcesQuery = useListSources();
  const createTool = useCreateTool();

  const [mcpId, setMcpId] = useState<number>(
    typeof search.mcpId === 'number' ? search.mcpId : 0,
  );
  const [sourceId, setSourceId] = useState<number>(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceOperation, setSourceOperation] = useState('');
  const [inputSchema, setInputSchema] = useState(
    JSON.stringify({ type: 'object', properties: {} }, null, 2),
  );
  const [postProcessJs, setPostProcessJs] = useState('');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  function parseSchema(): Record<string, unknown> | null {
    try {
      const parsed = JSON.parse(inputSchema);
      if (typeof parsed !== 'object' || parsed === null) {
        setSchemaError('Schema must be a JSON object');
        return null;
      }
      setSchemaError(null);
      return parsed as Record<string, unknown>;
    } catch (err) {
      setSchemaError(err instanceof Error ? err.message : 'Invalid JSON');
      return null;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New Tool</h1>
      <ToolEditor
        mcps={mcpsQuery.data ?? []}
        sources={sourcesQuery.data ?? []}
        mcpId={mcpId}
        sourceId={sourceId}
        name={name}
        description={description}
        sourceOperation={sourceOperation}
        inputSchema={inputSchema}
        postProcessJs={postProcessJs}
        schemaError={schemaError}
        onMcpIdChange={setMcpId}
        onSourceIdChange={setSourceId}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onSourceOperationChange={setSourceOperation}
        onInputSchemaChange={setInputSchema}
        onPostProcessJsChange={setPostProcessJs}
        isPending={createTool.isPending}
        submitLabel="Create"
        pendingLabel="Creating..."
        onSubmit={(e) => {
          e.preventDefault();
          const schema = parseSchema();
          if (!schema) return;
          if (mcpId === 0) {
            alert('Select an MCP');
            return;
          }
          if (sourceId === 0) {
            alert('Select a source');
            return;
          }
          createTool.mutate(
            {
              mcpId,
              name,
              description: description || undefined,
              inputSchema: schema,
              sourceId,
              sourceOperation,
              postProcessJs: postProcessJs || undefined,
            },
            {
              onSuccess: () => {
                const mcp = mcpsQuery.data?.find((m) => m.id === mcpId);
                if (mcp) {
                  navigate({
                    to: '/mcps/$mcpUuid',
                    params: { mcpUuid: mcp.uuid },
                  });
                } else {
                  navigate({ to: '/mcps' });
                }
              },
            },
          );
        }}
      />
    </div>
  );
}
