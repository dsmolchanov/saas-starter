import { NextRequest, NextResponse } from 'next/server';
import { getMuxService } from '@/lib/mux-service';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { corsOrigin } = body;

    // Create MUX direct upload
    const muxService = getMuxService();
    const uploadData = await muxService.createDirectUpload({
      corsOrigin: corsOrigin || process.env.NEXT_PUBLIC_SITE_URL,
      newAssetSettings: {
        playbackPolicy: ['public'],
        encoding_tier: 'baseline',
        max_resolution_tier: '1080p',
        test: process.env.NODE_ENV !== 'production',
      },
    });

    return NextResponse.json({
      uploadId: uploadData.uploadId,
      uploadUrl: uploadData.uploadUrl,
    });

  } catch (error) {
    console.error('Error creating MUX upload:', error);
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 401 }
      );
    }

    // Get upload ID from query params
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID is required' },
        { status: 400 }
      );
    }

    // Get upload status
    const muxService = getMuxService();
    const uploadData = await muxService.getUpload(uploadId);

    return NextResponse.json({
      id: uploadData.id,
      status: uploadData.status,
      assetId: uploadData.assetId,
      error: uploadData.error,
    });

  } catch (error) {
    console.error('Error getting MUX upload status:', error);
    return NextResponse.json(
      { error: 'Failed to get upload status' },
      { status: 500 }
    );
  }
}