import Editor from '@monaco-editor/react';
import type React from 'react';

export type McpOption = { id: number; name: string };
export type SourceOption = { id: number; name: string; kind: string };

export type ToolEditorProps = {
  mcps: McpOption[];
  sources: SourceOption[];
  mcpId: number;
  sourceId: number;
  name: string;
  description: string;
  sourceOperation: string;
  inputSchema: string;
  postProcessJs: string;
  schemaError: string | null;
  onMcpIdChange: (id: number) => void;
  onSourceIdChange: (id: number) => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSourceOperationChange: (op: string) => void;
  onInputSchemaChange: (schema: string) => void;
  onPostProcessJsChange: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
  extraActions?: React.ReactNode;
};

export function ToolEditor(props: ToolEditorProps) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">MCP</label>
          <select
            value={props.mcpId}
            onChange={(e) => props.onMcpIdChange(Number(e.target.value))}
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value={0}>Select MCP...</option>
            {props.mcps.map((mcp) => (
              <option key={mcp.id} value={mcp.id}>
                {mcp.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Source</label>
          <select
            value={props.sourceId}
            onChange={(e) => props.onSourceIdChange(Number(e.target.value))}
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value={0}>Select source...</option>
            {props.sources.map((source) => (
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
          value={props.name}
          onChange={(e) => props.onNameChange(e.target.value)}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={props.description}
          onChange={(e) => props.onDescriptionChange(e.target.value)}
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
          value={props.sourceOperation}
          onChange={(e) => props.onSourceOperationChange(e.target.value)}
          required
          placeholder="e.g. getPetById or query.pets"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Input Schema (JSON)
        </label>
        <div className="rounded border overflow-hidden" style={{ height: 240 }}>
          <Editor
            language="json"
            value={props.inputSchema}
            onChange={(value) => props.onInputSchemaChange(value ?? '')}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
            }}
            theme="vs"
          />
        </div>
        {props.schemaError && (
          <p className="mt-1 text-sm text-red-600">{props.schemaError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Post-Process JS (optional)
        </label>
        <div className="rounded border overflow-hidden" style={{ height: 240 }}>
          <Editor
            language="javascript"
            value={props.postProcessJs}
            onChange={(value) => props.onPostProcessJsChange(value ?? '')}
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
          disabled={props.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {props.isPending ? props.pendingLabel : props.submitLabel}
        </button>
        {props.extraActions}
      </div>
    </form>
  );
}
