"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TeacherProfileForm() {
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper function to clean Instagram username
  const cleanInstagramUsername = (value: string): string => {
    // Remove any @ symbols and clean the input
    const cleaned = value.replace(/@/g, '').trim();
    return cleaned;
  };

  // Helper function to display Instagram username (with @)
  const displayInstagramUsername = (value: string): string => {
    if (!value) return '';
    // Remove any @ symbols first, then add one @ at the beginning
    const cleaned = cleanInstagramUsername(value);
    return cleaned ? `@${cleaned}` : '';
  };

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/teacher/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setBio(data.profile.bio || '');
          // Clean the Instagram URL to just the username for editing
          const instagramValue = data.profile.instagramUrl || '';
          setInstagram(cleanInstagramUsername(instagramValue));
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Clean the input - remove @ symbols and store just the username
    setInstagram(cleanInstagramUsername(value));
  };

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    
    // Prepare the Instagram URL - store with @ prefix for consistency
    const instagramToSave = instagram ? `@${instagram}` : '';
    
    try {
      const res = await fetch('/api/teacher/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, instagram_url: instagramToSave })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Profile saved successfully!');
        setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
      } else {
        setError(data.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    }
    
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          Bio
        </Label>
        <Textarea 
          id="bio"
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
          rows={4}
          placeholder="Tell students about your yoga background, teaching style, and experience..."
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          This will be displayed on your teacher profile page.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="instagram" className="text-sm font-medium">
          Instagram Username
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-muted-foreground text-sm">@</span>
          </div>
          <Input 
            id="instagram"
            value={instagram} 
            onChange={handleInstagramChange}
            placeholder="your_yoga_handle"
            className="pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {instagram ? `Students will see: ${displayInstagramUsername(instagram)}` : 'Your Instagram handle (without @)'}
        </p>
      </div>
      
             {error && (
         <div className="p-3 rounded-md bg-red-50 border border-red-200">
           <p className="text-sm text-red-600">{error}</p>
         </div>
       )}
       
       {success && (
         <div className="p-3 rounded-md bg-green-50 border border-green-200">
           <p className="text-sm text-green-600">{success}</p>
         </div>
       )}
       
       <Button 
         onClick={handleSave} 
         disabled={saving}
         className="w-full sm:w-auto"
       >
         {saving ? 'Saving...' : 'Save Profile'}
       </Button>
     </div>
   );
 } 