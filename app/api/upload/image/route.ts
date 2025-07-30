import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated.' },
        { status: 401 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Create file path for Supabase storage
    const filePath = `class-covers/${user.id}/${filename}`;

    // Upload to Supabase storage
    const supabase = await createServerSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading to Supabase:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      name: file.name,
      size: file.size,
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}