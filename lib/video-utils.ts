export type VideoType = 'upload' | 'youtube' | 'vimeo' | 'external';

export interface VideoInfo {
  type: VideoType;
  url: string;
  embedUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
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

/**
 * Fetches YouTube video duration using YouTube Data API
 */
export async function getYoutubeDuration(videoId: string): Promise<number | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('YouTube API key not configured - duration detection disabled');
      return null;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
    );
    
    if (!response.ok) {
      console.error('YouTube API request failed:', response.status);
      return null;
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      console.error('Video not found on YouTube');
      return null;
    }

    const duration = data.items[0].contentDetails.duration;
    return parseDurationString(duration);
  } catch (error) {
    console.error('Error fetching YouTube duration:', error);
    return null;
  }
}

/**
 * Parses YouTube duration string (ISO 8601 format) to minutes
 * Example: "PT4M13S" -> 4.22 minutes, "PT1H2M30S" -> 62.5 minutes
 */
function parseDurationString(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const match = duration.match(regex);
  
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return Math.round(hours * 60 + minutes + seconds / 60);
} 

/**
 * Gets duration from an uploaded video file using HTML5 video element
 */
export function getVideoDurationFromFile(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    
    video.onloadedmetadata = () => {
      if (video.duration && video.duration !== Infinity) {
        resolve(Math.round(video.duration / 60)); // Convert seconds to minutes
      } else {
        resolve(null);
      }
      
      // Clean up
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
} 