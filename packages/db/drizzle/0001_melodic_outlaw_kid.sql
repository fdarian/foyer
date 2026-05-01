ALTER TABLE "oauth2_sessions" ADD COLUMN "connectionId" text;--> statement-breakpoint
ALTER TABLE "oauth2_sessions" ADD COLUMN "redirectUrl" text;--> statement-breakpoint
ALTER TABLE "oauth2_sessions" ADD COLUMN "metadata" jsonb;