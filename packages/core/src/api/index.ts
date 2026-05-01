import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export class AdminApi extends HttpApiGroup.make('admin')
  .add(
    HttpApiEndpoint.get('listMcps', '/admin/mcps').addSuccess(
      Schema.Array(Schema.Struct({})),
    ),
  ) {}

export class FoyerApi extends HttpApi.make('foyer').add(AdminApi) {}
