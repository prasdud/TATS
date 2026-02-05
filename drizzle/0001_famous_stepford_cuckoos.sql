CREATE TYPE "public"."status" AS ENUM('pending', 'processing', 'looks_fine', 'needs_review', 'low_effort', 'github_failed', 'ai_failed', 'unknown_failed');--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "status" "status" DEFAULT 'pending';--> statement-breakpoint
UPDATE "candidates" SET "status" = "screening_status"::text::"public"."status" WHERE "screening_status" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "screening_status";--> statement-breakpoint
DROP TYPE "public"."screening_status";