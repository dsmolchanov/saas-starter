"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TeacherProfileFormProps {
  locale?: string;
}

// Locale-aware translations for TeacherProfileForm
function getTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      bio: 'Биография',
      bioPlaceholder: 'Расскажите студентам о вашем опыте в йоге, стиле преподавания и практике...',
      bioDescription: 'Это будет отображаться на странице вашего профиля преподавателя.',
      instagramUsername: 'Имя пользователя Instagram',
      instagramPlaceholder: 'ваш_йога_профиль',
      studentsWillSee: 'Студенты увидят:',
      instagramHandle: 'Ваш Instagram профиль (без @)',
      saving: 'Сохранение...',
      saveProfile: 'Сохранить профиль',
      profileSavedSuccessfully: 'Профиль успешно сохранен!',
      failedToSaveProfile: 'Не удалось сохранить профиль. Попробуйте еще раз.'
    },
    en: {
      bio: 'Bio',
      bioPlaceholder: 'Tell students about your yoga background, teaching style, and experience...',
      bioDescription: 'This will be displayed on your teacher profile page.',
      instagramUsername: 'Instagram Username',
      instagramPlaceholder: 'your_yoga_handle',
      studentsWillSee: 'Students will see:',
      instagramHandle: 'Your Instagram handle (without @)',
      saving: 'Saving...',
      saveProfile: 'Save Profile',
      profileSavedSuccessfully: 'Profile saved successfully!',
      failedToSaveProfile: 'Failed to save profile. Please try again.'
    },
    'es-MX': {
      bio: 'Biografía',
      bioPlaceholder: 'Cuéntales a los estudiantes sobre tu experiencia en yoga, estilo de enseñanza y práctica...',
      bioDescription: 'Esto se mostrará en la página de tu perfil de profesor.',
      instagramUsername: 'Nombre de Usuario Instagram',
      instagramPlaceholder: 'tu_perfil_yoga',
      studentsWillSee: 'Los estudiantes verán:',
      instagramHandle: 'Tu usuario de Instagram (sin @)',
      saving: 'Guardando...',
      saveProfile: 'Guardar Perfil',
      profileSavedSuccessfully: '¡Perfil guardado exitosamente!',
      failedToSaveProfile: 'Error al guardar el perfil. Inténtalo de nuevo.'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export function TeacherProfileForm({ locale = 'ru' }: TeacherProfileFormProps = {}) {
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const t = getTranslations(locale);

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
        setSuccess(t.profileSavedSuccessfully);
        setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
      } else {
        setError(data.error || t.failedToSaveProfile);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(t.failedToSaveProfile);
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
          {t.bio}
        </Label>
        <Textarea 
          id="bio"
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
          rows={4}
          placeholder={t.bioPlaceholder}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {t.bioDescription}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="instagram" className="text-sm font-medium">
          {t.instagramUsername}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-muted-foreground text-sm">@</span>
          </div>
          <Input 
            id="instagram"
            value={instagram} 
            onChange={handleInstagramChange}
            placeholder={t.instagramPlaceholder}
            className="pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {instagram ? `${t.studentsWillSee} ${displayInstagramUsername(instagram)}` : t.instagramHandle}
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
         {saving ? t.saving : t.saveProfile}
       </Button>
     </div>
   );
 } 