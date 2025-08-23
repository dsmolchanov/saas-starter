# MUX Video Integration Guide

This guide explains how the MUX video integration has been implemented in your yoga platform.

## Overview

The integration supports two video handling approaches:
1. **External URLs** (YouTube, Vimeo, Rutube) - stored as URLs, no MUX processing
2. **File Uploads** - uploaded to MUX for optimized streaming and processing

## What's Been Implemented

### 1. Environment Configuration
- Added MUX credentials to `.env.local`
- `MUX_TOKEN_ID`: Your MUX access token ID
- `MUX_TOKEN_SECRET`: Your MUX secret key
- `MUX_SIGNING_SECRET`: Your MUX signing key for webhooks

### 2. Database Schema Updates
- Added MUX-related fields to the `classes` table:
  - `mux_asset_id`: MUX Asset ID for uploaded videos
  - `mux_playback_id`: MUX Playback ID for streaming
  - `mux_upload_id`: MUX Upload ID for tracking uploads
  - `mux_status`: Processing status ('preparing', 'ready', 'errored')

### 3. MUX Service (`lib/mux-service.ts`)
- Centralized MUX API operations
- Direct upload URL creation
- Asset management
- Webhook signature verification
- Thumbnail and streaming URL generation

### 4. API Routes
- `POST /api/mux/upload` - Create direct upload URLs
- `GET /api/mux/upload?uploadId=...` - Check upload status
- `GET /api/mux/asset?assetId=...` - Get asset details
- `DELETE /api/mux/asset?assetId=...` - Delete assets
- `POST /api/mux/webhook` - Handle MUX webhooks

### 5. React Components
- `ClassVideoInputMux` - Enhanced video input with MUX support
- Updated `VideoPlayer` - Supports MUX streaming with MuxPlayer
- Updated `video-utils.ts` - MUX video source handling

## How It Works

### For External URLs (YouTube, Vimeo, Rutube)
1. User pastes a video URL
2. System validates and parses the URL
3. Video metadata is extracted (thumbnails, etc.)
4. URL is stored directly in database
5. No MUX processing occurs

### For File Uploads
1. User selects file upload tab
2. System creates MUX direct upload URL
3. File is uploaded directly to MUX (client-side)
4. MUX processes the video in the background
5. Webhooks notify your system of processing status
6. Database is updated with MUX asset information

## Usage Instructions

### Using the New Video Input Component

Replace the old `ClassVideoInput` with `ClassVideoInputMux`:

```tsx
import { ClassVideoInputMux } from '@/components/class-video-input-mux';

// In your form component:
<ClassVideoInputMux
  userId={user.id}
  initialVideoType={lesson.videoType}
  initialVideoUrl={lesson.videoUrl}
  initialMuxAssetId={lesson.muxAssetId}
  initialMuxPlaybackId={lesson.muxPlaybackId}
  initialMuxStatus={lesson.muxStatus}
  onVideoChange={(data) => {
    // Handle video data updates
    setVideoData(data);
  }}
  onDurationChange={(minutes) => {
    setDuration(minutes);
  }}
  locale="ru" // or "en"
/>
```

### Using the Updated Video Player

Update VideoPlayer calls to include MUX fields:

```tsx
import { VideoPlayer } from '@/components/video-player';

<VideoPlayer
  videoPath={lesson.videoPath}
  videoUrl={lesson.videoUrl}
  videoType={lesson.videoType}
  muxPlaybackId={lesson.muxPlaybackId}
  thumbnailUrl={lesson.thumbnailUrl}
  title={lesson.title}
/>
```

## MUX Webhook Configuration

Configure your MUX webhook endpoint in the MUX dashboard:
- Webhook URL: `https://yourdomain.com/api/mux/webhook`
- Events: `video.asset.ready`, `video.asset.errored`, `video.upload.asset_created`, `video.upload.errored`

## Database Migration

The database has been updated with the new MUX fields. If you need to run the migration manually:

```sql
ALTER TABLE "classes" ADD COLUMN "mux_asset_id" text;
ALTER TABLE "classes" ADD COLUMN "mux_playback_id" text;
ALTER TABLE "classes" ADD COLUMN "mux_upload_id" text;
ALTER TABLE "classes" ADD COLUMN "mux_status" varchar(20);
```

## Benefits of MUX Integration

1. **Optimized Streaming**: Adaptive bitrate streaming for all devices
2. **Global CDN**: Fast video delivery worldwide
3. **Automatic Thumbnails**: Generated video thumbnails
4. **Analytics**: Detailed video performance metrics
5. **Security**: Signed URLs for private videos (if needed)
6. **Reliability**: Professional video infrastructure

## Testing

To test the integration:

1. **Test External URLs**:
   - Try pasting YouTube, Vimeo, or direct video URLs
   - Verify thumbnails and playback work correctly

2. **Test File Uploads**:
   - Upload a video file through the MUX uploader
   - Check that the video processes and becomes playable
   - Verify database fields are updated correctly

3. **Test Playback**:
   - Ensure MUX videos play with the MuxPlayer component
   - Verify external URLs still work with iframes/video elements

## Troubleshooting

- Check MUX credentials in `.env.local`
- Verify webhook endpoint is accessible
- Check browser console for upload errors
- Monitor MUX dashboard for asset status
- Check database for proper field updates

The integration maintains backward compatibility while adding powerful MUX streaming capabilities for uploaded videos!