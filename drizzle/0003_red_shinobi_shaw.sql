CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_template_id_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "prompt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "message" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "category_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "cloudinary_public_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "thumbnail_url";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "sort_order";