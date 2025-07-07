"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export function TeacherProfileForm() {
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/teacher/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setBio(data.profile.bio || '');
          setInstagram(data.profile.instagramUrl || '');
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/teacher/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, instagram_url: instagram })
    });
    setSaving(false);
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="space-y-4 mt-6">
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Instagram URL</label>
        <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
      </div>
      <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
    </div>
  );
} 