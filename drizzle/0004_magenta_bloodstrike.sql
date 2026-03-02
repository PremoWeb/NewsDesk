CREATE TABLE "article_custom_field_value" (
	"article_id" text NOT NULL,
	"field_id" text NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "custom_field" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"options" text,
	"required" boolean DEFAULT false NOT NULL,
	"default_value" text,
	"placeholder" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "custom_field_name_unique" UNIQUE("name"),
	CONSTRAINT "custom_field_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media_asset" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"alt_text" text,
	"credit" text,
	"width" integer,
	"height" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"uploaded_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planning_event" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planning_item" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text,
	"title" text NOT NULL,
	"description" text,
	"coverage_type" text DEFAULT 'text' NOT NULL,
	"status" text DEFAULT 'unassigned' NOT NULL,
	"assigned_to" text,
	"article_id" text,
	"deadline" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_custom_field_value" ADD CONSTRAINT "article_custom_field_value_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_custom_field_value" ADD CONSTRAINT "article_custom_field_value_field_id_custom_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."custom_field"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning_event" ADD CONSTRAINT "planning_event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning_item" ADD CONSTRAINT "planning_item_event_id_planning_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."planning_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning_item" ADD CONSTRAINT "planning_item_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning_item" ADD CONSTRAINT "planning_item_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning_item" ADD CONSTRAINT "planning_item_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_custom_field_articleId_idx" ON "article_custom_field_value" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "article_custom_field_fieldId_idx" ON "article_custom_field_value" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "media_asset_uploadedBy_idx" ON "media_asset" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "media_asset_mimeType_idx" ON "media_asset" USING btree ("mime_type");--> statement-breakpoint
CREATE INDEX "planning_event_startAt_idx" ON "planning_event" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "planning_event_status_idx" ON "planning_event" USING btree ("status");--> statement-breakpoint
CREATE INDEX "planning_item_eventId_idx" ON "planning_item" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "planning_item_assignedTo_idx" ON "planning_item" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "planning_item_status_idx" ON "planning_item" USING btree ("status");