import React from 'react';

export type SourceFormProps = {
  kind: 'mcp' | 'openapi' | 'graphql';
  name: string;
  configJson: string;
  configError: string | null;
  onKindChange: (kind: 'mcp' | 'openapi' | 'graphql') => void;
  onNameChange: (name: string) => void;
  onConfigJsonChange: (configJson: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
  readOnlyKind?: boolean;
};

export function SourceForm(props: SourceFormProps) {
  return (
    <form
      onSubmit={props.onSubmit}
      className="space-y-4 max-w-lg"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Kind</label>
        {props.readOnlyKind ? (
          <input
            type="text"
            value={props.kind}
            disabled
            className="w-full rounded border bg-gray-100 px-3 py-2"
          />
        ) : (
          <select
            value={props.kind}
            onChange={(e) =>
              props.onKindChange(e.target.value as 'mcp' | 'openapi' | 'graphql')
            }
            className="w-full rounded border px-3 py-2"
          >
            <option value="openapi">OpenAPI</option>
            <option value="mcp">MCP</option>
            <option value="graphql">GraphQL</option>
          </select>
        )}
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
        <label className="block text-sm font-medium mb-1">
          Config (JSON)
        </label>
        <textarea
          value={props.configJson}
          onChange={(e) => props.onConfigJsonChange(e.target.value)}
          rows={8}
          className="w-full rounded border px-3 py-2 font-mono text-sm"
        />
        {props.configError && (
          <p className="mt-1 text-sm text-red-600">{props.configError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Example for OpenAPI:{" "}
          {JSON.stringify({ url: 'https://example.com/openapi.json' })}
        </p>
      </div>
      <button
        type="submit"
        disabled={props.isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {props.isPending ? props.pendingLabel : props.submitLabel}
      </button>
    </form>
  );
}
