import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  useGetTool,
  useUpdateTool,
  useDeleteTool,
  useListMcps,
  useListSources,
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
      setSchemaError(
        err instanceof Error ? err.message : 'Invalid JSON',
      );
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
        <form
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
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">MCP</label>
              <select
                value={mcpId}
                onChange={(e) => setMcpId(Number(e.target.value))}
                required
                className="w-full rounded border px-3 py-2"
              >
                <option value={0}>Select MCP...</option>
                {mcpsQuery.data?.map((mcp) => (
                  <option key={mcp.id} value={mcp.id}>
                    {mcp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Source
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(Number(e.target.value))}
                required
                className="w-full rounded border px-3 py-2"
              >
                <option value={0}>Select source...</option>
                {sourcesQuery.data?.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name} ({source.kind})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Source Operation
            </label>
            <input
              type="text"
              value={sourceOperation}
              onChange={(e) => setSourceOperation(e.target.value)}
              required
              placeholder="e.g. getPetById or query.pets"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Input Schema (JSON)
            </label>
            <div
              className="rounded border overflow-hidden"
              style={{ height: 240 }}
            >
              <Editor
                language="json"
                value={inputSchema}
                onChange={(value) => setInputSchema(value ?? '')}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
                theme="vs"
              />
            </div>
            {schemaError && (
              <p className="mt-1 text-sm text-red-600">{schemaError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Post-Process JS (optional)
            </label>
            <div
              className="rounded border overflow-hidden"
              style={{ height: 240 }}
            >
              <Editor
                language="javascript"
                value={postProcessJs}
                onChange={(value) => setPostProcessJs(value ?? '')}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
                theme="vs"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updateTool.isPending}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateTool.isPending ? 'Saving...' : 'Save'}
            </button>
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
          </div>
        </form>
      )}
    </div>
  );
}
