-- Add image_url columns to lessons and courses tables
ALTER TABLE "lessons" ADD COLUMN "image_url" text;
ALTER TABLE "courses" ADD COLUMN "image_url" text; 