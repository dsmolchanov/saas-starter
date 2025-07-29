"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users,
  GripVertical,
  X,
  PlayCircle,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface ClassItem {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  orderIndex: number | null;
  courseId: string | null;
  imageUrl: string | null;
  difficulty: string | null;
  intensity: string | null;
}

interface Metadata {
  categories: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  difficultyLevels: string[];
}

interface CourseManagerProps {
  locale?: string;
}

// Locale-aware translations for CourseManager
function getTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      myCourses: 'Мои курсы',
      createCourse: 'Создать курс',
      editCourse: 'Редактировать курс',
      createNewCourse: 'Создать новый курс',
      updateCourse: 'Обновить курс',
      published: 'Опубликован',
      draft: 'Черновик',
      deleteCourse: 'Удалить курс',
      cancel: 'Отмена',
      delete: 'Удалить',
      saving: 'Сохранение...',
      failedToSaveCourse: 'Не удалось сохранить курс',
      failedToDeleteCourse: 'Не удалось удалить курс',
      failedToLoadCourses: 'Не удалось загрузить курсы',
      deleteConfirmation: 'Вы уверены, что хотите удалить',
      actionCannotBeUndone: 'Это действие нельзя отменить.',
      courseHasClasses: 'У этого курса есть занятия. Пожалуйста, сначала удалите все занятия.',
      noCourses: 'У вас пока нет курсов. Создайте свой первый курс!',
      title: 'Название',
      description: 'Описание',
      level: 'Уровень',
      category: 'Категория',
      imageUrl: 'URL изображения',
      coverUrl: 'URL обложки'
    },
    en: {
      myCourses: 'My Courses',
      createCourse: 'Create Course',
      editCourse: 'Edit Course',
      createNewCourse: 'Create New Course',
      updateCourse: 'Update Course',
      published: 'Published',
      draft: 'Draft',
      deleteCourse: 'Delete Course',
      cancel: 'Cancel',
      delete: 'Delete',
      saving: 'Saving...',
      failedToSaveCourse: 'Failed to save course',
      failedToDeleteCourse: 'Failed to delete course',
      failedToLoadCourses: 'Failed to load courses',
      deleteConfirmation: 'Are you sure you want to delete',
      actionCannotBeUndone: 'This action cannot be undone.',
      courseHasClasses: 'This course has classes. Please delete all classes first.',
      noCourses: 'You don\'t have any courses yet. Create your first course!',
      title: 'Title',
      description: 'Description',
      level: 'Level',
      category: 'Category',
      imageUrl: 'Image URL',
      coverUrl: 'Cover URL'
    },
    'es-MX': {
      myCourses: 'Mis Cursos',
      createCourse: 'Crear Curso',
      editCourse: 'Editar Curso',
      createNewCourse: 'Crear Nuevo Curso',
      updateCourse: 'Actualizar Curso',
      published: 'Publicado',
      draft: 'Borrador',
      deleteCourse: 'Eliminar Curso',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      saving: 'Guardando...',
      failedToSaveCourse: 'Error al guardar el curso',
      failedToDeleteCourse: 'Error al eliminar el curso',
      failedToLoadCourses: 'Error al cargar los cursos',
      deleteConfirmation: '¿Estás seguro de que quieres eliminar',
      actionCannotBeUndone: 'Esta acción no se puede deshacer.',
      courseHasClasses: 'Este curso tiene clases. Por favor elimina todas las clases primero.',
      noCourses: '¡Aún no tienes cursos. Crea tu primer curso!',
      title: 'Título',
      description: 'Descripción',
      level: 'Nivel',
      category: 'Categoría',
      imageUrl: 'URL de Imagen',
      coverUrl: 'URL de Portada'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export function CourseManager({ locale = 'ru' }: CourseManagerProps = {}) {
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
  
  // Class management state
  const [assignedClasses, setAssignedClasses] = useState<ClassItem[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  const router = useRouter();
  const t = getTranslations(locale);

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
      setError(t.failedToLoadCourses);
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
    setAssignedClasses([]);
    setAvailableClasses([]);
    setActiveTab('details');
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleViewCourse = (courseId: string) => {
    router.push(`/course/${courseId}`);
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
    setActiveTab('details');
    fetchCourseClasses(course.id);
    setShowForm(true);
  };

  // Fetch classes for course editing
  const fetchCourseClasses = async (courseId: string) => {
    setLoadingClasses(true);
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}/classes`);
      const data = await response.json();
      
      if (response.ok) {
        setAssignedClasses(data.assignedClasses || []);
        setAvailableClasses(data.availableClasses || []);
      } else {
        console.error('Failed to fetch course classes:', data.error);
      }
    } catch (error) {
      console.error('Error fetching course classes:', error);
    }
    setLoadingClasses(false);
  };

  // Add class to course
  const addClassToCourse = (classItem: ClassItem) => {
    setAvailableClasses(prev => prev.filter(c => c.id !== classItem.id));
    setAssignedClasses(prev => [...prev, { ...classItem, orderIndex: prev.length + 1 }]);
  };

  // Remove class from course
  const removeClassFromCourse = (classId: string) => {
    const classItem = assignedClasses.find(c => c.id === classId);
    if (classItem) {
      setAssignedClasses(prev => prev.filter(c => c.id !== classId));
      setAvailableClasses(prev => [...prev, { ...classItem, orderIndex: null }]);
    }
  };

  // Reorder classes
  const moveClass = (fromIndex: number, toIndex: number) => {
    const newAssignedClasses = [...assignedClasses];
    const [movedClass] = newAssignedClasses.splice(fromIndex, 1);
    newAssignedClasses.splice(toIndex, 0, movedClass);
    
    // Update order indices
    const reorderedClasses = newAssignedClasses.map((cls, index) => ({
      ...cls,
      orderIndex: index + 1
    }));
    
    setAssignedClasses(reorderedClasses);
  };

  // Save class assignments
  const saveClassAssignments = async () => {
    if (!editingCourse) return;

    try {
      const response = await fetch(`/api/teacher/courses/${editingCourse.id}/classes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedClassIds: assignedClasses.map(c => c.id),
          removedClassIds: [] // We'll handle this through the assignment list
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save class assignments');
      }

      // Refresh courses to update the class count
      const coursesRes = await fetch('/api/teacher/courses');
      const coursesData = await coursesRes.json();
      if (coursesData.courses) setCourses(coursesData.courses);
      
    } catch (error) {
      console.error('Error saving class assignments:', error);
      setError(error instanceof Error ? error.message : 'Failed to save class assignments');
    }
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
        throw new Error(data.error || t.failedToSaveCourse);
      }

      // Refresh courses list
      const coursesRes = await fetch('/api/teacher/courses');
      const coursesData = await coursesRes.json();
      if (coursesData.courses) setCourses(coursesData.courses);

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedToSaveCourse);
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
                {t.myCourses}
              </CardTitle>
              <CardDescription>
                Create and manage your yoga courses
              </CardDescription>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
                              {t.createCourse}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-md transition-shadow overflow-hidden">
              {/* Course Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {course.coverUrl || course.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.coverUrl || course.imageUrl || ''}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <BookOpen className="w-8 h-8 text-primary/50" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? t.published : t.draft}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {course.classes.length} {course.classes.length === 1 ? 'class' : 'classes'}
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {course.category.title}
                      </Badge>
                      {course.level && (
                        <Badge variant="outline" className="text-xs">
                          {course.level}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mb-1 line-clamp-2">
                      {course.title}
                    </CardTitle>
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
                    onClick={() => handleViewCourse(course.id)}
                    className="gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </Button>
                  
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse 
                ? 'Update your course information and manage classes' 
                : 'Add a new course to your curriculum'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Course Details</TabsTrigger>
              <TabsTrigger value="classes" disabled={!editingCourse}>
                Manage Classes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
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
                  <Label htmlFor="coverUrl">Course Cover Image URL (optional)</Label>
                  <Input
                    id="coverUrl"
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({...formData, coverUrl: e.target.value})}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="classes" className="mt-6">
              {editingCourse && (
                <div className="space-y-6">
                  {/* Course Classes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Course Content</h3>
                      <Button 
                        onClick={saveClassAssignments}
                        disabled={loadingClasses}
                        size="sm"
                      >
                        Save Changes
                      </Button>
                    </div>
                    
                    {loadingClasses ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {assignedClasses.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No classes assigned to this course yet.
                            <br />
                            Add classes from the available classes below.
                          </div>
                        ) : (
                          assignedClasses.map((classItem, index) => (
                            <div
                              key={classItem.id}
                              className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                            >
                              <div className="flex items-center gap-2 cursor-move">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-500 w-6">
                                  {index + 1}
                                </span>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <PlayCircle className="w-4 h-4 text-blue-500" />
                                  <span className="font-medium">{classItem.title}</span>
                                  {classItem.difficulty && (
                                    <Badge variant="outline" className="text-xs">
                                      {classItem.difficulty}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {classItem.durationMin} min
                                  </span>
                                  {classItem.description && (
                                    <span className="truncate max-w-md">
                                      {classItem.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeClassFromCourse(classItem.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Available Classes Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Available Classes</h3>
                    {loadingClasses ? (
                      <div className="space-y-2">
                        {[1, 2].map(i => (
                          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : availableClasses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No available classes. 
                        <br />
                        Create new classes in the Classes tab first.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {availableClasses.map((classItem) => (
                          <div
                            key={classItem.id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{classItem.title}</span>
                                {classItem.difficulty && (
                                  <Badge variant="outline" className="text-xs">
                                    {classItem.difficulty}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {classItem.durationMin} min
                                </span>
                                {classItem.description && (
                                  <span className="truncate max-w-md">
                                    {classItem.description}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addClassToCourse(classItem)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 mt-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 