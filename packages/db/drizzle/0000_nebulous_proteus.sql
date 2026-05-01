CREATE TYPE "public"."source_kind" AS ENUM('mcp', 'openapi', 'graphql');--> statement-breakpoint
CREATE TABLE "connections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"userId" text NOT NULL,
	"provider" text NOT NULL,
	"accessTokenSecretId" bigint,
	"refreshTokenSecretId" bigint,
	"expiresAt" timestamp,
	"providerState" jsonb NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "connections_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "mcps" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "mcps_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "oauth2_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"codeVerifier" text NOT NULL,
	"provider" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	CONSTRAINT "oauth2_sessions_state_unique" UNIQUE("state")
);
--> statement-breakpoint
CREATE TABLE "secrets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"encryptedValue" "bytea" NOT NULL,
	"iv" "bytea" NOT NULL,
	"ownedByConnectionId" bigint,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "secrets_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"userId" text NOT NULL,
	"kind" "source_kind" NOT NULL,
	"name" text NOT NULL,
	"config" jsonb NOT NULL,
	"connectionId" bigint,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "sources_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"mcpId" bigint NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"inputSchema" jsonb NOT NULL,
	"sourceId" bigint NOT NULL,
	"sourceOperation" text NOT NULL,
	"postProcessJs" text,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "tools_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_accessTokenSecretId_secrets_id_fk" FOREIGN KEY ("accessTokenSecretId") REFERENCES "public"."secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_refreshTokenSecretId_secrets_id_fk" FOREIGN KEY ("refreshTokenSecretId") REFERENCES "public"."secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_ownedByConnectionId_connections_id_fk" FOREIGN KEY ("ownedByConnectionId") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_connectionId_connections_id_fk" FOREIGN KEY ("connectionId") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_mcpId_mcps_id_fk" FOREIGN KEY ("mcpId") REFERENCES "public"."mcps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_sourceId_sources_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;