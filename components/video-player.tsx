"use client";

import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getVideoSource, VideoInfo } from '@/lib/video-utils';
import MuxPlayer from '@mux/mux-player-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoPath?: string | null;
  videoUrl?: string | null;
  videoType?: string | null;
  muxPlaybackId?: string | null;
  thumbnailUrl?: string | null;
  title: string;
  className?: string;
  controls?: boolean;
  autoplay?: boolean;
}

export function VideoPlayer({
  videoPath,
  videoUrl,
  videoType,
  muxPlaybackId,
  thumbnailUrl,
  title,
  className,
  controls = true,
  autoplay = false
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoSource = getVideoSource(videoPath || null, videoUrl || null, videoType || null, muxPlaybackId || null);

  if (!videoSource) {
    return (
      <div className={cn("w-full aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center", className)}>
        <div className="text-center text-white">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <p className="text-lg">Video coming soon</p>
        </div>
      </div>
    );
  }

  const handleLoadStart = () => setIsLoading(true);
  const handleLoadedData = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={cn("w-full aspect-video bg-muted flex items-center justify-center border border-destructive/20", className)}>
        <div className="text-center text-muted-foreground">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Failed to load video</p>
          {videoSource.type !== 'upload' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(videoSource.url, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Watch on {videoSource.type === 'youtube' ? 'YouTube' : videoSource.type === 'vimeo' ? 'Vimeo' : 'External Site'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render based on video type
  switch (videoSource.type) {
    case 'mux':
      // Use MUX Player for optimal streaming
      return (
        <div className={cn("w-full aspect-video relative", className)}>
          <MuxPlayer
            playbackId={muxPlaybackId!}
            autoPlay={autoplay}
            poster={thumbnailUrl || videoSource.thumbnailUrl}
            className="w-full h-full rounded-lg"
            style={{ aspectRatio: '16/9' }}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onError={handleError}
          />
        </div>
      );

    case 'youtube':
    case 'vimeo':
      return (
        <div className={cn("w-full aspect-video relative", className)}>
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="text-white">Loading...</div>
            </div>
          )}
          <iframe
            src={videoSource.embedUrl}
            title={title}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleLoadedData}
            onError={handleError}
          />
        </div>
      );

    case 'external':
      // For external URLs, try to use video element first, fallback to iframe
      return (
        <div className={cn("w-full aspect-video relative", className)}>
          <video
            className="w-full h-full object-cover rounded-lg"
            controls={controls}
            poster={thumbnailUrl || undefined}
            preload="metadata"
            autoPlay={autoplay}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onError={handleError}
          >
            <source src={videoSource.url} type="video/mp4" />
            <source src={videoSource.url} type="video/webm" />
            <source src={videoSource.url} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        </div>
      );

    case 'upload':
    default:
      return (
        <div className={cn("w-full aspect-video relative", className)}>
          <video
            className="w-full h-full object-cover rounded-lg"
            controls={controls}
            poster={thumbnailUrl || undefined}
            preload="metadata"
            autoPlay={autoplay}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onError={handleError}
          >
            <source src={videoSource.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
  }
} 