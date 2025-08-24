'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus,
  Edit,
  Trash2,
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
  Settings,
  ChevronRight,
  Upload,
  Grid3x3,
  List,
  Search,
  Filter,
  MoreVertical,
  Star,
  MessageSquare,
  Share2,
  Copy,
  Archive,
  Download,
  ChevronLeft,
  X
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

interface TeacherAdminContentProps {
  user: any;
  courses: Course[];
  standaloneClasses: Class[];
  playlists: any[];
  stats: Stats;
  recentActivity: any[];
  popularClasses: Class[];
}

export function TeacherAdminContent({
  user,
  courses,
  standaloneClasses,
  playlists,
  stats,
  recentActivity,
  popularClasses,
}: TeacherAdminContentProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  // Quick stats cards data
  const quickStats = [
    {
      icon: PlayCircle,
      label: 'Total Views',
      value: formatNumber(stats.totalViews),
      change: '+12%',
      changeType: 'positive' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      label: 'Students',
      value: formatNumber(stats.uniqueStudents),
      change: '+8%',
      changeType: 'positive' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Clock,
      label: 'Watch Time',
      value: `${formatNumber(stats.totalMinutesWatched)}m`,
      change: '+15%',
      changeType: 'positive' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: DollarSign,
      label: 'Earnings',
      value: '$2,450',
      change: '+5%',
      changeType: 'positive' as const,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/more">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Teacher Admin</h1>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                Pro Teacher
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CompactLanguageSwitcher currentLocale="ru" />
              <Button 
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-4 border-0 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    stat.changeType === 'positive' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                  }`}
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full md:w-auto md:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Popular Classes */}
            <Card className="p-6 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Popular Classes</h2>
                <Link href="/teacher-admin?tab=classes">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {popularClasses.slice(0, 5).map((cls, index) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-700">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cls.title}</p>
                        <p className="text-xs text-gray-500">{formatDuration(cls.durationMin)} • {cls.viewCount} views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity Chart */}
            <Card className="p-6 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Activity (Last 30 Days)</h2>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-gray-400" />
                <p className="ml-2 text-gray-500">Activity chart visualization</p>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col"
                onClick={() => setShowCourseManager(true)}
              >
                <BookOpen className="w-6 h-6 mb-2 text-purple-600" />
                <span>New Course</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col"
                onClick={() => setShowClassManager(true)}
              >
                <Video className="w-6 h-6 mb-2 text-blue-600" />
                <span>New Class</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Upload className="w-6 h-6 mb-2 text-green-600" />
                <span>Bulk Upload</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <MessageSquare className="w-6 h-6 mb-2 text-orange-600" />
                <span>Messages</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                  onClick={() => setShowCourseManager(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </Button>
              </div>
            </div>

            {/* Courses Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-purple-500" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2">
                        {course.classes.length} classes
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowCourseManager(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4 border-0 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.classes.length} classes • {course.isPublished ? 'Published' : 'Draft'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowCourseManager(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={() => setShowClassManager(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Class
              </Button>
            </div>

            {/* Classes List */}
            <div className="space-y-2">
              {standaloneClasses.map((cls) => (
                <Card key={cls.id} className="p-4 border-0 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                        {cls.thumbnailUrl ? (
                          <img src={cls.thumbnailUrl} alt={cls.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Video className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{cls.title}</h3>
                        <p className="text-sm text-gray-500">{formatDuration(cls.durationMin)} • {cls.viewCount || 0} views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedClass(cls);
                          setShowClassManager(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-6 border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                  <Badge variant="secondary" className="mt-1 text-green-600 bg-green-50">
                    +5% from last month
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">65%</p>
                  <Badge variant="secondary" className="mt-1 text-green-600 bg-green-50">
                    +3% from last month
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">4.8</span>
                    <span className="text-sm text-gray-500">(234 reviews)</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Demographics</h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Demographics chart visualization</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Manager Modal */}
      {showCourseManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <Button
              onClick={() => {
                setShowCourseManager(false);
                setSelectedCourse(null);
              }}
              className="absolute top-4 right-4 z-10"
              variant="ghost"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
            <CourseManager />
          </div>
        </div>
      )}

      {/* Class Manager Modal */}
      {showClassManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <Button
              onClick={() => {
                setShowClassManager(false);
                setSelectedClass(null);
              }}
              className="absolute top-4 right-4 z-10"
              variant="ghost"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
            <ClassManager userId={user.id} />
          </div>
        </div>
      )}
    </div>
  );
}