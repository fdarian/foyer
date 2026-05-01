import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { apiClientPromise } from './api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function runAdmin<T>(
  fn: (api: Awaited<typeof apiClientPromise>) => Effect.Effect<T, Error>,
): Promise<T> {
  const api = await apiClientPromise;
  return Effect.runPromise(fn(api));
}

// ---------------------------------------------------------------------------
// MCPs
// ---------------------------------------------------------------------------

export function useListMcps() {
  return useQuery({
    queryKey: ['mcps'],
    queryFn: () => runAdmin((api) => api.admin.listMcps({})),
  });
}

export function useGetMcp(uuid: string) {
  return useQuery({
    queryKey: ['mcps', uuid],
    queryFn: () => runAdmin((api) => api.admin.getMcp({ path: { uuid } })),
    enabled: uuid.length > 0,
  });
}

export function useCreateMcp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      runAdmin((api) => api.admin.createMcp({ payload })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcps'] });
    },
  });
}

export function useUpdateMcp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      uuid: string;
      payload: { name?: string; description?: string };
    }) =>
      runAdmin((api) =>
        api.admin.updateMcp({
          path: { uuid: input.uuid },
          payload: input.payload,
        }),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mcps'] });
      queryClient.invalidateQueries({ queryKey: ['mcps', variables.uuid] });
    },
  });
}

export function useDeleteMcp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) =>
      runAdmin((api) => api.admin.deleteMcp({ path: { uuid } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcps'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export function useListSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: () => runAdmin((api) => api.admin.listSources({})),
  });
}

export function useGetSource(uuid: string) {
  return useQuery({
    queryKey: ['sources', uuid],
    queryFn: () => runAdmin((api) => api.admin.getSource({ path: { uuid } })),
    enabled: uuid.length > 0,
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      kind: 'mcp' | 'openapi' | 'graphql';
      name: string;
      config: Record<string, unknown>;
      connectionId?: number;
    }) => runAdmin((api) => api.admin.createSource({ payload })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}

export function useUpdateSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      uuid: string;
      payload: {
        name?: string;
        config?: Record<string, unknown>;
        connectionId?: number;
      };
    }) =>
      runAdmin((api) =>
        api.admin.updateSource({
          path: { uuid: input.uuid },
          payload: input.payload,
        }),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['sources', variables.uuid] });
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) =>
      runAdmin((api) => api.admin.deleteSource({ path: { uuid } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

export function useListTools() {
  return useQuery({
    queryKey: ['tools'],
    queryFn: () => runAdmin((api) => api.admin.listTools({})),
  });
}

export function useGetTool(uuid: string) {
  return useQuery({
    queryKey: ['tools', uuid],
    queryFn: () => runAdmin((api) => api.admin.getTool({ path: { uuid } })),
    enabled: uuid.length > 0,
  });
}

export function useCreateTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      mcpId: number;
      name: string;
      description?: string;
      inputSchema: Record<string, unknown>;
      sourceId: number;
      sourceOperation: string;
      postProcessJs?: string;
    }) => runAdmin((api) => api.admin.createTool({ payload })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

export function useUpdateTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      uuid: string;
      payload: {
        name?: string;
        description?: string;
        inputSchema?: Record<string, unknown>;
        sourceId?: number;
        sourceOperation?: string;
        postProcessJs?: string;
      };
    }) =>
      runAdmin((api) =>
        api.admin.updateTool({
          path: { uuid: input.uuid },
          payload: input.payload,
        }),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools', variables.uuid] });
    },
  });
}

export function useDeleteTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) =>
      runAdmin((api) => api.admin.deleteTool({ path: { uuid } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Connections
// ---------------------------------------------------------------------------

export function useListConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: () => runAdmin((api) => api.admin.listConnections({})),
  });
}

export function useGetConnection(uuid: string) {
  return useQuery({
    queryKey: ['connections', uuid],
    queryFn: () =>
      runAdmin((api) => api.admin.getConnection({ path: { uuid } })),
    enabled: uuid.length > 0,
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      provider: string;
      providerState: Record<string, unknown>;
    }) => runAdmin((api) => api.admin.createConnection({ payload })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      uuid: string;
      payload: {
        provider?: string;
        providerState?: Record<string, unknown>;
      };
    }) =>
      runAdmin((api) =>
        api.admin.updateConnection({
          path: { uuid: input.uuid },
          payload: input.payload,
        }),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({
        queryKey: ['connections', variables.uuid],
      });
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) =>
      runAdmin((api) => api.admin.deleteConnection({ path: { uuid } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export function useOAuthStart() {
  return useMutation({
    mutationFn: (payload: {
      endpoint: string;
      connectionId: string;
      redirectUrl: string;
      provider: string;
      scopes?: string[];
      clientId?: string;
      clientSecret?: string;
      authorizationEndpoint?: string;
      tokenEndpoint?: string;
    }) => runAdmin((api) => api.oauth.start({ payload })),
  });
}
