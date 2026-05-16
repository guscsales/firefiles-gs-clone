CREATE TYPE "public"."meeting_status" AS ENUM('recording', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "meeting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"transcript_output" jsonb,
	"summary" text,
	"action_items" jsonb,
	"status" "meeting_status" DEFAULT 'recording' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
