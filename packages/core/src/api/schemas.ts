import { Schema } from 'effect';

export const Mcp = Schema.Struct({
  id: Schema.Number,
  uuid: Schema.String,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  createdAt: Schema.DateFromString,
});

export type Mcp = typeof Mcp.Type;

export const CreateMcpInput = Schema.Struct({
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'option' }),
});

export type CreateMcpInput = typeof CreateMcpInput.Type;

export const UpdateMcpInput = Schema.Struct({
  name: Schema.optionalWith(Schema.String, { as: 'option' }),
  description: Schema.optionalWith(Schema.String, { as: 'option' }),
});

export type UpdateMcpInput = typeof UpdateMcpInput.Type;

export const Source = Schema.Struct({
  id: Schema.Number,
  uuid: Schema.String,
  kind: Schema.Literal('mcp', 'openapi', 'graphql'),
  name: Schema.String,
  config: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  connectionId: Schema.NullOr(Schema.Number),
  createdAt: Schema.DateFromString,
});

export type Source = typeof Source.Type;

export const CreateSourceInput = Schema.Struct({
  kind: Schema.Literal('mcp', 'openapi', 'graphql'),
  name: Schema.String,
  config: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  connectionId: Schema.optionalWith(Schema.Number, { as: 'option' }),
});

export type CreateSourceInput = typeof CreateSourceInput.Type;

export const UpdateSourceInput = Schema.Struct({
  name: Schema.optionalWith(Schema.String, { as: 'option' }),
  config: Schema.optionalWith(
    Schema.Record({ key: Schema.String, value: Schema.Unknown }),
    { as: 'option' },
  ),
  connectionId: Schema.optionalWith(Schema.Number, { as: 'option' }),
});

export type UpdateSourceInput = typeof UpdateSourceInput.Type;

export const Tool = Schema.Struct({
  id: Schema.Number,
  uuid: Schema.String,
  mcpId: Schema.Number,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  inputSchema: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  sourceId: Schema.Number,
  sourceOperation: Schema.String,
  postProcessJs: Schema.NullOr(Schema.String),
  createdAt: Schema.DateFromString,
});

export type Tool = typeof Tool.Type;

export const CreateToolInput = Schema.Struct({
  mcpId: Schema.Number,
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: 'option' }),
  inputSchema: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  sourceId: Schema.Number,
  sourceOperation: Schema.String,
  postProcessJs: Schema.optionalWith(Schema.String, { as: 'option' }),
});

export type CreateToolInput = typeof CreateToolInput.Type;

export const UpdateToolInput = Schema.Struct({
  name: Schema.optionalWith(Schema.String, { as: 'option' }),
  description: Schema.optionalWith(Schema.String, { as: 'option' }),
  inputSchema: Schema.optionalWith(
    Schema.Record({ key: Schema.String, value: Schema.Unknown }),
    { as: 'option' },
  ),
  sourceId: Schema.optionalWith(Schema.Number, { as: 'option' }),
  sourceOperation: Schema.optionalWith(Schema.String, { as: 'option' }),
  postProcessJs: Schema.optionalWith(Schema.String, { as: 'option' }),
});

export type UpdateToolInput = typeof UpdateToolInput.Type;

export const Connection = Schema.Struct({
  id: Schema.Number,
  uuid: Schema.String,
  provider: Schema.String,
  accessTokenSecretId: Schema.NullOr(Schema.Number),
  refreshTokenSecretId: Schema.NullOr(Schema.Number),
  expiresAt: Schema.NullOr(Schema.DateFromString),
  providerState: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  createdAt: Schema.DateFromString,
});

export type Connection = typeof Connection.Type;

export const CreateConnectionInput = Schema.Struct({
  provider: Schema.String,
  providerState: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
});

export type CreateConnectionInput = typeof CreateConnectionInput.Type;

export const UpdateConnectionInput = Schema.Struct({
  provider: Schema.optionalWith(Schema.String, { as: 'option' }),
  providerState: Schema.optionalWith(
    Schema.Record({ key: Schema.String, value: Schema.Unknown }),
    { as: 'option' },
  ),
});

export type UpdateConnectionInput = typeof UpdateConnectionInput.Type;

export const Secret = Schema.Struct({
  id: Schema.Number,
  uuid: Schema.String,
  name: Schema.String,
  ownedByConnectionId: Schema.NullOr(Schema.Number),
  createdAt: Schema.DateFromString,
});

export type Secret = typeof Secret.Type;

export const CreateSecretInput = Schema.Struct({
  name: Schema.String,
  value: Schema.String,
});

export type CreateSecretInput = typeof CreateSecretInput.Type;
