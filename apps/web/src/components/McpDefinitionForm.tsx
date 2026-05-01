import React from 'react';

export type McpDefinitionFormProps = {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
};

export function McpDefinitionForm(props: McpDefinitionFormProps) {
  return (
    <form
      onSubmit={props.onSubmit}
      className="space-y-4 max-w-md"
    >
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
          Description
        </label>
        <textarea
          value={props.description}
          onChange={(e) => props.onDescriptionChange(e.target.value)}
          rows={3}
          className="w-full rounded border px-3 py-2"
        />
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
