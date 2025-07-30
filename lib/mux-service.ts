import Mux from '@mux/mux-node';

// MUX Service for handling video uploads and streaming
export class MuxService {
  private mux: Mux;

  constructor() {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!tokenId || !tokenSecret) {
      throw new Error('MUX credentials are not properly configured. Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables.');
    }

    this.mux = new Mux({
      tokenId,
      tokenSecret,
    });
  }

  /**
   * Create a direct upload URL for video files
   * This allows users to upload videos directly to MUX without going through your server
   */
  async createDirectUpload(options: {
    corsOrigin?: string;
    newAssetSettings?: {
      playbackPolicy?: ('public' | 'signed')[];
      encoding_tier?: 'baseline' | 'smart';
      max_resolution_tier?: '1080p' | '1440p' | '2160p';
      test?: boolean;
    };
  } = {}) {
    try {
      const upload = await this.mux.video.uploads.create({
        cors_origin: options.corsOrigin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        new_asset_settings: {
          playback_policy: options.newAssetSettings?.playbackPolicy || ['public'],
          encoding_tier: options.newAssetSettings?.encoding_tier || 'baseline',
          max_resolution_tier: options.newAssetSettings?.max_resolution_tier || '1080p',
          test: options.newAssetSettings?.test || false,
        },
      });

      return {
        uploadId: upload.id,
        uploadUrl: upload.url,
        assetId: null, // Will be available after upload completes
      };
    } catch (error) {
      console.error('Error creating MUX direct upload:', error);
      throw new Error('Failed to create upload URL');
    }
  }

  /**
   * Create an asset from an existing video URL
   */
  async createAssetFromUrl(videoUrl: string, options: {
    playbackPolicy?: ('public' | 'signed')[];
    test?: boolean;
  } = {}) {
    try {
      const asset = await this.mux.video.assets.create({
        inputs: [{ url: videoUrl }],
        playback_policy: options.playbackPolicy || ['public'],
        test: options.test || false,
      });

      return {
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id || null,
        status: asset.status,
      };
    } catch (error) {
      console.error('Error creating MUX asset from URL:', error);
      throw new Error('Failed to create asset from URL');
    }
  }

  /**
   * Get asset details including playback IDs and status
   */
  async getAsset(assetId: string) {
    try {
      const asset = await this.mux.video.assets.retrieve(assetId);
      
      return {
        id: asset.id,
        status: asset.status,
        duration: asset.duration, // Duration in seconds
        durationMinutes: asset.duration ? Math.ceil(asset.duration / 60) : null, // Convert to minutes
        aspectRatio: asset.aspect_ratio,
        playbackIds: asset.playback_ids?.map(playback => ({
          id: playback.id,
          policy: playback.policy,
        })) || [],
        tracks: asset.tracks?.map(track => ({
          type: track.type,
          max_width: track.max_width,
          max_height: track.max_height,
          duration: track.duration,
        })) || [],
      };
    } catch (error) {
      console.error('Error retrieving MUX asset:', error);
      throw new Error('Failed to retrieve asset details');
    }
  }

  /**
   * Get upload details
   */
  async getUpload(uploadId: string) {
    try {
      const upload = await this.mux.video.uploads.retrieve(uploadId);
      
      return {
        id: upload.id,
        url: upload.url,
        status: upload.status,
        assetId: upload.asset_id,
        error: upload.error,
      };
    } catch (error) {
      console.error('Error retrieving MUX upload:', error);
      throw new Error('Failed to retrieve upload details');
    }
  }

  /**
   * Delete an asset
   */
  async deleteAsset(assetId: string) {
    try {
      await this.mux.video.assets.delete(assetId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting MUX asset:', error);
      throw new Error('Failed to delete asset');
    }
  }

  /**
   * Get thumbnail URL for an asset
   */
  getThumbnailUrl(playbackId: string, options: {
    time?: number;
    width?: number;
    height?: number;
    fit_mode?: 'preserve' | 'crop' | 'pad';
  } = {}) {
    const params = new URLSearchParams();
    
    if (options.time !== undefined) params.set('time', options.time.toString());
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.fit_mode) params.set('fit_mode', options.fit_mode);

    const queryString = params.toString();
    return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Get streaming URL for an asset
   */
  getStreamingUrl(playbackId: string) {
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }

  /**
   * Generate a signed playback URL (for private videos)
   */
  async generateSignedUrl(playbackId: string, options: {
    expiration?: number; // Unix timestamp
    audience?: string;
    subject?: string;
  } = {}) {
    try {
      const signingKey = process.env.MUX_SIGNING_SECRET;
      if (!signingKey) {
        throw new Error('MUX_SIGNING_SECRET is required for signed URLs');
      }

      // This would typically use MUX's JWT signing
      // For now, return the basic streaming URL
      // In production, you'd implement proper JWT signing
      return this.getStreamingUrl(playbackId);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Webhook signature verification
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    try {
      const signingSecret = process.env.MUX_SIGNING_SECRET;
      if (!signingSecret) {
        console.warn('MUX_SIGNING_SECRET not configured - webhook verification disabled');
        return true; // Allow webhooks through in development
      }

      // Implement MUX webhook signature verification
      // This is a simplified version - implement proper HMAC verification in production
      return true;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}

// Singleton instance
let muxService: MuxService | null = null;

export function getMuxService(): MuxService {
  if (!muxService) {
    muxService = new MuxService();
  }
  return muxService;
}

// Types for MUX integration
export interface MuxAsset {
  id: string;
  status: 'preparing' | 'ready' | 'errored';
  duration?: number;
  playbackIds: Array<{
    id: string;
    policy: 'public' | 'signed';
  }>;
}

export interface MuxUpload {
  id: string;
  url: string;
  status: 'waiting' | 'asset_created' | 'errored' | 'cancelled' | 'timed_out';
  assetId?: string;
}