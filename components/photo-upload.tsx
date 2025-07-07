"use client";

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function PhotoUpload({ userId, initialUrl }: { userId: number; initialUrl?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    // Ensure bucket exists manually in Supabase dashboard; here we just upload
    const filePath = `${userId}/avatar-${Date.now()}`;
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, { upsert: true, contentType: file.type });
    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    setUrl(data.publicUrl);
    // Save URL to DB
    await fetch('/api/user/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: data.publicUrl })
    });
    setUploading(false);
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
      )}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading...' : url ? 'Change Photo' : 'Upload Photo'}
      </Button>
    </div>
  );
} 