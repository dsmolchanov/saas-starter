"use client";

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/components/providers/simple-intl-provider';

const FOCUS_AREAS = [
  { id: 1, name: 'Core' },
  { id: 2, name: 'Flexibility' },
  { id: 3, name: 'Strength' },
  { id: 4, name: 'Balance' },
  { id: 5, name: 'Mobility' }
];

export function LessonUploadForm({ userId }: { userId: string }) {
  const t = useTranslations('common');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  async function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${userId}/lesson-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('videos').upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }
    setFilePath(path);
    setUploading(false);
  }

  async function handleSave() {
    if (!filePath) return alert('Upload video first');
    const supabase = createClient();
    const { data } = supabase.storage.from('videos').getPublicUrl(filePath!);
    await fetch('/api/teacher/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        durationMin: duration,
        video_url: data.publicUrl,
        focus_area_ids: selected
      })
    });
    setTitle('');
    setDescription('');
    setDuration(0);
    setSelected([]);
    setFilePath(null);
    alert('Lesson saved!');
  }

  return (
    <div className="space-y-4 mt-8 border-t pt-6">
      <h3 className="font-semibold text-lg">Upload New Lesson</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
        <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Focus Areas</label>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((fa) => (
            <button
              key={fa.id}
              type="button"
              className={`px-3 py-1 rounded-full border ${selected.includes(fa.id) ? 'bg-primary text-white' : ''}`}
              onClick={() => toggle(fa.id)}
            >
              {fa.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <input type="file" accept="video/*" ref={inputRef} className="hidden" onChange={handleVideo} />
        <Button variant="outline" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : filePath ? 'Replace Video' : 'Upload Video'}
        </Button>
      </div>
      <Button onClick={handleSave}>{t('save')}</Button>
    </div>
  );
} 