'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus,
  MoreVertical,
  Globe,
  Lock,
  Link as LinkIcon,
  Edit,
  Trash2,
  Users,
  Play,
  Clock,
  Eye,
  Heart,
  Share2,
  Copy,
  ChevronRight,
  Star
} from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  visibility: 'private' | 'public' | 'unlisted';
  coverUrl?: string;
  totalItems: number;
  totalDurationMin: number;
  viewCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  teacherId?: string;
  tags?: string[];
  isOwner: boolean;
  followersCount?: number;
  playlistType?: string;
  isSystem?: number;
}

interface MyPlaylistsProps {
  userId: string;
  isTeacher?: boolean;
}

export function MyPlaylists({ userId, isTeacher }: MyPlaylistsProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'private' | 'public' | 'unlisted',
    tags: '',
  });

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const method = editingPlaylist ? 'PUT' : 'POST';
      const url = editingPlaylist 
        ? `/api/playlists/${editingPlaylist.id}` 
        : '/api/playlists';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        await fetchPlaylists();
        setCreateDialogOpen(false);
        setEditingPlaylist(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  };

  const handleDelete = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPlaylists();
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const handleShare = async (playlist: Playlist) => {
    const url = `${window.location.origin}/playlists/${playlist.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Playlist link copied to clipboard!');
    } catch {
      alert(`Share link: ${url}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      visibility: 'private',
      tags: '',
    });
  };

  const openEditDialog = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
      visibility: playlist.visibility,
      tags: playlist.tags?.join(', ') || '',
    });
    setCreateDialogOpen(true);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'unlisted':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'text-green-600';
      case 'unlisted':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">My Playlists</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage your practice collections
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPlaylist(null);
              resetForm();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
              </DialogTitle>
              <DialogDescription>
                {editingPlaylist 
                  ? 'Update your playlist details' 
                  : 'Create a collection of your favorite classes and meditations'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Morning Flow"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="My favorite morning yoga routines"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value: 'private' | 'public' | 'unlisted') => 
                    setFormData({ ...formData, visibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private - Only you can see
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Unlisted - Anyone with link
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Public - Discoverable by all
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="morning, energizing, vinyasa"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateDialogOpen(false);
                setEditingPlaylist(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrUpdate}>
                {editingPlaylist ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liked Playlist - Always show at the top */}
      {(() => {
        const likedPlaylist = playlists.find(p => p.playlistType === 'liked');
        if (likedPlaylist) {
          return (
            <Card 
              className="mb-6 overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 text-white cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => window.location.href = `/playlists/${likedPlaylist.id}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                        <Heart className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Liked</h2>
                        <p className="text-white/80 text-sm">Your favorite classes and meditations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-white/90">
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        {likedPlaylist.totalItems} items
                      </div>
                      {likedPlaylist.totalDurationMin > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(likedPlaylist.totalDurationMin)}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/60" />
                </div>
              </div>
            </Card>
          );
        }
        return null;
      })()}

      {/* Other Playlists Grid */}
      {playlists.filter(p => p.playlistType !== 'liked').length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">No playlists yet</h3>
            <p className="text-sm text-gray-600">
              Create your first playlist to organize your favorite classes and meditations
            </p>
            <Button onClick={() => {
              setEditingPlaylist(null);
              resetForm();
              setCreateDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Playlist
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.filter(p => p.playlistType !== 'liked').map((playlist) => (
            <Card 
              key={playlist.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Cover Image */}
              {playlist.coverUrl && (
                <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500">
                  <img 
                    src={playlist.coverUrl} 
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-1">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                  
                  {playlist.isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(playlist)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(playlist)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(playlist.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Visibility Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getVisibilityColor(playlist.visibility)}>
                    {getVisibilityIcon(playlist.visibility)}
                    <span className="ml-1 capitalize">{playlist.visibility}</span>
                  </Badge>
                  {playlist.featured && (
                    <Badge variant="default">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {playlist.totalItems} items
                  </div>
                  {playlist.totalDurationMin > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(playlist.totalDurationMin)}
                    </div>
                  )}
                  {playlist.visibility === 'public' && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {playlist.viewCount}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {playlist.tags && playlist.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {playlist.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {playlist.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{playlist.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  asChild
                >
                  <a href={`/playlists/${playlist.id}`}>
                    Open Playlist
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}