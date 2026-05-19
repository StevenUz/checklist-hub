CREATE TYPE "public"."checklist_status" AS ENUM('active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."suggestion_status" AS ENUM('pending', 'accepted', 'rejected', 'implemented');--> statement-breakpoint
CREATE TYPE "public"."suggestion_type" AS ENUM('new_template', 'template_edit', 'template_variant');--> statement-breakpoint
CREATE TYPE "public"."template_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_category_name_unique" UNIQUE("category_id","name")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"activity_id" integer,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" "template_status" DEFAULT 'draft' NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"parent_template_id" integer,
	"created_by_user_id" integer NOT NULL,
	"updated_by_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestion_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"suggestion_id" integer NOT NULL,
	"user_id" integer,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"target_template_id" integer,
	"type" "suggestion_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "suggestion_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"reviewed_by_user_id" integer,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"text" text NOT NULL,
	"description" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "template_ratings_template_user_unique" UNIQUE("template_id","user_id"),
	CONSTRAINT "template_ratings_rating_check" CHECK ("template_ratings"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "template_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_checklist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_checklist_section_id" integer NOT NULL,
	"source_template_item_id" integer,
	"text" text NOT NULL,
	"description" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_checklist_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_checklist_id" integer NOT NULL,
	"source_template_section_id" integer,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"template_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" "checklist_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_parent_template_id_fk" FOREIGN KEY ("parent_template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "suggestion_comments" ADD CONSTRAINT "suggestion_comments_suggestion_id_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."suggestions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "suggestion_comments" ADD CONSTRAINT "suggestion_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_target_template_id_checklist_templates_id_fk" FOREIGN KEY ("target_template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "template_items" ADD CONSTRAINT "template_items_section_id_template_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."template_sections"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "template_ratings" ADD CONSTRAINT "template_ratings_template_id_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "template_ratings" ADD CONSTRAINT "template_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_template_id_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_checklist_items" ADD CONSTRAINT "user_checklist_items_user_checklist_section_id_user_checklist_sections_id_fk" FOREIGN KEY ("user_checklist_section_id") REFERENCES "public"."user_checklist_sections"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_checklist_items" ADD CONSTRAINT "user_checklist_items_source_template_item_id_template_items_id_fk" FOREIGN KEY ("source_template_item_id") REFERENCES "public"."template_items"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_checklist_sections" ADD CONSTRAINT "user_checklist_sections_user_checklist_id_user_checklists_id_fk" FOREIGN KEY ("user_checklist_id") REFERENCES "public"."user_checklists"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_checklist_sections" ADD CONSTRAINT "user_checklist_sections_source_template_section_id_template_sections_id_fk" FOREIGN KEY ("source_template_section_id") REFERENCES "public"."template_sections"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_checklists" ADD CONSTRAINT "user_checklists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_checklists" ADD CONSTRAINT "user_checklists_template_id_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "activities_category_id_idx" ON "activities" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activities_slug_idx" ON "activities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "checklist_templates_category_id_idx" ON "checklist_templates" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "checklist_templates_activity_id_idx" ON "checklist_templates" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "checklist_templates_status_idx" ON "checklist_templates" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "checklist_templates_slug_idx" ON "checklist_templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "checklist_templates_parent_template_id_idx" ON "checklist_templates" USING btree ("parent_template_id");--> statement-breakpoint
CREATE INDEX "checklist_templates_created_by_user_id_idx" ON "checklist_templates" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "suggestion_comments_suggestion_id_idx" ON "suggestion_comments" USING btree ("suggestion_id");--> statement-breakpoint
CREATE INDEX "suggestion_comments_user_id_idx" ON "suggestion_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "suggestions_user_id_idx" ON "suggestions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "suggestions_status_idx" ON "suggestions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "suggestions_target_template_id_idx" ON "suggestions" USING btree ("target_template_id");--> statement-breakpoint
CREATE INDEX "suggestions_reviewed_by_user_id_idx" ON "suggestions" USING btree ("reviewed_by_user_id");--> statement-breakpoint
CREATE INDEX "suggestions_status_created_at_idx" ON "suggestions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "template_items_section_id_idx" ON "template_items" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "template_items_section_sort_idx" ON "template_items" USING btree ("section_id","sort_order");--> statement-breakpoint
CREATE INDEX "template_ratings_template_id_idx" ON "template_ratings" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_ratings_user_id_idx" ON "template_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "template_sections_template_id_idx" ON "template_sections" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_sections_template_sort_idx" ON "template_sections" USING btree ("template_id","sort_order");--> statement-breakpoint
CREATE INDEX "user_checklist_items_user_checklist_section_id_idx" ON "user_checklist_items" USING btree ("user_checklist_section_id");--> statement-breakpoint
CREATE INDEX "user_checklist_items_source_template_item_id_idx" ON "user_checklist_items" USING btree ("source_template_item_id");--> statement-breakpoint
CREATE INDEX "user_checklist_items_completion_idx" ON "user_checklist_items" USING btree ("is_completed");--> statement-breakpoint
CREATE INDEX "user_checklist_items_section_sort_idx" ON "user_checklist_items" USING btree ("user_checklist_section_id","sort_order");--> statement-breakpoint
CREATE INDEX "user_checklist_sections_user_checklist_id_idx" ON "user_checklist_sections" USING btree ("user_checklist_id");--> statement-breakpoint
CREATE INDEX "user_checklist_sections_source_template_section_id_idx" ON "user_checklist_sections" USING btree ("source_template_section_id");--> statement-breakpoint
CREATE INDEX "user_checklist_sections_checklist_sort_idx" ON "user_checklist_sections" USING btree ("user_checklist_id","sort_order");--> statement-breakpoint
CREATE INDEX "user_checklists_user_id_idx" ON "user_checklists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_checklists_status_idx" ON "user_checklists" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_checklists_template_id_idx" ON "user_checklists" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "user_checklists_user_status_idx" ON "user_checklists" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");