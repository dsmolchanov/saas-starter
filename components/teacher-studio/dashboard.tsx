'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { 
  Video, 
  Mic, 
  Wind, 
  Heart, 
  Zap, 
  Trophy, 
  Calendar,
  Radio,
  BookOpen,
  Target,
  Plus,
  TrendingUp,
  Eye,
  FileText,
  Upload,
  BarChart3,
  Clock,
  Users,
  Star,
  DollarSign,
  Sparkles,
  ChevronRight,
  Play,
  Edit,
  MoreVertical
} from 'lucide-react';
// import { useTranslations } from '@/components/providers/simple-intl-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const contentTypeConfig = {
  class: {
    icon: Video,
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    title: 'Yoga Class',
    description: 'Full-length yoga sessions with video',
    features: ['Video upload', 'Pose sequences', 'Music playlists', 'Props list']
  },
  breathing: {
    icon: Wind,
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    title: 'Breathing Exercise',
    description: 'Pranayama and breathwork practices',
    features: ['Pattern creator', 'Audio guidance', 'Visual timer', 'Health benefits']
  },
  asana: {
    icon: Heart,
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    title: 'Asana Library',
    description: 'Individual pose breakdowns',
    features: ['Multiple angles', 'Alignment cues', 'Variations', 'Contraindications']
  },
  quick_flow: {
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    title: 'Quick Flow',
    description: '5-15 minute targeted sequences',
    features: ['Time-based', 'Target areas', 'No equipment', 'Office-friendly']
  },
  challenge: {
    icon: Trophy,
    gradient: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    title: 'Challenge',
    description: 'Multi-day transformation programs',
    features: ['Day planner', 'Progress tracking', 'Badges', 'Community']
  },
  meditation: {
    icon: Sparkles,
    gradient: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    title: 'Meditation',
    description: 'Guided meditation sessions',
    features: ['Audio recording', 'Background music', 'Themes', 'Duration options']
  },
  live_class: {
    icon: Radio,
    gradient: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    title: 'Live Class',
    description: 'Interactive streaming sessions',
    features: ['Schedule setup', 'LiveKit integration', 'Registration', 'Recording option']
  },
  workshop: {
    icon: BookOpen,
    gradient: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50 dark:bg-teal-950/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    title: 'Workshop',
    description: 'In-depth learning experiences',
    features: ['Multi-segment', 'Materials', 'Certificates', 'Q&A sessions']
  },
  program: {
    icon: Target,
    gradient: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    title: 'Program',
    description: 'Structured learning journeys',
    features: ['Weekly modules', 'Assessments', 'Prerequisites', 'Completion tracking']
  }
};

interface TeacherStudioDashboardProps {
  user: any;
  stats: any;
  recentContent: any[];
  contentTypes: any[];
}

export function TeacherStudioDashboard({
  user,
  stats,
  recentContent,
  contentTypes
}: TeacherStudioDashboardProps) {
  // const t = useTranslations('teacherStudio');
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleCreateContent = (type: string) => {
    router.push(`/teacher-studio/create/${type}`);
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
                <h1 className="text-2xl font-bold">Teacher Studio</h1>
                <p className="text-muted-foreground">Welcome back, {user.name}</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              onClick={() => setSelectedType('new')}
            >
              <Plus className="h-5 w-5" />
              Create Content
            </Button>
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

        {/* Content Type Selector */}
        {selectedType === 'new' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Choose Content Type</h2>
                <p className="text-muted-foreground">Select the type of content you want to create</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(contentTypeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCreateContent(key)}
                      className={`relative p-6 rounded-xl border-2 ${config.borderColor} ${config.bgColor} hover:shadow-lg transition-all text-left group overflow-hidden`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      
                      <div className="relative z-10">
                        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${config.gradient} text-white mb-4`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2">{config.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {config.description}
                        </p>
                        
                        <div className="space-y-1">
                          {config.features.slice(0, 2).map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-1 h-1 rounded-full bg-current" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        
                        <ChevronRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="ghost" onClick={() => setSelectedType(null)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Content</h2>
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentContent.length > 0 ? (
                  recentContent.map((content) => {
                    const config = contentTypeConfig[content.contentType as keyof typeof contentTypeConfig];
                    const Icon = config?.icon || FileText;
                    
                    return (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className={`p-2 rounded-lg ${config?.bgColor || 'bg-gray-100'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium">{content.title}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                              {content.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(content.updatedAt).toLocaleDateString()}
                            </span>
                            {content.metadata?.views && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {content.metadata.views}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Analytics</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem>Archive</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No content yet. Create your first piece!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          {/* Analytics Overview */}
          <div className="space-y-4">
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold mb-4">Performance This Week</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Views</span>
                    <span className="text-sm font-medium">1,234</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Completions</span>
                    <span className="text-sm font-medium">89%</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Engagement</span>
                    <span className="text-sm font-medium">4.8/5.0</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                View Full Analytics
              </Button>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
              <h3 className="font-semibold mb-2">Pro Tip</h3>
              <p className="text-sm opacity-90 mb-4">
                Classes published on Monday mornings get 40% more views. Schedule your next release accordingly!
              </p>
              <Button variant="secondary" size="sm">
                Learn More
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}