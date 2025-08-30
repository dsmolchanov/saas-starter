'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { 
  Video, 
  Wind, 
  Heart, 
  Zap, 
  Trophy, 
  Plus,
  TrendingUp,
  Eye,
  FileText,
  Upload,
  DollarSign,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Edit,
  MoreVertical,
  BookOpen,
  Target,
  Radio,
  List
} from 'lucide-react';
import { useTranslations } from '@/components/providers/simple-intl-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const contentTypeConfig = {
  course: {
    icon: BookOpen,
    gradient: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    title: 'yourCourses',
    createKey: 'createNewCourse'
  },
  class: {
    icon: Video,
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    title: 'yourClasses',
    createKey: 'createNewClass'
  },
  meditation: {
    icon: Sparkles,
    gradient: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    title: 'yourMeditations',
    createKey: 'createNewMeditation'
  },
  quickFlows: {
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    title: 'yourQuickFlows',
    createKey: 'createNewQuickFlow'
  },
  breathing: {
    icon: Wind,
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    title: 'yourBreathing',
    createKey: 'createNewBreathing'
  },
  asana: {
    icon: Heart,
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    title: 'yourAsanas',
    createKey: 'createNewAsana'
  },
  challenges: {
    icon: Trophy,
    gradient: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    title: 'yourChallenges',
    createKey: 'createNewChallenge'
  },
  workshops: {
    icon: BookOpen,
    gradient: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50 dark:bg-teal-950/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    title: 'yourWorkshops',
    createKey: 'createNewWorkshop'
  },
  programs: {
    icon: Target,
    gradient: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    title: 'yourPrograms',
    createKey: 'createNewProgram'
  },
  playlists: {
    icon: List,
    gradient: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    title: 'yourPlaylists',
    createKey: 'createNewPlaylist'
  }
};

interface ContentItem {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  status: string | null;
  updatedAt: string | Date;
  metadata?: any;
  durationMin?: number | null;
  contentType: string;
}

interface TeacherStudioDashboardProps {
  user: any;
  stats: any;
  contentByType: {
    courses: ContentItem[];
    classes: ContentItem[];
    meditations: ContentItem[];
    quickFlows: ContentItem[];
    breathing: ContentItem[];
    challenges: ContentItem[];
    workshops: ContentItem[];
    programs: ContentItem[];
    asanas: ContentItem[];
  };
}

function ContentScrollSection({ 
  title, 
  items, 
  contentType, 
  onCreateNew,
  onBrowseAll,
  onItemClick 
}: {
  title: string;
  items: ContentItem[];
  contentType: string;
  onCreateNew: () => void;
  onBrowseAll: () => void;
  onItemClick: (item: ContentItem) => void;
}) {
  const t = useTranslations('teacher');
  const config = contentTypeConfig[contentType as keyof typeof contentTypeConfig];
  const Icon = config?.icon || FileText;
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setScrollPosition(element.scrollLeft);
    setShowLeftArrow(element.scrollLeft > 0);
    setShowRightArrow(element.scrollLeft < element.scrollWidth - element.clientWidth - 10);
  };

  const scrollLeft = () => {
    const element = document.getElementById(`scroll-${contentType}`);
    if (element) {
      element.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const element = document.getElementById(`scroll-${contentType}`);
    if (element) {
      element.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t(config?.title || title)}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateNew}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t(config?.createKey || 'create')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBrowseAll}
            className="gap-2"
          >
            {t('browseAll')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && items.length > 4 && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          id={`scroll-${contentType}`}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.length > 0 ? (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-72"
              >
                <Card
                  className={cn(
                    "h-full cursor-pointer transition-all hover:shadow-lg",
                    "hover:-translate-y-1",
                    config?.borderColor
                  )}
                  onClick={() => onItemClick(item)}
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={cn("w-full h-full flex items-center justify-center", config?.bgColor)}>
                        <Icon className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    {item.status && (
                      <Badge
                        variant={item.status === 'published' ? 'default' : 'secondary'}
                        className="absolute top-2 right-2"
                      >
                        {item.status}
                      </Badge>
                    )}

                    {/* Duration */}
                    {item.durationMin && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                        {item.durationMin} min
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-medium mb-2 line-clamp-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {item.metadata?.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.metadata.views}
                          </div>
                        )}
                        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="flex-shrink-0 w-72">
              <Card className={cn("h-64 flex flex-col items-center justify-center", config?.borderColor)}>
                <Icon className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No {title.toLowerCase()} yet</p>
                <Button onClick={onCreateNew} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t(config?.createKey || 'create')}
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeacherStudioDashboard({
  user,
  stats,
  contentByType
}: TeacherStudioDashboardProps) {
  const t = useTranslations('teacher');
  const router = useRouter();

  const handleCreateContent = (type: string) => {
    router.push(`/teacher-studio/create/${type}`);
  };

  const handleBrowseAll = (type: string) => {
    router.push(`/teacher-studio/manage/${type}`);
  };

  const handleItemClick = (item: ContentItem) => {
    router.push(`/teacher-studio/edit/${item.contentType}/${item.id}`);
  };

  const statsCards = [
    {
      title: 'Total Content',
      value: stats?.totalContent || 0,
      icon: FileText,
      trend: '+12%',
      color: 'text-blue-600'
    },
    {
      title: 'Published',
      value: stats?.publishedContent || 0,
      icon: Upload,
      trend: '+8%',
      color: 'text-green-600'
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      trend: '+24%',
      color: 'text-purple-600'
    },
    {
      title: 'This Month',
      value: '$1,234',
      icon: DollarSign,
      trend: '+18%',
      color: 'text-yellow-600'
    }
  ];

  // Add empty arrays as fallback for missing content types
  const safeContentByType = {
    courses: contentByType?.courses || [],
    classes: contentByType?.classes || [],
    meditations: contentByType?.meditations || [],
    quickFlows: contentByType?.quickFlows || [],
    breathing: contentByType?.breathing || [],
    challenges: contentByType?.challenges || [],
    workshops: contentByType?.workshops || [],
    programs: contentByType?.programs || [],
    asanas: contentByType?.asanas || [],
    playlists: []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{t('teacherStudio')}</h1>
                <p className="text-muted-foreground">Welcome back, {user.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">{stat.trend}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-800 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Content Sections - Netflix Style */}
        <div className="space-y-8">
          <ContentScrollSection
            title="Courses"
            items={safeContentByType.courses}
            contentType="course"
            onCreateNew={() => handleCreateContent('course')}
            onBrowseAll={() => handleBrowseAll('courses')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Classes"
            items={safeContentByType.classes}
            contentType="class"
            onCreateNew={() => handleCreateContent('class')}
            onBrowseAll={() => handleBrowseAll('classes')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Meditations"
            items={safeContentByType.meditations}
            contentType="meditation"
            onCreateNew={() => handleCreateContent('meditation')}
            onBrowseAll={() => handleBrowseAll('meditations')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Quick Flows"
            items={safeContentByType.quickFlows}
            contentType="quickFlows"
            onCreateNew={() => handleCreateContent('quick_flow')}
            onBrowseAll={() => handleBrowseAll('quick-flows')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Breathing Exercises"
            items={safeContentByType.breathing}
            contentType="breathing"
            onCreateNew={() => handleCreateContent('breathing')}
            onBrowseAll={() => handleBrowseAll('breathing')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Asana Library"
            items={safeContentByType.asanas}
            contentType="asana"
            onCreateNew={() => handleCreateContent('asana')}
            onBrowseAll={() => handleBrowseAll('asanas')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Challenges"
            items={safeContentByType.challenges}
            contentType="challenges"
            onCreateNew={() => handleCreateContent('challenge')}
            onBrowseAll={() => handleBrowseAll('challenges')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Workshops"
            items={safeContentByType.workshops}
            contentType="workshops"
            onCreateNew={() => handleCreateContent('workshop')}
            onBrowseAll={() => handleBrowseAll('workshops')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Programs"
            items={safeContentByType.programs}
            contentType="programs"
            onCreateNew={() => handleCreateContent('program')}
            onBrowseAll={() => handleBrowseAll('programs')}
            onItemClick={handleItemClick}
          />

          <ContentScrollSection
            title="Playlists"
            items={safeContentByType.playlists}
            contentType="playlists"
            onCreateNew={() => handleCreateContent('playlist')}
            onBrowseAll={() => handleBrowseAll('playlists')}
            onItemClick={handleItemClick}
          />
        </div>
      </div>
    </div>
  );
}