"use client";

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Video, Image, X } from 'lucide-react';

interface ClassFileUploadProps {
  userId: string;
  initialVideoPath?: string;
  initialImageUrl?: string;
  onVideoChange: (videoPath: string | null) => void;
  onImageChange: (imageUrl: string | null) => void;
}

export function ClassFileUpload({ 
  userId, 
  initialVideoPath, 
  initialImageUrl, 
  onVideoChange, 
  onImageChange 
}: ClassFileUploadProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoPath, setVideoPath] = useState<string | undefined>(initialVideoPath);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
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

      setVideoPath(filePath);
      onVideoChange(filePath);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const supabase = createClient();
    const filePath = `${userId}/class-images/image-${Date.now()}-${file.name}`;
    
    try {
      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file, { upsert: true, contentType: file.type });
      
      if (error) {
        alert(`Image upload failed: ${error.message}`);
        return;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
      onImageChange(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }

  const handleRemoveVideo = () => {
    setVideoPath(undefined);
    onVideoChange(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    onImageChange(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Class Video</Label>
        
        {videoPath ? (
          <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
            <Video className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Video uploaded</p>
              <p className="text-xs text-green-600">
                {videoPath.split('/').pop()?.substring(0, 40)}...
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">Upload a video for this class</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingVideo}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploadingVideo ? 'Uploading...' : 'Choose Video File'}
            </Button>
          </div>
        )}

        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          className="hidden"
          onChange={handleVideoUpload}
        />
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cover Image</Label>
        
        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl} 
                alt="Class cover" 
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploadingImage ? 'Uploading...' : 'Replace Image'}
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">Upload a cover image for this class</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploadingImage ? 'Uploading...' : 'Choose Image File'}
            </Button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Video: Supported formats include MP4, MOV, AVI (recommended: MP4)</p>
        <p>• Image: Supported formats include JPG, PNG, WebP (recommended: 16:9 aspect ratio)</p>
      </div>
    </div>
  );
} 