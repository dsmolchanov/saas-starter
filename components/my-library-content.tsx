'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Clock,
  Play,
  Bookmark,
  MoreVertical,
  ChevronDown,
  ArrowUpDown,
  Grid3x3,
  List,
  Download,
  Heart,
  Share2,
  Edit,
  Trash2,
  Music,
  Film,
  BookOpen,
  History,
  FolderPlus,
  PlayCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface ClassItem {
  id: string;
  title: string;
  durationMin: number;
  thumbnailUrl?: string | null;
  teacherId: string;
  style?: string | null;
}

interface HistoryItem {
  progressId: string;
  completedAt: Date;
  class: ClassItem;
  course?: {
    id: string;
    title: string;
  };
}

interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  isPublic: number;
  coverUrl?: string | null;
  items: any[];
  updatedAt: Date;
}

interface CourseProgress {
  course: any;
  progress: number;
  totalClasses: number;
}

interface Stats {
  totalMinutes: number;
  totalSessions: number;
  uniqueTeachers: number;
}

interface MyLibraryContentProps {
  user: User;
  history: HistoryItem[];
  playlists: Playlist[];
  savedItems: any[];
  enrolledCourses: CourseProgress[];
  stats: Stats;
  recentClasses: any[];
}

export function MyLibraryContent({
  user,
  history,
  playlists,
  savedItems,
  enrolledCourses,
  stats,
  recentClasses,
}: MyLibraryContentProps) {
  const [activeTab, setActiveTab] = useState<'playlists' | 'courses' | 'saved'>('playlists');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'duration'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showHistory, setShowHistory] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Default saved sessions playlist
  const defaultSavedPlaylist = {
    id: 'saved',
    name: 'My Saved Sessions',
    description: 'Your Playlist',
    coverUrl: null,
    itemCount: savedItems.length,
    isSystem: true,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={() => setShowHistory(!showHistory)}
            >
              History
              <Clock className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Tab Pills */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'playlists' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full px-6 ${
                activeTab === 'playlists' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 border-0'
              }`}
              onClick={() => setActiveTab('playlists')}
            >
              Playlists
            </Button>
            <Button
              variant={activeTab === 'courses' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full px-6 ${
                activeTab === 'courses' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 border-0'
              }`}
              onClick={() => setActiveTab('courses')}
            >
              Courses
            </Button>
            <Button
              variant={activeTab === 'saved' ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full px-6 ${
                activeTab === 'saved' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 border-0'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* History Panel (slides from right) */}
        {showHistory && (
          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Practice History</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {history.map((item) => (
                <Link key={item.progressId} href={`/lesson/${item.class.id}`}>
                  <Card className="p-3 hover:bg-gray-50 transition-colors border-0 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.class.thumbnailUrl ? (
                          <img 
                            src={item.class.thumbnailUrl} 
                            alt={item.class.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <PlayCircle className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {item.class.title}
                        </p>
                        {item.course && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.course.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(item.completedAt)} • {formatDuration(item.class.durationMin)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowUpDown className="w-4 h-4" />
            <span>Recents</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'playlists' && (
          <div className="space-y-4">
            {/* Create Playlist Button */}
            <Button
              variant="outline"
              className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create a Playlist
            </Button>

            {/* Saved Sessions (Default Playlist) */}
            <Card className="p-4 hover:bg-gray-50 transition-colors border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Bookmark className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {defaultSavedPlaylist.name}
                  </h3>
                  <p className="text-sm text-gray-500">Your Playlist</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{defaultSavedPlaylist.itemCount} sessions</span>
                    <span>•</span>
                    <button className="hover:text-gray-900">
                      <Play className="w-4 h-4 inline mr-1" />
                      Play
                    </button>
                    <span>•</span>
                    <button className="hover:text-gray-900">
                      <Download className="w-4 h-4 inline mr-1" />
                      Download
                    </button>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>

            {/* User Playlists */}
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="p-4 hover:bg-gray-50 transition-colors border-0 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    {playlist.coverUrl ? (
                      <img 
                        src={playlist.coverUrl} 
                        alt={playlist.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Music className="w-8 h-8 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {playlist.description || 'Your Playlist'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{playlist.items.length} sessions</span>
                      {playlist.isPublic === 0 && (
                        <>
                          <span>•</span>
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            {enrolledCourses.length === 0 ? (
              <Card className="p-8 text-center border-0 shadow-sm">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Courses Yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start a course to track your progress
                </p>
                <Link href="/courses">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Browse Courses
                  </Button>
                </Link>
              </Card>
            ) : (
              enrolledCourses.map((item) => (
                <Card key={item.course.id} className="p-4 hover:bg-gray-50 transition-colors border-0 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      {item.course.imageUrl ? (
                        <img 
                          src={item.course.imageUrl} 
                          alt={item.course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {item.course.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.course.description || 'Course'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                            style={{ width: `${(item.progress / item.totalClasses) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {item.progress} / {item.totalClasses}
                        </span>
                      </div>
                    </div>
                    <Link href={`/course/${item.course.id}`}>
                      <Button variant="ghost" size="sm">
                        Continue
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedItems.length === 0 ? (
              <Card className="p-8 text-center border-0 shadow-sm">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Saved Classes</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Save classes to practice them later
                </p>
                <Link href="/browse">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Browse Classes
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {savedItems.map((item) => (
                  <Card key={item.id} className="p-4 hover:bg-gray-50 transition-colors border-0 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-8 h-8 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          Saved Class
                        </h3>
                        <p className="text-sm text-gray-500">
                          Added {formatDate(new Date(item.addedAt))}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Your Practice Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center border-0 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(stats.totalMinutes / 60)}h
              </p>
              <p className="text-xs text-gray-500">Total Practice</p>
            </Card>
            <Card className="p-4 text-center border-0 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSessions}
              </p>
              <p className="text-xs text-gray-500">Sessions</p>
            </Card>
            <Card className="p-4 text-center border-0 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">
                {stats.uniqueTeachers}
              </p>
              <p className="text-xs text-gray-500">Teachers</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}