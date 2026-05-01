import { FoyerApi } from '@foyer/core/api';
import { HttpApiClient } from '@effect/platform';
import { Effect } from 'effect';
import { FetchHttpClient } from '@effect/platform';

export const apiClientPromise = Effect.runPromise(
  HttpApiClient.make(FoyerApi, {
    baseUrl: import.meta.env.VITE_ENGINE_URL ?? 'http://localhost:3301',
  }).pipe(Effect.provide(FetchHttpClient.layer))
);
