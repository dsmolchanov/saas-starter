CREATE TABLE "focus_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"icon" varchar(50),
	CONSTRAINT "focus_areas_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "lesson_focus_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"focus_area_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "duration_min" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "duration_min" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "difficulty" varchar(20);--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "intensity" varchar(20);--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "style" varchar(50);--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "equipment" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_focus_areas" ADD CONSTRAINT "lesson_focus_areas_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_focus_areas" ADD CONSTRAINT "lesson_focus_areas_focus_area_id_focus_areas_id_fk" FOREIGN KEY ("focus_area_id") REFERENCES "public"."focus_areas"("id") ON DELETE no action ON UPDATE no action;