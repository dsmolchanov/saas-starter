import { NextRequest, NextResponse } from 'next/server';
import { getMuxService } from '@/lib/mux-service';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get asset ID from query params
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Get asset details
    const muxService = getMuxService();
    const assetData = await muxService.getAsset(assetId);

    return NextResponse.json({
      id: assetData.id,
      status: assetData.status,
      duration: assetData.duration,
      aspectRatio: assetData.aspectRatio,
      playbackIds: assetData.playbackIds,
      thumbnailUrl: assetData.playbackIds.length > 0 
        ? muxService.getThumbnailUrl(assetData.playbackIds[0].id)
        : null,
      streamingUrl: assetData.playbackIds.length > 0 
        ? muxService.getStreamingUrl(assetData.playbackIds[0].id)
        : null,
    });

  } catch (error) {
    console.error('Error getting MUX asset:', error);
    return NextResponse.json(
      { error: 'Failed to get asset details' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 401 }
      );
    }

    // Get asset ID from query params
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Delete asset
    const muxService = getMuxService();
    await muxService.deleteAsset(assetId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting MUX asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}