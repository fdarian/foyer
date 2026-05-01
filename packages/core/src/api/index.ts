import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export const Mcp = Schema.Struct({
  id: Schema.Number,
  uuid: Schema.String,
  name: Schema.String,
});

export class AdminApi extends HttpApiGroup.make('admin')
  .add(
    HttpApiEndpoint.get('listMcps', '/admin/mcps').addSuccess(
      Schema.Array(Mcp),
    ),
  ) {}

export class FoyerApi extends HttpApi.make('foyer').add(AdminApi) {}
