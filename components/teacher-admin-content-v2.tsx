'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyPlaylists } from '@/components/my-playlists';
import { ClassManager } from '@/components/class-manager';
import { CourseManager } from '@/components/course-manager';
import { AsanaManager } from '@/components/content/AsanaManager';
import { BreathingManager } from '@/components/content/BreathingManager';
import { MeditationManager } from '@/components/content/MeditationManager';
import { 
  Plus,
  BookOpen,
  Video,
  Headphones,
  Users,
  Calendar,
  Wind,
  Sparkles,
  Trophy,
  FileText,
  Radio,
  Moon,
  Heart,
  Zap,
  BarChart3,
  Settings,
  ChevronRight,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

interface TeacherAdminContentProps {
  user: any;
  courses: any[];
  standaloneClasses: any[];
  playlists: any[];
  stats: {
    totalCourses: number;
    totalClasses: number;
    totalViews: number;
    uniqueStudents: number;
    totalMinutesWatched: number;
  };
  recentActivity: any[];
  popularClasses: any[];
}

export function TeacherAdminContentV2({
  user,
  courses,
  standaloneClasses,
  playlists,
  stats,
  recentActivity,
  popularClasses,
}: TeacherAdminContentProps) {
  const [selectedSection, setSelectedSection] = useState('overview');

  const contentTypes = [
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen,
      count: courses.length,
      color: 'bg-purple-100 text-purple-700',
      description: 'Multi-class programs',
      href: '#',
      onClick: 'courses'
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: Video,
      count: standaloneClasses.length,
      color: 'bg-blue-100 text-blue-700',
      description: 'Individual sessions',
      href: '#',
      onClick: 'classes'
    },
    {
      id: 'playlists',
      label: 'Playlists',
      icon: Heart,
      count: Math.max(1, playlists.length), // Always show at least 1 (includes the system "Liked" playlist)
      color: 'bg-pink-100 text-pink-700',
      description: 'Curated collections',
      href: '#',
      onClick: 'playlists'
    },
    {
      id: 'asanas',
      label: 'Asana Library',
      icon: BookOpen,
      count: 0,
      color: 'bg-purple-100 text-purple-700',
      description: 'Pose database',
      href: '#',
      onClick: 'asanas'
    },
    {
      id: 'breathing',
      label: 'Breathing',
      icon: Wind,
      count: 0,
      color: 'bg-cyan-100 text-cyan-700',
      description: 'Pranayama exercises',
      href: '#',
      onClick: 'breathing'
    },
    {
      id: 'meditations',
      label: 'Meditations',
      icon: Headphones,
      count: 0,
      color: 'bg-green-100 text-green-700',
      description: 'Guided audio',
      href: '#',
      onClick: 'meditations'
    },
    {
      id: 'challenges',
      label: 'Challenges',
      icon: Trophy,
      count: 0,
      color: 'bg-orange-100 text-orange-700',
      description: 'Multi-day programs',
      href: '#',
      onClick: 'challenges'
    },
    {
      id: 'live',
      label: 'Live Classes',
      icon: Radio,
      count: 0,
      color: 'bg-red-100 text-red-700',
      description: 'Streaming sessions',
      href: '#',
      onClick: 'live'
    },
    {
      id: 'quickflows',
      label: 'Quick Flows',
      icon: Zap,
      count: 0,
      color: 'bg-yellow-100 text-yellow-700',
      description: '5-15 min sessions',
      href: '#',
      onClick: 'quickflows'
    },
    {
      id: 'workshops',
      label: 'Workshops',
      icon: Sparkles,
      count: 0,
      color: 'bg-pink-100 text-pink-700',
      description: 'Extended sessions',
      href: '#',
      onClick: 'workshops'
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: FileText,
      count: 0,
      color: 'bg-gray-100 text-gray-700',
      description: 'Blog & education',
      href: '#',
      onClick: 'articles'
    },
    {
      id: 'groups',
      label: 'Student Groups',
      icon: Users,
      count: 0,
      color: 'bg-indigo-100 text-indigo-700',
      description: 'Private communities',
      href: '#',
      onClick: 'groups'
    }
  ];

  const quickStats = [
    {
      label: 'Total Students',
      value: stats.uniqueStudents,
      icon: Users,
      trend: '+12%',
      color: 'text-blue-600'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: TrendingUp,
      trend: '+8%',
      color: 'text-green-600'
    },
    {
      label: 'Practice Minutes',
      value: stats.totalMinutesWatched,
      icon: Clock,
      trend: '+15%',
      color: 'text-purple-600'
    },
    {
      label: 'Avg Rating',
      value: '4.8',
      icon: Star,
      trend: '+0.2',
      color: 'text-yellow-600'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedSection !== 'overview' ? (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedSection('overview')}
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
              ) : (
                <Link href="/more">
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedSection === 'overview' ? 'Teacher Studio' : 
                   contentTypes.find(t => t.onClick === selectedSection)?.label || 'Teacher Studio'}
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedSection === 'overview' ? 'Create & manage your content' :
                   contentTypes.find(t => t.onClick === selectedSection)?.description || 'Manage your content'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {selectedSection === 'playlists' ? (
        <div className="px-4 py-6">
          <MyPlaylists userId={user.id} isTeacher={true} />
        </div>
      ) : selectedSection === 'classes' ? (
        <div className="px-4 py-6">
          <ClassManager userId={user.id} />
        </div>
      ) : selectedSection === 'courses' ? (
        <div className="px-4 py-6">
          <CourseManager />
        </div>
      ) : selectedSection === 'asanas' ? (
        <div className="px-4 py-6">
          <AsanaManager userId={user.id} />
        </div>
      ) : selectedSection === 'breathing' ? (
        <div className="px-4 py-6">
          <BreathingManager userId={user.id} />
        </div>
      ) : selectedSection === 'meditations' ? (
        <div className="px-4 py-6">
          <MeditationManager userId={user.id} />
        </div>
      ) : selectedSection !== 'overview' ? (
        <div className="px-4 py-6">
          <Card className="p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                {contentTypes.find(t => t.onClick === selectedSection)?.icon && (
                  <>{(() => {
                    const Icon = contentTypes.find(t => t.onClick === selectedSection)?.icon;
                    return Icon ? <Icon className="w-8 h-8 text-gray-400" /> : null;
                  })()}</>
                )}
              </div>
              <h3 className="text-lg font-medium">Coming Soon</h3>
              <p className="text-sm text-gray-600">
                {contentTypes.find(t => t.onClick === selectedSection)?.label} management is coming soon. 
                We're working on bringing you the best tools to create and manage your content.
              </p>
              <Button variant="outline" onClick={() => setSelectedSection('overview')}>
                Back to Overview
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <>
      {/* Quick Stats */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="p-4 border-0 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-semibold mt-1">
                    {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Content Types - Horizontal Scroll */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Create & Manage</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {contentTypes.map((type) => (
            <Card
              key={type.id}
              className="flex-shrink-0 w-32 p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                if (type.onClick) {
                  setSelectedSection(type.onClick);
                } else {
                  // Navigate to href if no onClick handler
                  if (type.href && !type.href.startsWith('#')) {
                    window.location.href = type.href;
                  }
                }
              }}
            >
              <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center mb-3`}>
                <type.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">{type.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{type.count} items</p>
              <p className="text-xs text-gray-400 mt-2">{type.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Content */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">Recent Content</h2>
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {[...courses.slice(0, 2), ...standaloneClasses.slice(0, 2)].map((item, index) => {
            // Determine the URL based on whether it's a course or class
            const href = item.classes ? `/course/${item.id}` : `/classes/${item.id}`;
            
            return (
              <Link key={item.id} href={href}>
                <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.classes ? 'Course' : 'Class'}
                        </Badge>
                        {item.isPublished ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">Published</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">Draft</Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 mt-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        {item.classes ? (
                          <>
                            <span>{item.classes.length} classes</span>
                            <span>•</span>
                            <span>{item.classes.reduce((acc: number, c: any) => acc + c.durationMin, 0)} min</span>
                          </>
                        ) : (
                          <>
                            <span>{item.durationMin} min</span>
                            {item.viewCount && (
                              <>
                                <span>•</span>
                                <span>{item.viewCount} views</span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions FAB */}
      <div className="fixed bottom-20 right-4 z-20">
        <Button 
          size="lg" 
          className="rounded-full shadow-lg bg-gray-900 hover:bg-gray-800 h-14 w-14"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
      </>
      )}
    </div>
  );
}