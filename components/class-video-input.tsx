"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Video, Link, X, ExternalLink, Youtube } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isValidVideoUrl, parseVideoUrl } from '@/lib/video-utils';
import { cn } from '@/lib/utils';

interface ClassVideoInputProps {
  userId: string;
  initialVideoPath?: string;
  initialVideoUrl?: string;
  initialVideoType?: string;
  onVideoChange: (videoPath: string | null, videoUrl: string | null, videoType: string, thumbnailUrl?: string) => void;
  onCoverImageChange?: (coverImageUrl: string | null) => void;
  initialCoverImage?: string | null;
  locale?: string;
}

// Locale-aware translations for ClassVideoInput
function getTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      classVideo: 'Видео занятия',
      uploadFile: 'Загрузить файл',
      videoUrl: 'URL видео',
      uploadVideoFile: 'Загрузить видеофайл',
      chooseVideoFile: 'Выбрать видеофайл',
      uploading: 'Загрузка...',
      videoUploaded: 'Видео загружено',
      youtubeVideo: 'YouTube видео',
      vimeoVideo: 'Vimeo видео',
      externalVideo: 'Внешнее видео',
      enterVideoUrl: 'Введите URL видео',
      supportedFormats: 'Поддерживается: YouTube, Vimeo или прямые ссылки на видеофайлы',
      addVideoUrl: 'Добавить URL видео',
      videoUploadFailed: 'Загрузка видео не удалась',
      failedToUploadVideo: 'Не удалось загрузить видео. Попробуйте еще раз.',
      pleaseEnterVideoUrl: 'Пожалуйста, введите URL видео',
      pleaseEnterValidUrl: 'Пожалуйста, введите действительный URL YouTube, Vimeo или видеофайла',
      invalidVideoUrlFormat: 'Неверный формат URL видео',
      coverImage: 'Обложка занятия',
      uploadCoverImage: 'Загрузить обложку',
      useThumbnail: 'Использовать миниатюру видео',
      coverImageUploaded: 'Обложка загружена',
      removeCoverImage: 'Удалить обложку'
    },
    en: {
      classVideo: 'Class Video',
      uploadFile: 'Upload File',
      videoUrl: 'Video URL',
      uploadVideoFile: 'Upload a video file',
      chooseVideoFile: 'Choose Video File',
      uploading: 'Uploading...',
      videoUploaded: 'Video uploaded',
      youtubeVideo: 'YouTube video',
      vimeoVideo: 'Vimeo video',
      externalVideo: 'External video',
      enterVideoUrl: 'Enter video URL',
      supportedFormats: 'Supported: YouTube, Vimeo, or direct video file URLs',
      addVideoUrl: 'Add Video URL',
      videoUploadFailed: 'Video upload failed',
      failedToUploadVideo: 'Failed to upload video. Please try again.',
      pleaseEnterVideoUrl: 'Please enter a video URL',
      pleaseEnterValidUrl: 'Please enter a valid YouTube, Vimeo, or video file URL',
      invalidVideoUrlFormat: 'Invalid video URL format',
      coverImage: 'Cover Image',
      uploadCoverImage: 'Upload Cover Image',
      useThumbnail: 'Use Video Thumbnail',
      coverImageUploaded: 'Cover image uploaded',
      removeCoverImage: 'Remove Cover Image'
    },
    'es-MX': {
      classVideo: 'Video de Clase',
      uploadFile: 'Subir Archivo',
      videoUrl: 'URL de Video',
      uploadVideoFile: 'Subir un archivo de video',
      chooseVideoFile: 'Elegir Archivo de Video',
      uploading: 'Subiendo...',
      videoUploaded: 'Video subido',
      youtubeVideo: 'Video de YouTube',
      vimeoVideo: 'Video de Vimeo',
      externalVideo: 'Video externo',
      enterVideoUrl: 'Ingresar URL de video',
      supportedFormats: 'Soportado: YouTube, Vimeo, o URLs directas de archivos de video',
      addVideoUrl: 'Agregar URL de Video',
      videoUploadFailed: 'Error al subir video',
      failedToUploadVideo: 'Error al subir video. Inténtalo de nuevo.',
      pleaseEnterVideoUrl: 'Por favor ingresa una URL de video',
      pleaseEnterValidUrl: 'Por favor ingresa una URL válida de YouTube, Vimeo o archivo de video',
      invalidVideoUrlFormat: 'Formato de URL de video inválido',
      coverImage: 'Imagen de portada',
      uploadCoverImage: 'Subir imagen de portada',
      useThumbnail: 'Usar miniatura de video',
      coverImageUploaded: 'Imagen de portada subida',
      removeCoverImage: 'Eliminar imagen de portada'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export function ClassVideoInput({
  userId,
  initialVideoPath,
  initialVideoUrl,
  initialVideoType,
  onVideoChange,
  onCoverImageChange,
  initialCoverImage,
  locale = 'ru'
}: ClassVideoInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '');
  const [urlError, setUrlError] = useState('');
  const [coverImage, setCoverImage] = useState(initialCoverImage || '');
  const [activeTab, setActiveTab] = useState(
    initialVideoType === 'upload' ? 'upload' : 'url'
  );
  const t = getTranslations(locale);

  const hasVideo = initialVideoPath || initialVideoUrl;
  const currentVideoType = initialVideoType || 'upload';

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const filePath = `${userId}/class-videos/video-${Date.now()}-${file.name}`;
    
    try {
      const { error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, { upsert: true, contentType: file.type });
      
      if (error) {
        alert(`${t.videoUploadFailed}: ${error.message}`);
        return;
      }

      // Clear any existing URL and set new upload path
      onVideoChange(filePath, null, 'upload');
      setVideoUrl('');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert(t.failedToUploadVideo);
    } finally {
      setUploading(false);
    }
  }

  function handleUrlSubmit() {
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
      onVideoChange(null, videoUrl, videoInfo.type, videoInfo.thumbnailUrl);
      setUrlError('');
    } catch (error) {
      setUrlError(t.invalidVideoUrlFormat);
    }
  }

  async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const supabase = createClient();
    const filePath = `${userId}/cover-images/cover-${Date.now()}-${file.name}`;
    
    try {
      const { error } = await supabase.storage
        .from('videos') // Using the same bucket for consistency
        .upload(filePath, file, { upsert: true, contentType: file.type });
      
      if (error) {
        alert(`Failed to upload cover image: ${error.message}`);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const coverImageUrl = `${supabaseUrl}/storage/v1/object/public/videos/${filePath}`;
      
      setCoverImage(coverImageUrl);
      onCoverImageChange?.(coverImageUrl);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setUploadingCover(false);
    }
  }

  function handleUseThumbnail() {
    const videoPreview = getVideoPreview();
    if (videoPreview?.thumbnail) {
      setCoverImage(videoPreview.thumbnail);
      onCoverImageChange?.(videoPreview.thumbnail);
    }
  }

  function handleRemoveCoverImage() {
    setCoverImage('');
    onCoverImageChange?.(null);
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = '';
    }
  }

  function handleRemoveVideo() {
    onVideoChange(null, null, 'upload');
    setVideoUrl('');
    setUrlError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function getVideoPreview() {
    if (initialVideoUrl && currentVideoType !== 'upload') {
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

  if (hasVideo) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Class Video</Label>
        
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          {currentVideoType === 'upload' ? (
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
        
        {/* Cover Image Section - Now included in edit mode */}
        <div className="space-y-3 border-t pt-4 mt-6">
          <Label className="text-sm font-medium">{t.coverImage}</Label>
          
          {/* Current Cover Image Display */}
          {coverImage && (
            <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden border">
              <img
                src={coverImage}
                alt="Cover image"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoverImage}
                className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {/* Cover Image Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => coverImageInputRef.current?.click()}
              disabled={uploadingCover}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploadingCover ? 'Uploading...' : t.uploadCoverImage}
            </Button>
            
            {/* Use Video Thumbnail Button */}
            {videoPreview?.thumbnail && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseThumbnail}
                className="gap-2"
              >
                <Video className="w-4 h-4" />
                {t.useThumbnail}
              </Button>
            )}
          </div>
          
          {/* Hidden file input for cover image */}
          <input
            type="file"
            accept="image/*"
            ref={coverImageInputRef}
            className="hidden"
            onChange={handleCoverImageUpload}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t.classVideo}</Label>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            {t.uploadFile}
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <Link className="w-4 h-4" />
            {t.videoUrl}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">{t.uploadVideoFile}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              {uploading ? t.uploading : t.chooseVideoFile}
            </Button>
          </div>
          
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
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
      
      {/* Cover Image Section */}
      <div className="space-y-3 border-t pt-4 mt-6">
        <Label className="text-sm font-medium">{t.coverImage}</Label>
        
        {/* Current Cover Image Display */}
        {coverImage && (
          <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden border">
            <img
              src={coverImage}
              alt="Cover image"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoverImage}
              className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        {/* Cover Image Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => coverImageInputRef.current?.click()}
            disabled={uploadingCover}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploadingCover ? 'Uploading...' : t.uploadCoverImage}
          </Button>
          
          {/* Use Video Thumbnail Button */}
          {getVideoPreview()?.thumbnail && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseThumbnail}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              {t.useThumbnail}
            </Button>
          )}
        </div>
        
        {/* Hidden file input for cover image */}
        <input
          type="file"
          accept="image/*"
          ref={coverImageInputRef}
          className="hidden"
          onChange={handleCoverImageUpload}
        />
      </div>
    </div>
  );
} 