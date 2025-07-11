"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ClassFileUpload } from '@/components/class-file-upload';
import { Plus, Play, Edit, Trash2, Clock } from 'lucide-react';

interface ClassItem {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  difficulty: string | null;
  intensity: string | null;
  videoPath: string | null;
  imageUrl: string | null;
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
}

export function ClassManager({ userId }: ClassManagerProps) {
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
    imageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch classes
  useEffect(() => {
    fetch('/api/teacher/classes')
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
      imageUrl: '',
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
      imageUrl: classItem.imageUrl || '',
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
          imageUrl: formData.imageUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save class');
      }

      // Refresh classes list
      const classesRes = await fetch('/api/teacher/classes');
      const classesData = await classesRes.json();
      if (classesData.classes) setClasses(classesData.classes);

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save class');
    }

    setSaving(false);
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

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
                My Classes
              </CardTitle>
              <CardDescription>
                Create and manage individual yoga classes
              </CardDescription>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Class
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
              {editingClass ? 'Edit Class' : 'Create New Class'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Class Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Morning Stretch"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationMin}
                    onChange={(e) => setFormData({...formData, durationMin: e.target.value})}
                    placeholder="30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Input
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    placeholder="Beginner"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity</Label>
                  <Input
                    id="intensity"
                    value={formData.intensity}
                    onChange={(e) => setFormData({...formData, intensity: e.target.value})}
                    placeholder="Low"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this class..."
                  rows={3}
                />
              </div>

              {/* File Upload Section */}
              <div className="border-t pt-6">
                <ClassFileUpload
                  userId={userId}
                  initialVideoPath={formData.videoPath || undefined}
                  initialImageUrl={formData.imageUrl || undefined}
                  onVideoChange={(videoPath) => setFormData({...formData, videoPath: videoPath || ''})}
                  onImageChange={(imageUrl) => setFormData({...formData, imageUrl: imageUrl || ''})}
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingClass ? 'Update Class' : 'Create Class'}
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
            <h3 className="text-lg font-medium mb-2">No classes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first class to start building your content library
            </p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {classItem.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {classItem.durationMin}m
                      </Badge>
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
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(classItem)}
                    className="gap-1 flex-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(classItem.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 