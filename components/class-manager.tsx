"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ClassVideoInputMux } from '@/components/class-video-input-mux';
import { CoverImageUpload } from '@/components/cover-image-upload';
import { Plus, Play, Edit, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';

interface ClassItem {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  difficulty: string | null;
  intensity: string | null;
  videoPath: string | null;
  videoUrl: string | null;
  videoType: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  muxUploadId: string | null;
  muxStatus: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  course: {
    id: string;
    title: string;
  } | null;
  focusAreas: Array<{
    focusArea: {
      id: string;
      name: string;
    };
  }>;
}

interface ClassManagerProps {
  userId: string;
  locale?: string;
}

// Locale-aware translations for ClassManager
function getTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      myClasses: 'Мои занятия',
      createAndManage: 'Создавайте и управляйте индивидуальными занятиями йогой',
      createClass: 'Создать занятие',
      editClass: 'Редактировать занятие',
      createNewClass: 'Создать новое занятие',
      noClasses: 'У вас пока нет занятий. Создайте своё первое занятие!',
      classTitle: 'Название занятия',
      titlePlaceholder: 'например, Утренняя растяжка',
      description: 'Описание',
      descriptionPlaceholder: 'Опишите это занятие...',
      duration: 'Продолжительность (минуты)',
      durationPlaceholder: '30',
      difficulty: 'Сложность',
      difficultyPlaceholder: 'Начинающий',
      intensity: 'Интенсивность',
      intensityPlaceholder: 'Низкая',
      cancel: 'Отмена',
      save: 'Сохранить',
      saving: 'Сохранение...',
      updateClass: 'Обновить занятие',
      delete: 'Удалить',
      edit: 'Редактировать',
      video: 'Видео',
      minutes: 'м',
      noClassesYet: 'Занятий пока нет',
      createFirstClass: 'Создайте своё первое занятие, чтобы начать формировать библиотеку контента',
      createYourFirstClass: 'Создать первое занятие',
      deleteConfirm: 'Вы уверены, что хотите удалить это занятие?'
    },
    en: {
      myClasses: 'My Classes',
      createAndManage: 'Create and manage individual yoga classes',
      createClass: 'Create Class',
      editClass: 'Edit Class',
      createNewClass: 'Create New Class',
      noClasses: 'You don\'t have any classes yet. Create your first class!',
      classTitle: 'Class Title',
      titlePlaceholder: 'e.g., Morning Stretch',
      description: 'Description',
      descriptionPlaceholder: 'Describe this class...',
      duration: 'Duration (minutes)',
      durationPlaceholder: '30',
      difficulty: 'Difficulty',
      difficultyPlaceholder: 'Beginner',
      intensity: 'Intensity',
      intensityPlaceholder: 'Low',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      updateClass: 'Update Class',
      delete: 'Delete',
      edit: 'Edit',
      video: 'Video',
      minutes: 'min',
      noClassesYet: 'No classes yet',
      createFirstClass: 'Create your first class to start building your content library',
      createYourFirstClass: 'Create Your First Class',
      deleteConfirm: 'Are you sure you want to delete this class?'
    },
    'es-MX': {
      myClasses: 'Mis Clases',
      createAndManage: 'Crear y gestionar clases individuales de yoga',
      createClass: 'Crear Clase',
      editClass: 'Editar Clase',
      createNewClass: 'Crear Nueva Clase',
      noClasses: '¡Aún no tienes clases. Crea tu primera clase!',
      classTitle: 'Título de la Clase',
      titlePlaceholder: 'ej., Estiramiento Matutino',
      description: 'Descripción',
      descriptionPlaceholder: 'Describe esta clase...',
      duration: 'Duración (minutos)',
      durationPlaceholder: '30',
      difficulty: 'Dificultad',
      difficultyPlaceholder: 'Principiante',
      intensity: 'Intensidad',
      intensityPlaceholder: 'Baja',
      cancel: 'Cancelar',
      save: 'Guardar',
      saving: 'Guardando...',
      updateClass: 'Actualizar Clase',
      delete: 'Eliminar',
      edit: 'Editar',
      video: 'Video',
      minutes: 'min',
      noClassesYet: 'Aún no hay clases',
      createFirstClass: 'Crea tu primera clase para comenzar a construir tu biblioteca de contenido',
      createYourFirstClass: 'Crear Tu Primera Clase',
      deleteConfirm: '¿Estás seguro de que quieres eliminar esta clase?'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export function ClassManager({ userId, locale = 'ru' }: ClassManagerProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMin: '',
    difficulty: '',
    intensity: '',
    videoPath: '',
    videoUrl: '',
    videoType: '',
    muxAssetId: '',
    muxPlaybackId: '',
    muxUploadId: '',
    muxStatus: '',
    imageUrl: '', // This is our cover image
    thumbnailUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const t = getTranslations(locale);

  // Fetch classes
  useEffect(() => {
    fetch('/api/teacher/classes', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.classes) setClasses(data.classes);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes');
        setLoading(false);
      });
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      durationMin: '',
      difficulty: '',
      intensity: '',
      videoPath: '',
      videoUrl: '',
      videoType: '',
      muxAssetId: '',
      muxPlaybackId: '',
      muxUploadId: '',
      muxStatus: '',
      imageUrl: '',
      thumbnailUrl: '',
    });
    setEditingClass(null);
    setShowForm(false);
    setError('');
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (classItem: ClassItem) => {
    setEditingClass(classItem);
    setFormData({
      title: classItem.title,
      description: classItem.description || '',
      durationMin: classItem.durationMin.toString(),
      difficulty: classItem.difficulty || '',
      intensity: classItem.intensity || '',
      videoPath: classItem.videoPath || '',
      videoUrl: classItem.videoUrl || '',
      videoType: classItem.videoType || '',
      muxAssetId: classItem.muxAssetId || '',
      muxPlaybackId: classItem.muxPlaybackId || '',
      muxUploadId: classItem.muxUploadId || '',
      muxStatus: classItem.muxStatus || '',
      imageUrl: classItem.imageUrl || '',
      thumbnailUrl: classItem.thumbnailUrl || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingClass 
        ? `/api/teacher/classes/${editingClass.id}`
        : '/api/teacher/classes';
      
      const method = editingClass ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          durationMin: parseInt(formData.durationMin),
          videoPath: formData.videoPath || null,
          videoUrl: formData.videoUrl || null,
          videoType: formData.videoType || null,
          muxAssetId: formData.muxAssetId || null,
          muxPlaybackId: formData.muxPlaybackId || null,
          muxUploadId: formData.muxUploadId || null,
          muxStatus: formData.muxStatus || null,
          imageUrl: formData.imageUrl || null,
          thumbnailUrl: formData.thumbnailUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save class');
      }

      // Refresh classes list with cache busting
      const classesRes = await fetch(`/api/teacher/classes?t=${Date.now()}`, {
        cache: 'no-store'
      });
      const classesData = await classesRes.json();
      if (classesData.classes) setClasses(classesData.classes);

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save class');
    }

    setSaving(false);
  };

  const handleDelete = async (classId: string) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const res = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete class');
      }

      setClasses(classes.filter(c => c.id !== classId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                {t.myClasses}
              </CardTitle>
              <CardDescription>
                {t.createAndManage}
              </CardDescription>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              {t.createClass}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClass ? t.edit : t.createNewClass}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">{t.classTitle}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder={t.titlePlaceholder}
                    required
                  />
                </div>

                {/* Duration field is hidden - will be auto-filled from video */}
                <input
                  type="hidden"
                  value={formData.durationMin}
                />

                <div className="space-y-2">
                  <Label htmlFor="difficulty">{t.difficulty}</Label>
                  <Input
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    placeholder={t.difficultyPlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intensity">{t.intensity}</Label>
                  <Input
                    id="intensity"
                    value={formData.intensity}
                    onChange={(e) => setFormData({...formData, intensity: e.target.value})}
                    placeholder={t.intensityPlaceholder}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={t.descriptionPlaceholder}
                  rows={3}
                />
              </div>

              {/* Cover Image Upload Section */}
              <div className="border-t pt-6">
                <CoverImageUpload
                  key={formData.imageUrl} // Force re-render when imageUrl changes
                  initialImage={formData.imageUrl}
                  onImageChange={(imageUrl) => setFormData(prev => ({...prev, imageUrl: imageUrl || ''}))}
                  locale={locale}
                />
              </div>

              {/* Video Upload Section */}
              <div className="border-t pt-6">
                <ClassVideoInputMux
                  userId={userId}
                  initialVideoPath={formData.videoPath || undefined}
                  initialVideoUrl={formData.videoUrl || undefined}
                  initialVideoType={formData.videoType || undefined}
                  initialMuxAssetId={formData.muxAssetId || undefined}
                  initialMuxPlaybackId={formData.muxPlaybackId || undefined}
                  initialMuxUploadId={formData.muxUploadId || undefined}
                  initialMuxStatus={formData.muxStatus || undefined}
                  onVideoChange={(data) => {
                    setFormData({
                      ...formData,
                      videoPath: data.videoPath || '',
                      videoUrl: data.videoUrl || '',
                      videoType: data.videoType || '',
                      muxAssetId: data.muxAssetId || '',
                      muxPlaybackId: data.muxPlaybackId || '',
                      muxUploadId: data.muxUploadId || '',
                      muxStatus: data.muxStatus || '',
                      thumbnailUrl: data.thumbnailUrl || '',
                    });
                  }}
                  onCoverImageChange={(coverImage) => {
                    // Auto-fill cover image from video thumbnail
                    // This will be called when a new video is uploaded
                    if (coverImage) {
                      setFormData(prev => ({...prev, imageUrl: coverImage}));
                    }
                  }}
                  onDurationChange={(durationMinutes) => {
                    if (durationMinutes) {
                      setFormData(prev => ({...prev, durationMin: durationMinutes.toString()}));
                    }
                  }}
                  initialCoverImage={formData.imageUrl}
                  locale={locale}
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t.cancel}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? t.saving : editingClass ? t.updateClass : t.createClass}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Classes Grid */}
      {classes.length === 0 && !showForm ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t.noClassesYet}</h3>
            <p className="text-muted-foreground mb-4">
              {t.createFirstClass}
            </p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              {t.createYourFirstClass}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {classes.map((classItem) => (
            <div key={classItem.id} className="relative group">
              {/* Clickable card that goes to student view */}
              <Card className="group hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                <Link href={`/classes/${classItem.id}`} className="block">
                  {/* Class Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    {classItem.thumbnailUrl || classItem.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={classItem.thumbnailUrl || classItem.imageUrl || ''}
                        alt={classItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Play className="w-8 h-8 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {classItem.durationMin}{t.minutes}
                    </div>
                    {classItem.videoPath && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-green-500/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {t.video}
                        </div>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {classItem.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          {classItem.difficulty && (
                            <Badge variant="secondary">
                              {classItem.difficulty}
                            </Badge>
                          )}
                          {classItem.intensity && (
                            <Badge variant="outline">
                              {classItem.intensity}
                            </Badge>
                          )}
                        </div>
                        {classItem.course && (
                          <Badge variant="default" className="text-xs">
                            {classItem.course.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {classItem.description && (
                      <CardDescription className="line-clamp-2">
                        {classItem.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Link>
                
                {/* Action buttons - positioned at bottom */}
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit(classItem);
                      }}
                      className="gap-1 flex-1"
                    >
                      <Edit className="w-3 h-3" />
                      {t.edit}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(classItem.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 