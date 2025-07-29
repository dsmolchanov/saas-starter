import { NextRequest, NextResponse } from 'next/server';
import { getMuxService } from '@/lib/mux-service';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUser();
    console.log('User in MUX upload:', { id: user?.id, role: user?.role, name: user?.name });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated.' },
        { status: 401 }
      );
    }
    
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json(
        { error: `Unauthorized. Teacher or admin access required. Current role: ${user.role}` },
        { status: 401 }
      );
    }

    // Check MUX environment variables
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      console.error('MUX credentials not configured. Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET');
      return NextResponse.json(
        { error: 'MUX service not properly configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();
    const { corsOrigin } = body;

    console.log('Creating MUX upload with CORS origin:', corsOrigin || process.env.NEXT_PUBLIC_SITE_URL);

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

    console.log('MUX upload created successfully:', uploadData.uploadId);

    return NextResponse.json({
      uploadId: uploadData.uploadId,
      uploadUrl: uploadData.uploadUrl,
    });

  } catch (error) {
    console.error('Error creating MUX upload:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        return NextResponse.json(
          { error: 'MUX authentication failed. Please check API credentials.' },
          { status: 500 }
        );
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Network error connecting to MUX. Please try again.' },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: `MUX API error: ${error.message}` },
          { status: 500 }
        );
      }
    }

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
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated.' },
        { status: 401 }
      );
    }
    
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json(
        { error: `Unauthorized. Teacher or admin access required. Current role: ${user.role}` },
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

    // If asset is created, also get asset details for playback ID
    let playbackId = null;
    if (uploadData.status === 'asset_created' && uploadData.assetId) {
      try {
        const assetData = await muxService.getAsset(uploadData.assetId);
        playbackId = assetData.playbackIds?.[0]?.id || null;
      } catch (error) {
        console.error('Error getting asset details:', error);
      }
    }

    return NextResponse.json({
      id: uploadData.id,
      status: uploadData.status,
      assetId: uploadData.assetId,
      playbackId: playbackId,
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