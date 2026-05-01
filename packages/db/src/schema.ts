import {
  bigserial,
  customType,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  bigint,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

export const sourceKind = pgEnum('source_kind', ['mcp', 'openapi', 'graphql']);

export const mcps = pgTable('mcps', {
  id: bigserial({ mode: 'number' }).primaryKey(),
  uuid: uuid().notNull().unique().$defaultFn(() => uuidv7()),
  userId: text().notNull(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp().$defaultFn(() => new Date()).notNull(),
});

export const sources = pgTable('sources', {
  id: bigserial({ mode: 'number' }).primaryKey(),
  uuid: uuid().notNull().unique().$defaultFn(() => uuidv7()),
  userId: text().notNull(),
  kind: sourceKind().notNull(),
  name: text().notNull(),
  config: jsonb().notNull(),
  connectionId: bigint({ mode: 'number' }).references(() => connections.id),
  createdAt: timestamp().$defaultFn(() => new Date()).notNull(),
});

export const tools = pgTable('tools', {
  id: bigserial({ mode: 'number' }).primaryKey(),
  uuid: uuid().notNull().unique().$defaultFn(() => uuidv7()),
  mcpId: bigint({ mode: 'number' })
    .notNull()
    .references(() => mcps.id),
  name: text().notNull(),
  description: text(),
  inputSchema: jsonb().notNull(),
  sourceId: bigint({ mode: 'number' })
    .notNull()
    .references(() => sources.id),
  sourceOperation: text().notNull(),
  postProcessJs: text(),
  createdAt: timestamp().$defaultFn(() => new Date()).notNull(),
});

export const connections = pgTable('connections', {
  id: bigserial({ mode: 'number' }).primaryKey(),
  uuid: uuid().notNull().unique().$defaultFn(() => uuidv7()),
  userId: text().notNull(),
  provider: text().notNull(),
  accessTokenSecretId: bigint({ mode: 'number' }).references(() => secrets.id),
  refreshTokenSecretId: bigint({ mode: 'number' }).references(() => secrets.id),
  expiresAt: timestamp(),
  providerState: jsonb().notNull(),
  createdAt: timestamp().$defaultFn(() => new Date()).notNull(),
});

export const secrets = pgTable('secrets', {
  id: bigserial({ mode: 'number' }).primaryKey(),
  uuid: uuid().notNull().unique().$defaultFn(() => uuidv7()),
  userId: text().notNull(),
  name: text().notNull(),
  encryptedValue: bytea().notNull(),
  iv: bytea().notNull(),
  ownedByConnectionId: bigint({ mode: 'number' }).references(
    () => connections.id,
  ),
  createdAt: timestamp().$defaultFn(() => new Date()).notNull(),
});

export const oauth2Sessions = pgTable('oauth2_sessions', {
  id: bigserial({ mode: 'number' }).primaryKey(),
  state: text().notNull().unique(),
  codeVerifier: text().notNull(),
  provider: text().notNull(),
  userId: text().notNull(),
  connectionId: text(),
  redirectUrl: text(),
  metadata: jsonb(),
  createdAt: timestamp().$defaultFn(() => new Date()).notNull(),
  expiresAt: timestamp().notNull(),
});
