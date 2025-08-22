#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ClassRecord {
  id: string;
  title: string;
  video_url?: string;
  video_path?: string;
  mux_playback_id?: string;
  thumbnail_url?: string;
  image_url?: string;
}

async function extractMuxThumbnail(playbackId: string): Promise<string> {
  // Mux provides automatic thumbnail generation
  // Format: https://image.mux.com/{PLAYBACK_ID}/thumbnail.jpg
  // Can add parameters like ?time=1 for specific timestamp
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1&width=1280`;
}

async function extractYouTubeThumbnail(videoUrl: string): Promise<string | null> {
  // Extract video ID from YouTube URL
  const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (!match) return null;
  
  const videoId = match[1];
  // YouTube provides several thumbnail sizes
  // maxresdefault (1280x720), sddefault (640x480), hqdefault (480x360)
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

async function extractVimeoThumbnail(videoUrl: string): Promise<string | null> {
  // Extract video ID from Vimeo URL
  const match = videoUrl.match(/vimeo\.com\/(\d+)/);
  if (!match) return null;
  
  const videoId = match[1];
  
  try {
    // Vimeo provides an oEmbed API to get video metadata including thumbnails
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    // Get the highest quality thumbnail
    return data.thumbnail_url?.replace(/_\d+x\d+/, '_1280x720') || data.thumbnail_url;
  } catch (error) {
    console.error(`Failed to fetch Vimeo thumbnail for ${videoId}:`, error);
    return null;
  }
}

async function updateClassThumbnails() {
  console.log('Starting thumbnail extraction for all classes...\n');
  
  // Fetch all classes from the database
  const { data: classes, error } = await supabase
    .from('classes')
    .select('id, title, video_url, video_path, mux_playback_id, thumbnail_url, image_url')
    .order('title');
  
  if (error) {
    console.error('Error fetching classes:', error);
    return;
  }
  
  if (!classes || classes.length === 0) {
    console.log('No classes found in the database');
    return;
  }
  
  console.log(`Found ${classes.length} classes to process\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const classItem of classes as ClassRecord[]) {
    // Skip if already has a thumbnail or image
    if (classItem.thumbnail_url || classItem.image_url) {
      console.log(`⏭️  Skipping "${classItem.title}" - already has cover image`);
      skipCount++;
      continue;
    }
    
    let thumbnailUrl: string | null = null;
    
    // Try to extract thumbnail based on video source
    if (classItem.mux_playback_id) {
      thumbnailUrl = await extractMuxThumbnail(classItem.mux_playback_id);
      console.log(`🎬 Extracting Mux thumbnail for "${classItem.title}"`);
    } else if (classItem.video_url) {
      if (classItem.video_url.includes('youtube.com') || classItem.video_url.includes('youtu.be')) {
        thumbnailUrl = await extractYouTubeThumbnail(classItem.video_url);
        console.log(`📺 Extracting YouTube thumbnail for "${classItem.title}"`);
      } else if (classItem.video_url.includes('vimeo.com')) {
        thumbnailUrl = await extractVimeoThumbnail(classItem.video_url);
        console.log(`🎥 Extracting Vimeo thumbnail for "${classItem.title}"`);
      }
    }
    
    if (thumbnailUrl) {
      // Update the class with the extracted thumbnail
      const { error: updateError } = await supabase
        .from('classes')
        .update({ 
          thumbnail_url: thumbnailUrl,
          image_url: thumbnailUrl // Also set as image_url for compatibility
        })
        .eq('id', classItem.id);
      
      if (updateError) {
        console.error(`❌ Failed to update "${classItem.title}":`, updateError);
        errorCount++;
      } else {
        console.log(`✅ Successfully updated "${classItem.title}"`);
        successCount++;
      }
    } else {
      console.log(`⚠️  No video source found for "${classItem.title}"`);
      errorCount++;
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`✅ Successfully updated: ${successCount} classes`);
  console.log(`⏭️  Skipped (already have thumbnails): ${skipCount} classes`);
  console.log(`❌ Failed or no video source: ${errorCount} classes`);
  console.log(`Total processed: ${classes.length} classes`);
}

// Also update courses to use first class thumbnail if they don't have a cover
async function updateCourseCoverImages() {
  console.log('\n\nUpdating course cover images from first class...\n');
  
  // Fetch all courses without cover images
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      cover_url,
      image_url,
      classes!inner(
        id,
        thumbnail_url,
        image_url,
        order_index
      )
    `)
    .is('cover_url', null)
    .order('title');
  
  if (error) {
    console.error('Error fetching courses:', error);
    return;
  }
  
  if (!courses || courses.length === 0) {
    console.log('No courses without cover images found');
    return;
  }
  
  console.log(`Found ${courses.length} courses to update\n`);
  
  let courseUpdateCount = 0;
  
  for (const course of courses) {
    // Get the first class (by order_index or just first in array)
    const firstClass = course.classes
      ?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))[0];
    
    if (firstClass && (firstClass.thumbnail_url || firstClass.image_url)) {
      const coverUrl = firstClass.thumbnail_url || firstClass.image_url;
      
      const { error: updateError } = await supabase
        .from('courses')
        .update({ 
          cover_url: coverUrl,
          image_url: coverUrl
        })
        .eq('id', course.id);
      
      if (updateError) {
        console.error(`❌ Failed to update course "${course.title}":`, updateError);
      } else {
        console.log(`✅ Updated course "${course.title}" with first class thumbnail`);
        courseUpdateCount++;
      }
    } else {
      console.log(`⚠️  No thumbnail found in classes for course "${course.title}"`);
    }
  }
  
  console.log(`\n✅ Successfully updated ${courseUpdateCount} course covers`);
}

// Run the script
async function main() {
  try {
    await updateClassThumbnails();
    await updateCourseCoverImages();
    console.log('\n🎉 Thumbnail extraction complete!');
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

main();