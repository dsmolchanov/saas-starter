'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Headphones, Mic, Music, Brain, AlertCircle, Clock, Edit, Trash2, PlayCircle, Heart, Moon, Sparkles } from 'lucide-react';
import { MeditationForm } from './MeditationForm';

interface MeditationManagerProps {
  userId: string;
}

export function MeditationManager({ userId }: MeditationManagerProps) {
  const [meditations, setMeditations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingMeditation, setEditingMeditation] = useState<any>(null);

  const focusAreas = [
    { value: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'bg-purple-100 text-purple-700' },
    { value: 'stress_relief', label: 'Stress Relief', icon: Heart, color: 'bg-pink-100 text-pink-700' },
    { value: 'sleep', label: 'Sleep', icon: Moon, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'anxiety', label: 'Anxiety', icon: Brain, color: 'bg-blue-100 text-blue-700' },
    { value: 'focus', label: 'Focus', icon: Sparkles, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'gratitude', label: 'Gratitude', icon: Heart, color: 'bg-green-100 text-green-700' },
  ];

  useEffect(() => {
    fetchMeditations();
  }, [selectedFocus, searchQuery]);

  const fetchMeditations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        teacherId: userId,
      });
      
      if (selectedFocus !== 'all') {
        params.append('focus', selectedFocus);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/content/meditations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMeditations(data.meditations || []);
      }
    } catch (error) {
      console.error('Error fetching meditations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meditationId: string) => {
    if (!confirm('Are you sure you want to delete this meditation?')) return;
    
    try {
      const response = await fetch(`/api/content/meditations/${meditationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchMeditations();
      }
    } catch (error) {
      console.error('Error deleting meditation:', error);
    }
  };

  const handleEdit = (meditation: any) => {
    setEditingMeditation(meditation);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchMeditations();
    setEditingMeditation(null);
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'guided': 'Guided',
      'unguided': 'Unguided',
      'body_scan': 'Body Scan',
      'visualization': 'Visualization',
      'mantra': 'Mantra',
      'movement': 'Movement',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Meditations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create guided meditations and mindfulness sessions
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Meditation
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search meditations..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Focus Areas */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Badge 
          variant={selectedFocus === 'all' ? 'secondary' : 'outline'}
          className="cursor-pointer px-3 py-1"
          onClick={() => setSelectedFocus('all')}
        >
          All Meditations ({meditations.length})
        </Badge>
        {focusAreas.map((area) => {
          const Icon = area.icon;
          return (
            <Badge 
              key={area.value} 
              variant={selectedFocus === area.value ? 'secondary' : 'outline'}
              className={`cursor-pointer px-3 py-1 ${selectedFocus === area.value ? area.color : ''}`}
              onClick={() => setSelectedFocus(area.value)}
            >
              <Icon className="w-3 h-3 mr-1" />
              {area.label}
            </Badge>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : meditations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meditations.map((meditation) => (
            <Card key={meditation.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail or gradient */}
              <div className="h-32 bg-gradient-to-br from-purple-400 to-blue-400 relative">
                {meditation.thumbnailUrl ? (
                  <img 
                    src={meditation.thumbnailUrl} 
                    alt={meditation.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Headphones className="w-12 h-12 text-white/80" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(meditation)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(meditation.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold">{meditation.title}</h3>
                  {meditation.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {meditation.description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {meditation.durationMin} min
                  </Badge>
                  {meditation.type && (
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(meditation.type)}
                    </Badge>
                  )}
                  {meditation.focus && (
                    <Badge variant="outline" className="text-xs">
                      {meditation.focus.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Play Meditation
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Headphones className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium">Start Creating Meditations</h3>
          <p className="text-sm text-gray-600">
            Record guided meditations, add background music, and create 
            transcripts for accessibility. Perfect for sleep, anxiety, 
            focus, and mindfulness practices.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-900">Meditation Features:</p>
                <ul className="mt-2 space-y-1 text-purple-600">
                  <li>• Audio recording & editing</li>
                  <li>• Background music mixer</li>
                  <li>• Auto-generated transcripts</li>
                  <li>• Sleep timer support</li>
                  <li>• Multi-language options</li>
                </ul>
              </div>
            </div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Your First Meditation
          </Button>
        </div>
      </Card>
      )}

      {/* Meditation Form Dialog */}
      <MeditationForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMeditation(null);
        }}
        onSuccess={handleFormSuccess}
        editingMeditation={editingMeditation}
      />
    </div>
  );
}