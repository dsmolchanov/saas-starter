'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/providers/simple-intl-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Users,
  Clock,
  PlayCircle,
  BookOpen,
  Video,
  BarChart3,
  Calendar,
  DollarSign,
  ChevronRight,
  Upload,
  MoreVertical,
  Star,
  MessageSquare,
  ChevronLeft,
  X,
  Zap,
  Target,
  Award,
  Sparkles,
  FileText,
  Music,
  ListMusic
} from 'lucide-react';
import { CompactLanguageSwitcher } from '@/components/ui/language-switcher-compact';
import { CourseManager } from '@/components/course-manager';
import { ClassManager } from '@/components/class-manager';

interface Course {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  isPublished: number;
  classes: any[];
}

interface Class {
  id: string;
  title: string;
  description?: string | null;
  durationMin: number;
  thumbnailUrl?: string | null;
  viewCount?: number;
}

interface Stats {
  totalCourses: number;
  totalClasses: number;
  totalViews: number;
  uniqueStudents: number;
  totalMinutesWatched: number;
}

interface TeacherStudioContentProps {
  user: any;
  courses: Course[];
  standaloneClasses: Class[];
  allClasses: Class[] | null;
  playlists: any[];
  stats: Stats;
  recentActivity: any[];
  popularClasses: Class[];
}

export function TeacherStudioContent({
  user,
  courses,
  standaloneClasses,
  allClasses,
  playlists,
  stats,
  recentActivity,
  popularClasses,
}: TeacherStudioContentProps) {
  const t = useTranslations('teacher');
  const tCommon = useTranslations('common');
  
  // Debug logging
  console.log('=== TEACHER STUDIO CONTENT DEBUG ===');
  console.log('User in component:', user?.id, user?.name);
  console.log('Courses received:', courses?.length);
  console.log('All classes received:', allClasses?.length);
  console.log('Standalone classes received:', standaloneClasses?.length);
  
  // Use allClasses if available, otherwise fall back to standaloneClasses
  const classesToShow = allClasses || standaloneClasses || [];
  console.log('Classes to show:', classesToShow?.length);
  
  const [showCourseManager, setShowCourseManager] = useState(false);
  const [showClassManager, setShowClassManager] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/more">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold">{t('teacherStudio')}</h1>
                <p className="text-xs text-gray-500">{t('manageContent')}</p>
              </div>
            </div>
            <CompactLanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Quick Stats - Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">{t('quickStats')}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
            <Card className="min-w-[140px] snap-center p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
              <PlayCircle className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{formatNumber(stats.totalViews)}</p>
              <p className="text-xs opacity-90">{t('totalViews')}</p>
            </Card>
            <Card className="min-w-[140px] snap-center p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
              <Users className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{formatNumber(stats.uniqueStudents)}</p>
              <p className="text-xs opacity-90">{t('students')}</p>
            </Card>
            <Card className="min-w-[140px] snap-center p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
              <Clock className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{formatNumber(stats.totalMinutesWatched)}</p>
              <p className="text-xs opacity-90">{tCommon('minutes')}</p>
            </Card>
            <Card className="min-w-[140px] snap-center p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
              <TrendingUp className="w-5 h-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">+24%</p>
              <p className="text-xs opacity-90">{t('growth')}</p>
            </Card>
          </div>
        </div>

        {/* Create & Manage Section - Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">{t('createAndManage')}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
            <Card 
              className="min-w-[160px] snap-center p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setShowCourseManager(true)}
            >
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="w-8 h-8 text-purple-600" />
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
              <p className="font-semibold text-sm">{t('createCourse')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('buildFullProgram')}</p>
            </Card>
            <Card 
              className="min-w-[160px] snap-center p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setShowClassManager(true)}
            >
              <div className="flex items-center justify-between mb-3">
                <Video className="w-8 h-8 text-blue-600" />
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
              <p className="font-semibold text-sm">{t('createClass')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('singleYogaSession')}</p>
            </Card>
            <Card className="min-w-[160px] snap-center p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-8 h-8 text-yellow-600" />
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
              <p className="font-semibold text-sm">{t('createSequence')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('quickSequence')}</p>
            </Card>
            <Card className="min-w-[160px] snap-center p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <Sparkles className="w-8 h-8 text-green-600" />
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
              <p className="font-semibold text-sm">{t('breathingExercise')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('pranayamaPractice')}</p>
            </Card>
            <Card className="min-w-[160px] snap-center p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <Music className="w-8 h-8 text-pink-600" />
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
              <p className="font-semibold text-sm">{t('meditation')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('guidedMeditation')}</p>
            </Card>
            <Card className="min-w-[160px] snap-center p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <ListMusic className="w-8 h-8 text-indigo-600" />
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
              <p className="font-semibold text-sm">{t('createPlaylist')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('contentCollection')}</p>
            </Card>
          </div>
        </div>

        {/* Your Courses - Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">{t('yourCourses')}</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowCourseManager(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('createNewCourse')}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                {t('browseAll')}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
          {courses.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
              {courses.map((course) => (
                <Card key={course.id} className="min-w-[240px] snap-center overflow-hidden border-0 shadow-sm">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-purple-500" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0">
                      {course.classes.length} {t('classes')}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant={course.isPublished ? 'default' : 'secondary'} className="text-xs">
                        {course.isPublished ? t('live') : t('draft')}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowCourseManager(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="px-4">
              <Card className="p-8 text-center bg-gray-50 border-dashed">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">{t('noCourses')}</p>
                <Button 
                  size="sm"
                  onClick={() => setShowCourseManager(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('createFirstCourse')}
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Your Classes - Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">{t('yourClasses')}</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowClassManager(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('createNewClass')}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                {t('browseAll')}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
          {classesToShow && classesToShow.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
              {classesToShow.map((cls) => (
                <Card key={cls.id} className="min-w-[200px] snap-center overflow-hidden border-0 shadow-sm">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 relative">
                    {cls.thumbnailUrl ? (
                      <img src={cls.thumbnailUrl} alt={cls.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-blue-500" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(cls.durationMin)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{cls.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{cls.viewCount || 0} {t('views')}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedClass(cls);
                          setShowClassManager(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="px-4">
              <Card className="p-8 text-center bg-gray-50 border-dashed">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">{t('noClasses')}</p>
                <Button 
                  size="sm"
                  onClick={() => setShowClassManager(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('createFirstClass')}
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Popular Content - Horizontal Scroll */}
        {popularClasses.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-sm font-semibold text-gray-700">{t('popularContent')}</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                {t('analytics')}
                <BarChart3 className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
              {popularClasses.map((cls, index) => (
                <Card key={cls.id} className="min-w-[180px] snap-center p-3 bg-white border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-purple-700">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{cls.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDuration(cls.durationMin)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{cls.viewCount} {t('views')}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Playlists - Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">{t('yourPlaylists')}</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('createNewPlaylist')}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                {t('browseAll')}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
          {playlists.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="min-w-[160px] snap-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-0">
                  <ListMusic className="w-6 h-6 text-indigo-600 mb-2" />
                  <h3 className="font-semibold text-sm line-clamp-1">{playlist.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{playlist.isPublic ? t('public') : t('private')}</p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="px-4">
              <Card className="p-8 text-center bg-gray-50 border-dashed">
                <ListMusic className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">{t('noPlaylists')}</p>
                <Button 
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('createFirstPlaylist')}
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">{t('quickActions')}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
            <Card className="min-w-[120px] snap-center p-3 bg-white border border-gray-200 text-center cursor-pointer hover:shadow-md transition-shadow">
              <Upload className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium">{t('bulkUpload')}</p>
            </Card>
            <Card className="min-w-[120px] snap-center p-3 bg-white border border-gray-200 text-center cursor-pointer hover:shadow-md transition-shadow">
              <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium">{t('messages')}</p>
            </Card>
            <Card className="min-w-[120px] snap-center p-3 bg-white border border-gray-200 text-center cursor-pointer hover:shadow-md transition-shadow">
              <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-xs font-medium">{t('reviews')}</p>
            </Card>
            <Card className="min-w-[120px] snap-center p-3 bg-white border border-gray-200 text-center cursor-pointer hover:shadow-md transition-shadow">
              <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-medium">{t('achievements')}</p>
            </Card>
            <Card className="min-w-[120px] snap-center p-3 bg-white border border-gray-200 text-center cursor-pointer hover:shadow-md transition-shadow">
              <FileText className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-xs font-medium">{t('resources')}</p>
            </Card>
          </div>
        </div>

      </div>

      {/* Course Manager Modal */}
      {showCourseManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Create a Course</h2>
              <Button
                onClick={() => {
                  setShowCourseManager(false);
                  setSelectedCourse(null);
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <CourseManager />
            </div>
          </div>
        </div>
      )}

      {/* Class Manager Modal */}
      {showClassManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Create a Class</h2>
              <Button
                onClick={() => {
                  setShowClassManager(false);
                  setSelectedClass(null);
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <ClassManager 
                userId={user.id} 
                onClose={() => {
                  setShowClassManager(false);
                  setSelectedClass(null);
                }}
                onClassSaved={() => {
                  setShowClassManager(false);
                  setSelectedClass(null);
                  // Optionally refresh classes list here if needed
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}