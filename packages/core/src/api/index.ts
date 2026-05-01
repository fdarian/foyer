import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';
import { AdminApi } from './admin.ts';
import { OAuthApi } from './oauth.ts';

export * from './schemas.ts';
export { AdminApi } from './admin.ts';
export { OAuthApi } from './oauth.ts';

export class FoyerApi extends HttpApi.make('foyer')
  .add(AdminApi)
  .add(OAuthApi) {}
