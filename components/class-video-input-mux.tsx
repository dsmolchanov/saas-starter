"use client";

import { useState, useRef } from 'react';
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
      uploadToMux: 'Загрузить в MUX для оптимального стриминга',
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
      uploadToMux: 'Upload to MUX for optimal streaming',
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
  const [isCreatingUpload, setIsCreatingUpload] = useState(false);
  const [activeTab, setActiveTab] = useState(
    initialVideoType === 'mux' ? 'mux' : 
    (initialVideoType === 'upload' || !initialVideoType) ? 'mux' : 'url'
  );

  const t = getTranslations(locale);
  
  const hasVideo = initialVideoPath || initialVideoUrl || initialMuxAssetId;
  const currentVideoType = initialVideoType || 'upload';

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
        throw new Error('Failed to create upload URL');
      }

      const { uploadUrl, uploadId } = await response.json();
      setMuxUploadUrl(uploadUrl);
      
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
      alert('Failed to create upload URL');
    } finally {
      setIsCreatingUpload(false);
    }
  }

  // Handle MUX upload events
  function handleMuxUploadSuccess(event: any) {
    console.log('MUX upload successful:', event);
    onVideoChange({
      videoPath: null,
      videoUrl: null,
      videoType: 'mux',
      muxUploadId: event.detail.uploadId,
      muxStatus: 'asset_created',
    });
  }

  function handleMuxUploadError(event: any) {
    console.error('MUX upload error:', event);
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
    onVideoChange({
      videoPath: null,
      videoUrl: null,
      videoType: 'upload',
    });
    setVideoUrl('');
    setUrlError('');
    setMuxUploadUrl(null);
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
                   initialMuxStatus === 'errored' ? t.videoError :
                   t.muxVideoStreaming}
                </p>
                <p className="text-xs text-green-600">
                  MUX Asset: {initialMuxAssetId?.substring(0, 20)}...
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">{t.dragDropVideo}</p>
            <p className="text-xs text-gray-500 mb-4">{t.uploadToMux}</p>
            
            {!muxUploadUrl ? (
              <Button
                type="button"
                onClick={createMuxUpload}
                disabled={isCreatingUpload}
                className="gap-2"
              >
                <Video className="w-4 h-4" />
                {isCreatingUpload ? t.processing : t.uploadVideoFile}
              </Button>
            ) : (
              <MuxUploader
                endpoint={muxUploadUrl}
                onSuccess={handleMuxUploadSuccess}
                onError={handleMuxUploadError}
                onProgress={handleMuxProgress}
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  backgroundColor: 'white',
                  color: '#374151',
                } as any}
              />
            )}
          </div>
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