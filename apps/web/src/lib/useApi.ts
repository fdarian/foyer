import { useQuery } from '@tanstack/react-query';
import { Effect } from 'effect';
import { apiClientPromise } from './api';

export function useListMcps() {
  return useQuery({
    queryKey: ['mcps'],
    queryFn: async () => {
      const api = await apiClientPromise;
      return Effect.runPromise(api.admin.listMcps({}));
    },
  });
}
