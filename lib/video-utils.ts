export type VideoType = 'upload' | 'youtube' | 'vimeo' | 'external';

export interface VideoInfo {
  type: VideoType;
  url: string;
  embedUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
}

/**
 * Constructs the full Supabase storage URL from a video path
 */
export function getSupabaseVideoUrl(videoPath: string): string {
  // If it's already a full URL, return as-is
  if (videoPath.startsWith('http')) {
    return videoPath;
  }
  
  // Construct the Supabase storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return videoPath;
  }
  
  return `${supabaseUrl}/storage/v1/object/public/videos/${videoPath}`;
}

/**
 * Detects video type from URL and extracts relevant information
 */
export function parseVideoUrl(url: string): VideoInfo {
  if (!url) {
    throw new Error('Video URL is required');
  }

  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      url: url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      videoId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }

  // Vimeo URL patterns
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*#|.*\/|)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      url: url,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      videoId: videoId
    };
  }

  // If it's a direct video file or unknown external URL
  if (url.startsWith('http') || url.startsWith('https')) {
    return {
      type: 'external',
      url: url
    };
  }

  // Assume it's an uploaded file path
  return {
    type: 'upload',
    url: url
  };
}

/**
 * Validates if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  try {
    const videoInfo = parseVideoUrl(url);
    return ['youtube', 'vimeo', 'external'].includes(videoInfo.type);
  } catch {
    return false;
  }
}

/**
 * Gets the appropriate video source for the HTML5 video element or iframe
 */
export function getVideoSource(videoPath: string | null, videoUrl: string | null, videoType: string | null): VideoInfo | null {
  if (videoUrl && videoType && videoType !== 'upload') {
    return parseVideoUrl(videoUrl);
  }
  
  if (videoPath) {
    return {
      type: 'upload',
      url: getSupabaseVideoUrl(videoPath)
    };
  }
  
  return null;
} 