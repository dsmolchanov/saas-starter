'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  MoreVertical,
  Play,
  Clock,
  Globe,
  Lock,
  Link as LinkIcon,
  Share2,
  Heart,
  Edit,
  Trash2,
  Plus,
  User,
} from 'lucide-react';

interface PlaylistItem {
  id: string;
  type: 'class' | 'meditation';
  title: string;
  description?: string | null;
  duration?: number | null;
  thumbnailUrl?: string | null;
  teacherId?: string | null;
}

interface PlaylistViewProps {
  playlist: any;
  items: PlaylistItem[];
  isOwner: boolean;
  currentUser: any;
}

export default function PlaylistView({
  playlist,
  items,
  isOwner,
  currentUser,
}: PlaylistViewProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);

  const totalDuration = items.reduce((acc, item) => acc + (item.duration || 0), 0);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility || 'private') {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'unlisted':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Playlist link copied to clipboard!');
    } catch {
      alert(`Share link: ${url}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/more');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const visibility = playlist.visibility || (playlist.isPublic ? 'public' : 'private');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{playlist.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getVisibilityIcon(visibility)}
                    <span className="ml-1 capitalize">{visibility}</span>
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {items.length} items • {formatDuration(totalDuration)}
                  </span>
                </div>
              </div>
            </div>
            
            {isOwner ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/playlists/${playlist.id}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {currentUser && (
                  <Button 
                    variant={following ? "secondary" : "default"} 
                    size="sm"
                    onClick={() => setFollowing(!following)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${following ? 'fill-current' : ''}`} />
                    {following ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Description */}
        {playlist.description && (
          <Card className="p-4 mb-6">
            <p className="text-gray-600">{playlist.description}</p>
            {playlist.tags && playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {playlist.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No items yet</h3>
              <p className="text-sm text-gray-600">
                {isOwner 
                  ? "Add classes or meditations to your playlist to get started"
                  : "This playlist doesn't have any content yet"}
              </p>
              {isOwner && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link 
                  href={item.type === 'class' ? `/classes/${item.id}` : `/meditations/${item.id}`}
                  className="flex gap-4 p-4"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {item.thumbnailUrl ? (
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded flex items-center justify-center">
                        <Play className="w-6 h-6 text-purple-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'class' ? 'Class' : 'Meditation'}
                          </Badge>
                        </div>
                        <h3 className="font-medium mt-1 line-clamp-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {item.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="ml-2"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove from playlist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Play All Button */}
        {items.length > 0 && (
          <div className="fixed bottom-20 right-4 z-20">
            <Button 
              size="lg" 
              className="rounded-full shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Play All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}