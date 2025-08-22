'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db/drizzle';
import { teachers, courses, lessons, focusAreas, lessonFocusAreas } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Home, Filter, Play, Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

// Disable static prerendering for DB queries
export const dynamic = 'force-dynamic';

interface Teacher {
  id: number;
  bio: string | null;
  instagramUrl: string | null;
  user: {
    id: number;
    name: string | null;
    avatarUrl: string | null;
  } | null;
}

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  durationMin: number;
  imageUrl: string | null; // High-res image for detailed views (800px+)
  thumbnailUrl: string | null; // Smaller image for grid/card views (400px)
  difficulty: string | null;
  intensity: string | null;
  style: string | null;
  equipment: string | null;
  focusAreas: { focusArea: { id: number; name: string } }[];
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  level: string | null;
  coverUrl: string | null; // High-res cover image (800px+)
  imageUrl: string | null; // Smaller course image (400px)
  teacher: {
    id: number;
    name: string | null;
  } | null;
  lessons: { id: number }[];
}

interface Filters {
  focusAreas: number[];
  difficulties: string[];
  styles: string[];
}

export default function BrowsePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allFocusAreas, setAllFocusAreas] = useState<{ id: number; name: string }[]>([]);
  const [allDifficulties, setAllDifficulties] = useState<string[]>([]);
  const [allStyles, setAllStyles] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    focusAreas: [],
    difficulties: [],
    styles: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // This would normally be server-side, but for now we'll use client-side fetching
      // In production, create API routes for these
      const response = await fetch('/api/browse-data');
      const data = await response.json();
      
      setTeachers(data.teachers || []);
      setLessons(data.lessons || []);
      setCourses(data.courses || []);
      setAllFocusAreas(data.focusAreas || []);
      setAllDifficulties(data.difficulties || []);
      setAllStyles(data.styles || []);
    } catch (error) {
      console.error('Error fetching browse data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    if (filters.focusAreas.length > 0) {
      const lessonFocusAreaIds = lesson.focusAreas.map(fa => fa.focusArea.id);
      if (!filters.focusAreas.some(id => lessonFocusAreaIds.includes(id))) return false;
    }
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(lesson.difficulty || '')) return false;
    if (filters.styles.length > 0 && !filters.styles.includes(lesson.style || '')) return false;
    return true;
  });

  const filteredCourses = courses; // Add course filtering if needed

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Browse</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Discover amazing instructors, classes, and courses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {(filters.focusAreas.length + filters.difficulties.length + filters.styles.length) > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {filters.focusAreas.length + filters.difficulties.length + filters.styles.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Filter classes by focus areas, difficulty levels, and yoga styles to find your perfect practice.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Focus Areas */}
                <div>
                  <h3 className="font-medium mb-3">Focus Areas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {allFocusAreas.map(area => (
                      <div key={area.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`focus-${area.id}`}
                          checked={filters.focusAreas.includes(area.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, focusAreas: [...prev.focusAreas, area.id] }));
                            } else {
                              setFilters(prev => ({ ...prev, focusAreas: prev.focusAreas.filter(id => id !== area.id) }));
                            }
                          }}
                        />
                        <label htmlFor={`focus-${area.id}`} className="text-sm">{area.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulties */}
                <div>
                  <h3 className="font-medium mb-3">Difficulty</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {allDifficulties.map(difficulty => (
                      <div key={difficulty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`diff-${difficulty}`}
                          checked={filters.difficulties.includes(difficulty)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, difficulties: [...prev.difficulties, difficulty] }));
                            } else {
                              setFilters(prev => ({ ...prev, difficulties: prev.difficulties.filter(d => d !== difficulty) }));
                            }
                          }}
                        />
                        <label htmlFor={`diff-${difficulty}`} className="text-sm">{difficulty}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Styles */}
                <div>
                  <h3 className="font-medium mb-3">Styles</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {allStyles.map(style => (
                      <div key={style} className="flex items-center space-x-2">
                        <Checkbox
                          id={`style-${style}`}
                          checked={filters.styles.includes(style)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, styles: [...prev.styles, style] }));
                            } else {
                              setFilters(prev => ({ ...prev, styles: prev.styles.filter(s => s !== style) }));
                            }
                          }}
                        />
                        <label htmlFor={`style-${style}`} className="text-sm">{style}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({ focusAreas: [], difficulties: [], styles: [] })}
                >
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button asChild variant="ghost" size="icon" className="sm:hidden">
            <Link href="/">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.focusAreas.length + filters.difficulties.length + filters.styles.length) > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.focusAreas.map(id => {
            const area = allFocusAreas.find(a => a.id === id);
            return area ? (
              <Badge key={`focus-${id}`} variant="secondary" className="gap-1">
                {area.name}
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, focusAreas: prev.focusAreas.filter(fid => fid !== id) }))}
                  className="ml-1 text-xs hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ) : null;
          })}
          {filters.difficulties.map(difficulty => (
            <Badge key={`diff-${difficulty}`} variant="secondary" className="gap-1">
              {difficulty}
              <button 
                onClick={() => setFilters(prev => ({ ...prev, difficulties: prev.difficulties.filter(d => d !== difficulty) }))}
                className="ml-1 text-xs hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.styles.map(style => (
            <Badge key={`style-${style}`} variant="secondary" className="gap-1">
              {style}
              <button 
                onClick={() => setFilters(prev => ({ ...prev, styles: prev.styles.filter(s => s !== style) }))}
                className="ml-1 text-xs hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Teachers Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured Instructors</h2>
          <Link href="/teachers" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex-shrink-0 w-24 text-center">
              <Link href="/teachers">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarImage src={teacher.user?.avatarUrl || undefined} className="object-cover" />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium truncate">{teacher.user?.name || 'Instructor'}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Lessons Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Classes</h2>
          <Link href="/classes" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {filteredLessons.slice(0, 10).map((lesson, index) => (
            <div key={lesson.id} className="flex-shrink-0 w-64">
              <Link href={`/lesson/${lesson.id}`}>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3 relative group">
                  {lesson.imageUrl || lesson.thumbnailUrl ? (
                    <Image
                      src={lesson.imageUrl || lesson.thumbnailUrl || ''}
                      alt={lesson.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 2}
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {lesson.durationMin}min
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <Button size="sm" className="gap-1">
                      <Play className="w-3 h-3" />
                      Play
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2 mb-1">{lesson.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{lesson.durationMin}min</span>
                    {lesson.difficulty && (
                      <>
                        <span>•</span>
                        <span>{lesson.difficulty}</span>
                      </>
                    )}
                  </div>
                  {lesson.focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lesson.focusAreas.slice(0, 2).map(fa => (
                        <Badge key={fa.focusArea.id} variant="outline" className="text-xs px-1 py-0">
                          {fa.focusArea.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Courses</h2>
          <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {filteredCourses.slice(0, 10).map((course, index) => (
            <div key={course.id} className="flex-shrink-0 w-64">
              <Link href={`/course/${course.id}`}>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3 relative group">
                  {course.imageUrl || course.coverUrl ? (
                    <Image
                      src={course.imageUrl || course.coverUrl || ''}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 2}
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="text-2xl font-medium text-primary">
                        {course.title[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {course.lessons.length} {course.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2 mb-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    By {course.teacher?.name || 'Instructor'}
                  </p>
                  {course.level && (
                    <Badge variant="outline" className="text-xs px-1 py-0 mt-1">
                      {course.level}
                    </Badge>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
