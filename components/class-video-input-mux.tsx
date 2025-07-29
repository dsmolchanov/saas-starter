"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Video, Link, X, ExternalLink, Youtube, Play } from 'lucide-react';
import MuxUploader from '@mux/mux-uploader-react';
import { isValidVideoUrl, parseVideoUrl, getYoutubeDuration } from '@/lib/video-utils';
import { cn } from '@/lib/utils';

interface ClassVideoInputMuxProps {
  userId: string;
  initialVideoPath?: string;
  initialVideoUrl?: string;
  initialVideoType?: string;
  initialMuxAssetId?: string;
  initialMuxPlaybackId?: string;
  initialMuxUploadId?: string;
  initialMuxStatus?: string;
  onVideoChange: (data: {
    videoPath: string | null;
    videoUrl: string | null;
    videoType: string;
    muxAssetId?: string | null;
    muxPlaybackId?: string | null;
    muxUploadId?: string | null;
    muxStatus?: string | null;
    thumbnailUrl?: string;
  }) => void;
  onCoverImageChange?: (coverImageUrl: string | null) => void;
  onDurationChange?: (durationMinutes: number | null) => void;
  initialCoverImage?: string | null;
  locale?: string;
}

// Locale-aware translations
function getTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      classVideo: 'Видео занятия',
      uploadFile: 'Загрузить файл',
      videoUrl: 'URL видео',
      uploadVideoFile: 'Загрузить видеофайл',
      uploading: 'Загрузка...',
      processing: 'Обработка...',
      videoUploaded: 'Видео загружено',
      videoProcessing: 'Видео обрабатывается',
      videoReady: 'Видео готово',
      videoError: 'Ошибка обработки видео',
      youtubeVideo: 'YouTube видео',
      vimeoVideo: 'Vimeo видео',
      externalVideo: 'Внешнее видео',
      enterVideoUrl: 'Введите URL видео',
      supportedFormats: 'Поддерживается: YouTube, Vimeo, Rutube или прямые ссылки на видеофайлы',
      addVideoUrl: 'Добавить URL видео',
      pleaseEnterVideoUrl: 'Пожалуйста, введите URL видео',
      pleaseEnterValidUrl: 'Пожалуйста, введите действительный URL',
      invalidVideoUrlFormat: 'Неверный формат URL видео',
      muxVideoStreaming: 'Видео стриминг (MUX)',
      dragDropVideo: 'Перетащите видеофайл сюда или нажмите для выбора',
    },
    en: {
      classVideo: 'Class Video',
      uploadFile: 'Upload File',
      videoUrl: 'Video URL',
      uploadVideoFile: 'Upload a video file',
      uploading: 'Uploading...',
      processing: 'Processing...',
      videoUploaded: 'Video uploaded',
      videoProcessing: 'Video processing',
      videoReady: 'Video ready',
      videoError: 'Video processing error',
      youtubeVideo: 'YouTube video',
      vimeoVideo: 'Vimeo video',
      externalVideo: 'External video',
      enterVideoUrl: 'Enter video URL',
      supportedFormats: 'Supported: YouTube, Vimeo, Rutube, or direct video file URLs',
      addVideoUrl: 'Add Video URL',
      pleaseEnterVideoUrl: 'Please enter a video URL',
      pleaseEnterValidUrl: 'Please enter a valid URL',
      invalidVideoUrlFormat: 'Invalid video URL format',
      muxVideoStreaming: 'Video Streaming (MUX)',
      dragDropVideo: 'Drag and drop video file here or click to select',
    },
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export function ClassVideoInputMux({
  userId,
  initialVideoPath,
  initialVideoUrl,
  initialVideoType,
  initialMuxAssetId,
  initialMuxPlaybackId,
  initialMuxUploadId,
  initialMuxStatus,
  onVideoChange,
  onCoverImageChange,
  onDurationChange,
  initialCoverImage,
  locale = 'ru'
}: ClassVideoInputMuxProps) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '');
  const [urlError, setUrlError] = useState('');
  const [muxUploadUrl, setMuxUploadUrl] = useState<string | null>(null);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(initialMuxUploadId || null);
  const [isCreatingUpload, setIsCreatingUpload] = useState(false);
  const [activeTab, setActiveTab] = useState(
    initialVideoType === 'mux' ? 'mux' : 
    (initialVideoType === 'upload' || !initialVideoType) ? 'mux' : 'url'
  );
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = getTranslations(locale);
  
  const hasVideo = initialVideoPath || initialVideoUrl || initialMuxAssetId;
  const currentVideoType = initialVideoType || 'upload';

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Start polling status if we have an upload ID and status is not final
  useEffect(() => {
    if (initialMuxUploadId && 
        currentVideoType === 'mux' && 
        initialMuxStatus && 
        !['ready', 'errored'].includes(initialMuxStatus) &&
        !isPollingStatus) {
      startStatusPolling(initialMuxUploadId);
    }
  }, [initialMuxUploadId, initialMuxStatus, currentVideoType]);

  // Poll for upload status
  async function pollUploadStatus(uploadId: string) {
    try {
      const response = await fetch(`/api/mux/upload?uploadId=${uploadId}`);
      if (!response.ok) {
        throw new Error('Failed to get upload status');
      }

      const data = await response.json();
      console.log('MUX upload status:', data);

      // Update the status based on the response
      if (data.status === 'asset_created' && data.assetId) {
        // Upload complete, asset created - stop polling and mark as ready
        onVideoChange({
          videoPath: null,
          videoUrl: null,
          videoType: 'mux',
          muxUploadId: uploadId,
          muxAssetId: data.assetId,
          muxPlaybackId: data.playbackId,
          muxStatus: 'ready',
        });
        stopStatusPolling(); // Important: stop polling when asset is created
      } else if (data.status === 'errored') {
        // Upload failed
        onVideoChange({
          videoPath: null,
          videoUrl: null,
          videoType: 'mux',
          muxUploadId: uploadId,
          muxStatus: 'errored',
        });
        stopStatusPolling();
      }
      
    } catch (error) {
      console.error('Error polling upload status:', error);
    }
  }

  function startStatusPolling(uploadId: string) {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    setIsPollingStatus(true);
    console.log('Starting status polling for upload:', uploadId);
    
    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      pollUploadStatus(uploadId);
    }, 3000);
    
    // Also poll immediately
    pollUploadStatus(uploadId);
  }

  function stopStatusPolling() {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPollingStatus(false);
  }

  // Create MUX upload URL
  async function createMuxUpload() {
    setIsCreatingUpload(true);
    try {
      const response = await fetch('/api/mux/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corsOrigin: window.location.origin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create upload URL');
      }

      const { uploadUrl, uploadId } = await response.json();
      setMuxUploadUrl(uploadUrl);
      setCurrentUploadId(uploadId);
      
      // Store upload ID for tracking
      onVideoChange({
        videoPath: null,
        videoUrl: null,
        videoType: 'mux',
        muxUploadId: uploadId,
        muxStatus: 'waiting',
      });

    } catch (error) {
      console.error('Error creating MUX upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create upload URL';
      alert(`Upload Error: ${errorMessage}`);
    } finally {
      setIsCreatingUpload(false);
    }
  }

  // Handle MUX upload events
  function handleMuxUploadSuccess(event: any) {
    console.log('MUX upload successful:', event);
    
    // The MUX uploader doesn't provide uploadId in the success event detail
    // We need to use the uploadId from when we created the upload URL
    // Let's get it from the current muxUploadUrl or track it separately
    
    // Use the stored currentUploadId from when we created the upload
    const uploadId = currentUploadId;
    
    if (!uploadId) {
      console.error('No upload ID available for success event');
      return;
    }
    
    onVideoChange({
      videoPath: null,
      videoUrl: null,
      videoType: 'mux',
      muxUploadId: uploadId,
      muxStatus: 'processing',
    });

    // Start polling for status updates
    startStatusPolling(uploadId);
  }

  function handleMuxUploadError(event: any) {
    console.error('MUX upload error:', event);
    stopStatusPolling();
    onVideoChange({
      videoPath: null,
      videoUrl: null,
      videoType: 'mux',
      muxStatus: 'errored',
    });
  }

  function handleMuxProgress(event: any) {
    console.log('MUX upload progress:', event.detail.progress);
  }

  // Handle URL submission (for YouTube, Vimeo, Rutube, etc.)
  async function handleUrlSubmit() {
    if (!videoUrl.trim()) {
      setUrlError(t.pleaseEnterVideoUrl);
      return;
    }

    if (!isValidVideoUrl(videoUrl)) {
      setUrlError(t.pleaseEnterValidUrl);
      return;
    }

    try {
      const videoInfo = parseVideoUrl(videoUrl);
      
      // If it's a YouTube video, try to get the duration
      if (videoInfo.type === 'youtube' && videoInfo.videoId && onDurationChange) {
        const duration = await getYoutubeDuration(videoInfo.videoId);
        if (duration) {
          onDurationChange(duration);
        }
      }
      
      onVideoChange({
        videoPath: null,
        videoUrl: videoUrl,
        videoType: videoInfo.type,
        thumbnailUrl: videoInfo.thumbnailUrl,
      });
      setUrlError('');
    } catch (error) {
      setUrlError(t.invalidVideoUrlFormat);
    }
  }

  function handleRemoveVideo() {
    stopStatusPolling();
    onVideoChange({
      videoPath: null,
      videoUrl: null,
      videoType: 'upload',
    });
    setVideoUrl('');
    setUrlError('');
    setMuxUploadUrl(null);
    setCurrentUploadId(null);
  }

  function getVideoPreview() {
    if (initialVideoUrl && currentVideoType !== 'upload' && currentVideoType !== 'mux') {
      try {
        const videoInfo = parseVideoUrl(initialVideoUrl);
        return {
          type: videoInfo.type,
          url: initialVideoUrl,
          embedUrl: videoInfo.embedUrl,
          thumbnail: videoInfo.thumbnailUrl
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  const videoPreview = getVideoPreview();

  // Show current video if exists
  if (hasVideo) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t.classVideo}</Label>
        
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          {currentVideoType === 'mux' ? (
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  {initialMuxStatus === 'ready' ? t.videoReady :
                   initialMuxStatus === 'preparing' ? t.videoProcessing :
                   initialMuxStatus === 'processing' ? t.processing :
                   initialMuxStatus === 'waiting' ? t.uploading :
                   initialMuxStatus === 'errored' ? t.videoError :
                   t.muxVideoStreaming}
                  {(initialMuxStatus === 'processing' || initialMuxStatus === 'preparing') && isPollingStatus && (
                    <span className="ml-2 animate-spin inline-block">⏳</span>
                  )}
                </p>
                {initialMuxAssetId && (
                  <p className="text-xs text-green-600">
                    MUX Asset: {initialMuxAssetId.substring(0, 20)}...
                  </p>
                )}
                {initialMuxUploadId && !initialMuxAssetId && (
                  <p className="text-xs text-green-600">
                    Upload ID: {initialMuxUploadId.substring(0, 20)}...
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveVideo}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : currentVideoType === 'upload' ? (
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">{t.videoUploaded}</p>
                <p className="text-xs text-green-600">
                  {initialVideoPath?.split('/').pop()?.substring(0, 50)}...
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveVideo}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {currentVideoType === 'youtube' && <Youtube className="w-5 h-5 text-red-600" />}
                  {currentVideoType === 'vimeo' && <Video className="w-5 h-5 text-blue-600" />}
                  {currentVideoType === 'external' && <ExternalLink className="w-5 h-5 text-gray-600" />}
                  <span className="text-sm font-medium text-green-800 capitalize">
                    {currentVideoType === 'youtube' ? t.youtubeVideo : 
                     currentVideoType === 'vimeo' ? t.vimeoVideo : 
                     t.externalVideo}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveVideo}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-xs text-green-600 break-all">
                {initialVideoUrl}
              </div>
              
              {videoPreview?.thumbnail && (
                <div className="w-32 h-18 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={videoPreview.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show input form
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t.classVideo}</Label>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mux" className="gap-2">
            <Upload className="w-4 h-4" />
            {t.uploadFile}
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <Link className="w-4 h-4" />
            {t.videoUrl}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mux" className="space-y-3">
          {!muxUploadUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">{t.dragDropVideo}</p>
              
              <Button
                type="button"
                onClick={createMuxUpload}
                disabled={isCreatingUpload}
                className="gap-2"
              >
                <Video className="w-4 h-4" />
                {isCreatingUpload ? t.processing : t.uploadVideoFile}
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <MuxUploader
                endpoint={muxUploadUrl}
                onSuccess={handleMuxUploadSuccess}
                onError={handleMuxUploadError}
                onProgress={handleMuxProgress}
                style={{
                  width: '100%',
                  minHeight: '100px',
                } as any}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <div className="space-y-3">
            <div>
              <Input
                placeholder={t.enterVideoUrl}
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setUrlError('');
                }}
                className={cn(urlError && "border-red-300")}
              />
              {urlError && (
                <p className="text-sm text-red-600 mt-1">{urlError}</p>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {t.supportedFormats}
            </div>
            
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!videoUrl.trim()}
              className="w-full gap-2"
            >
              <Link className="w-4 h-4" />
              {t.addVideoUrl}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}