CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"overlay_config" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "template_id" text;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "name_color" varchar(20);--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "message_color" varchar(20);--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "photo_transform" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp" varchar(6);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp_expires" timestamp;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;