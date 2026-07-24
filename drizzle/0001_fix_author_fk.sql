-- Fix legacy Stack Auth FK → Managed Better Auth user table
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_author_id_users_sync_id_fk";
--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "image_url" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "author_id" SET DATA TYPE uuid USING "author_id"::uuid;
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "neon_auth"."user"("id") ON DELETE no action ON UPDATE no action;
