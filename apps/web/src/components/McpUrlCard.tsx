import React from 'react';

export type McpUrlCardProps = {
  mcpUrl: string;
  onCopy: () => void;
};

export function McpUrlCard(props: McpUrlCardProps) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="text-sm font-medium mb-2">MCP URL</div>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm">
          {props.mcpUrl}
        </code>
        <button
          type="button"
          onClick={props.onCopy}
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
