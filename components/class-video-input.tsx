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
  onVideoChange: (videoPath: string | null, videoUrl: string | null, videoType: string) => void;
}

export function ClassVideoInput({
  userId,
  initialVideoPath,
  initialVideoUrl,
  initialVideoType,
  onVideoChange
}: ClassVideoInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '');
  const [urlError, setUrlError] = useState('');
  const [activeTab, setActiveTab] = useState(
    initialVideoType === 'upload' ? 'upload' : 'url'
  );

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
        alert(`Video upload failed: ${error.message}`);
        return;
      }

      // Clear any existing URL and set new upload path
      onVideoChange(filePath, null, 'upload');
      setVideoUrl('');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleUrlSubmit() {
    if (!videoUrl.trim()) {
      setUrlError('Please enter a video URL');
      return;
    }

    if (!isValidVideoUrl(videoUrl)) {
      setUrlError('Please enter a valid YouTube, Vimeo, or video file URL');
      return;
    }

    try {
      const videoInfo = parseVideoUrl(videoUrl);
      onVideoChange(null, videoUrl, videoInfo.type);
      setUrlError('');
    } catch (error) {
      setUrlError('Invalid video URL format');
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
                <p className="text-sm font-medium text-green-800">Video uploaded</p>
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
                    {currentVideoType} video
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

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Class Video</Label>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <Link className="w-4 h-4" />
            Video URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">Upload a video file</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Choose Video File'}
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
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
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
              Supported: YouTube, Vimeo, or direct video file URLs
            </div>
            
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!videoUrl.trim()}
              className="w-full gap-2"
            >
              <Link className="w-4 h-4" />
              Add Video URL
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 