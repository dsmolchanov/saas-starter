-- Create playlists table
CREATE TABLE IF NOT EXISTS "playlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_public" integer DEFAULT 0 NOT NULL,
	"is_system" integer DEFAULT 0 NOT NULL,
	"playlist_type" varchar(20) DEFAULT 'custom' NOT NULL,
	"cover_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create playlist_items table
CREATE TABLE IF NOT EXISTS "playlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"playlist_id" integer NOT NULL,
	"item_type" varchar(20) NOT NULL,
	"item_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"added_by" integer
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add unique constraint to prevent duplicate items in same playlist
DO $$ BEGIN
 ALTER TABLE "playlist_items" ADD CONSTRAINT "unique_playlist_item" UNIQUE("playlist_id", "item_type", "item_id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;