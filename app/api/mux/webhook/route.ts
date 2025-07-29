import { NextRequest, NextResponse } from 'next/server';
import { getMuxService } from '@/lib/mux-service';
import { db } from '@/lib/db/drizzle';
import { classes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('mux-signature') || '';

    // Verify webhook signature
    const muxService = getMuxService();
    const isValid = muxService.verifyWebhookSignature(body, signature);
    
    if (!isValid) {
      console.error('Invalid MUX webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    console.log('MUX Webhook received:', event.type, event.object?.type);

    // Handle different webhook events
    switch (event.type) {
      case 'video.asset.ready':
        await handleAssetReady(event);
        break;
      
      case 'video.asset.errored':
        await handleAssetErrored(event);
        break;
      
      case 'video.upload.asset_created':
        await handleUploadAssetCreated(event);
        break;
      
      case 'video.upload.errored':
        await handleUploadErrored(event);
        break;
      
      default:
        console.log('Unhandled MUX webhook event:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing MUX webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleAssetReady(event: any) {
  try {
    const assetId = event.data.id;
    const asset = event.data;

    console.log('Asset ready:', assetId);

    // Update database records that reference this asset
    await db.update(classes)
      .set({
        muxStatus: 'ready',
        muxPlaybackId: asset.playback_ids?.[0]?.id || null,
        durationMin: asset.duration ? Math.round(asset.duration / 60) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(classes.muxAssetId, assetId));

    console.log('Updated class records for asset:', assetId);

  } catch (error) {
    console.error('Error handling asset ready event:', error);
  }
}

async function handleAssetErrored(event: any) {
  try {
    const assetId = event.data.id;
    const errors = event.data.errors;

    console.error('Asset errored:', assetId, errors);

    // Update database records
    await db.update(classes)
      .set({
        muxStatus: 'errored',
        updatedAt: new Date(),
      })
      .where(eq(classes.muxAssetId, assetId));

    console.log('Updated class records for errored asset:', assetId);

  } catch (error) {
    console.error('Error handling asset errored event:', error);
  }
}

async function handleUploadAssetCreated(event: any) {
  try {
    const uploadId = event.data.id;
    const assetId = event.data.asset_id;

    console.log('Upload asset created:', uploadId, '-> Asset:', assetId);

    // Update database records that reference this upload
    await db.update(classes)
      .set({
        muxAssetId: assetId,
        muxStatus: 'preparing',
        updatedAt: new Date(),
      })
      .where(eq(classes.muxUploadId, uploadId));

    console.log('Updated class records for upload:', uploadId);

  } catch (error) {
    console.error('Error handling upload asset created event:', error);
  }
}

async function handleUploadErrored(event: any) {
  try {
    const uploadId = event.data.id;
    const error = event.data.error;

    console.error('Upload errored:', uploadId, error);

    // Update database records
    await db.update(classes)
      .set({
        muxStatus: 'errored',
        updatedAt: new Date(),
      })
      .where(eq(classes.muxUploadId, uploadId));

    console.log('Updated class records for errored upload:', uploadId);

  } catch (error) {
    console.error('Error handling upload errored event:', error);
  }
}