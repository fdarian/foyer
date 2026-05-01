import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ToolEditor } from '../../components/ToolEditor';
import {
  useDeleteTool,
  useGetTool,
  useListMcps,
  useListSources,
  useUpdateTool,
} from '../../lib/useApi';

export const Route = createFileRoute('/tools/$toolUuid')({
  component: ToolDetailComponent,
});

function ToolDetailComponent() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const toolQuery = useGetTool(params.toolUuid);
  const mcpsQuery = useListMcps();
  const sourcesQuery = useListSources();
  const updateTool = useUpdateTool();
  const deleteTool = useDeleteTool();

  const [mcpId, setMcpId] = useState<number>(0);
  const [sourceId, setSourceId] = useState<number>(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceOperation, setSourceOperation] = useState('');
  const [inputSchema, setInputSchema] = useState('{}');
  const [postProcessJs, setPostProcessJs] = useState('');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  useEffect(() => {
    if (toolQuery.data) {
      setMcpId(toolQuery.data.mcpId);
      setSourceId(toolQuery.data.sourceId);
      setName(toolQuery.data.name);
      setDescription(toolQuery.data.description ?? '');
      setSourceOperation(toolQuery.data.sourceOperation);
      setInputSchema(JSON.stringify(toolQuery.data.inputSchema, null, 2));
      setPostProcessJs(toolQuery.data.postProcessJs ?? '');
    }
  }, [toolQuery.data]);

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
      <h1 className="text-2xl font-bold mb-4">Edit Tool</h1>

      {toolQuery.isLoading && <p>Loading...</p>}
      {toolQuery.isError && (
        <p className="text-red-600">Error: {toolQuery.error.message}</p>
      )}

      {toolQuery.data && (
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
          isPending={updateTool.isPending}
          submitLabel="Save"
          pendingLabel="Saving..."
          onSubmit={(e) => {
            e.preventDefault();
            const schema = parseSchema();
            if (!schema) return;
            const payload: {
              name?: string;
              description?: string;
              inputSchema?: Record<string, unknown>;
              sourceId?: number;
              sourceOperation?: string;
              postProcessJs?: string;
            } = {
              name,
              description: description || undefined,
              inputSchema: schema,
              sourceId,
              sourceOperation,
              postProcessJs: postProcessJs || undefined,
            };
            updateTool.mutate(
              { uuid: params.toolUuid, payload },
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
          extraActions={
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this tool?')) {
                  deleteTool.mutate(params.toolUuid, {
                    onSuccess: () => {
                      navigate({ to: '/mcps' });
                    },
                  });
                }
              }}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete
            </button>
          }
        />
      )}
    </div>
  );
}
