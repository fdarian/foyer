import { HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';
import {
  Connection,
  CreateConnectionInput,
  CreateMcpInput,
  CreateSourceInput,
  CreateToolInput,
  Mcp,
  Source,
  Tool,
  UpdateConnectionInput,
  UpdateMcpInput,
  UpdateSourceInput,
  UpdateToolInput,
} from './schemas.ts';

export class AdminApi extends HttpApiGroup.make('admin')
  .add(
    HttpApiEndpoint.get('listMcps', '/admin/mcps').addSuccess(
      Schema.Array(Mcp),
    ),
  )
  .add(
    HttpApiEndpoint.post('createMcp', '/admin/mcps')
      .setPayload(CreateMcpInput)
      .addSuccess(Mcp),
  )
  .add(
    HttpApiEndpoint.get('getMcp', '/admin/mcps/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .addSuccess(Mcp),
  )
  .add(
    HttpApiEndpoint.put('updateMcp', '/admin/mcps/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .setPayload(UpdateMcpInput)
      .addSuccess(Mcp),
  )
  .add(
    HttpApiEndpoint.del('deleteMcp', '/admin/mcps/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .addSuccess(Mcp),
  )
  .add(
    HttpApiEndpoint.get('listSources', '/admin/sources').addSuccess(
      Schema.Array(Source),
    ),
  )
  .add(
    HttpApiEndpoint.post('createSource', '/admin/sources')
      .setPayload(CreateSourceInput)
      .addSuccess(Source),
  )
  .add(
    HttpApiEndpoint.get('getSource', '/admin/sources/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .addSuccess(Source),
  )
  .add(
    HttpApiEndpoint.put('updateSource', '/admin/sources/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .setPayload(UpdateSourceInput)
      .addSuccess(Source),
  )
  .add(
    HttpApiEndpoint.del('deleteSource', '/admin/sources/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .addSuccess(Source),
  )
  .add(
    HttpApiEndpoint.get('listTools', '/admin/tools').addSuccess(
      Schema.Array(Tool),
    ),
  )
  .add(
    HttpApiEndpoint.post('createTool', '/admin/tools')
      .setPayload(CreateToolInput)
      .addSuccess(Tool),
  )
  .add(
    HttpApiEndpoint.get('getTool', '/admin/tools/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .addSuccess(Tool),
  )
  .add(
    HttpApiEndpoint.put('updateTool', '/admin/tools/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .setPayload(UpdateToolInput)
      .addSuccess(Tool),
  )
  .add(
    HttpApiEndpoint.del('deleteTool', '/admin/tools/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .addSuccess(Tool),
  )
  .add(
    HttpApiEndpoint.get('listConnections', '/admin/connections').addSuccess(
      Schema.Array(Connection),
    ),
  )
  .add(
    HttpApiEndpoint.post('createConnection', '/admin/connections')
      .setPayload(CreateConnectionInput)
      .addSuccess(Connection),
  )
  .add(
    HttpApiEndpoint.get('getConnection', '/admin/connections/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .addSuccess(Connection),
  )
  .add(
    HttpApiEndpoint.put('updateConnection', '/admin/connections/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .setPayload(UpdateConnectionInput)
      .addSuccess(Connection),
  )
  .add(
    HttpApiEndpoint.del('deleteConnection', '/admin/connections/:uuid')
      .setPath(Schema.Struct({ uuid: Schema.String }))
      .addSuccess(Connection),
  ) {}
