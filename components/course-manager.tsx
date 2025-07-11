"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  Users
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  imageUrl: string | null;
  coverUrl: string | null;
  isPublished: number;
  category: {
    id: string;
    title: string;
    slug: string;
  };
  classes: Array<{
    id: string;
    title: string;
    durationMin: number;
  }>;
}

interface Category {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
}

interface Metadata {
  categories: Category[];
  difficultyLevels: string[];
}

export function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    categoryId: '',
    imageUrl: '',
    coverUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch courses and metadata
  useEffect(() => {
    Promise.all([
      fetch('/api/teacher/courses').then(r => r.json()),
      fetch('/api/teacher/metadata').then(r => r.json())
    ]).then(([coursesData, metadataData]) => {
      if (coursesData.courses) setCourses(coursesData.courses);
      if (metadataData) setMetadata(metadataData);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching data:', err);
      setError('Failed to load courses');
      setLoading(false);
    });
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: '',
      categoryId: '',
      imageUrl: '',
      coverUrl: '',
    });
    setEditingCourse(null);
    setShowForm(false);
    setError('');
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      level: course.level || '',
      categoryId: course.category.id,
      imageUrl: course.imageUrl || '',
      coverUrl: course.coverUrl || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingCourse 
        ? `/api/teacher/courses/${editingCourse.id}`
        : '/api/teacher/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save course');
      }

      // Refresh courses list
      const coursesRes = await fetch('/api/teacher/courses');
      const coursesData = await coursesRes.json();
      if (coursesData.courses) setCourses(coursesData.courses);

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course');
    }

    setSaving(false);
  };

  const handleDelete = async (courseId: string) => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete course');
      }

      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      const res = await fetch(`/api/teacher/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...course,
          isPublished: course.isPublished ? 0 : 1,
          categoryId: course.category.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update course');
      }

      // Update local state
      setCourses(courses.map(c => 
        c.id === course.id 
          ? { ...c, isPublished: c.isPublished ? 0 : 1 }
          : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
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
                <BookOpen className="w-5 h-5" />
                My Courses
              </CardTitle>
              <CardDescription>
                Create and manage your yoga courses
              </CardDescription>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Course
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

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first course to start building your yoga curriculum
            </p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline">
                        {course.category.title}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-1 line-clamp-2">
                      {course.title}
                    </CardTitle>
                    {course.level && (
                      <Badge variant="outline" className="text-xs">
                        {course.level}
                      </Badge>
                    )}
                  </div>
                </div>
                {course.description && (
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.classes.length} classes
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.classes.reduce((total, c) => total + c.durationMin, 0)} min
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(course)}
                    className="gap-1 flex-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(course)}
                    className="gap-1"
                  >
                    {course.isPublished ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{course.title}"? This action cannot be undone.
                          {course.classes.length > 0 && (
                            <span className="block mt-2 text-red-600 font-medium">
                              This course has {course.classes.length} classes. Please delete all classes first.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={course.classes.length > 0}
                          onClick={() => handleDelete(course.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse 
                ? 'Update your course information' 
                : 'Add a new course to your curriculum'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Beginner Hatha Series"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData({...formData, categoryId: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {metadata?.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => setFormData({...formData, level: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  {metadata?.difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what students will learn in this course..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Course Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 