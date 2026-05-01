import { FetchHttpClient, HttpApiClient } from '@effect/platform';
import { FoyerApi } from '@foyer/core/api';
import { Effect } from 'effect';

export const apiClientPromise = Effect.runPromise(
  HttpApiClient.make(FoyerApi, {
    baseUrl: import.meta.env.VITE_ENGINE_URL ?? 'http://localhost:3301',
  }).pipe(Effect.provide(FetchHttpClient.layer)),
);
