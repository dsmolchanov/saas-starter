'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Wind, Timer, Heart, Brain, Zap, Moon, AlertCircle, Edit, Trash2, Repeat, PlayCircle } from 'lucide-react';
import { BreathingForm } from './BreathingForm';

interface BreathingManagerProps {
  userId: string;
}

export function BreathingManager({ userId }: BreathingManagerProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  const patterns = [
    { name: 'Box Breathing', value: 'box', icon: '□', description: '4-4-4-4 pattern' },
    { name: '4-7-8 Breathing', value: '478', icon: '◇', description: 'Relaxation technique' },
    { name: 'Wim Hof', value: 'wimhof', icon: '○', description: 'Power breathing' },
    { name: 'Pranayama', value: 'pranayama', icon: '◈', description: 'Yogic breathing' },
    { name: 'Custom', value: 'custom', icon: '⊕', description: 'Custom pattern' },
  ];

  useEffect(() => {
    fetchExercises();
  }, [selectedPattern, searchQuery]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        teacherId: userId,
      });
      
      if (selectedPattern !== 'all') {
        params.append('pattern', selectedPattern);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/content/breathing?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Error fetching breathing exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this breathing exercise?')) return;
    
    try {
      const response = await fetch(`/api/content/breathing/${exerciseId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchExercises();
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleEdit = (exercise: any) => {
    setEditingExercise(exercise);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchExercises();
    setEditingExercise(null);
  };

  const formatPattern = (exercise: any) => {
    if (!exercise) return '';
    return `${exercise.inhaleCount || 0}-${exercise.holdInCount || 0}-${exercise.exhaleCount || 0}-${exercise.holdOutCount || 0}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Breathing Exercises</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create guided pranayama and breathwork sessions
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search breathing exercises..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Badge 
          variant={selectedPattern === 'all' ? 'secondary' : 'outline'}
          className="cursor-pointer px-3 py-1"
          onClick={() => setSelectedPattern('all')}
        >
          All Exercises ({exercises.length})
        </Badge>
        {patterns.map((pattern) => (
          <Badge 
            key={pattern.value} 
            variant={selectedPattern === pattern.value ? 'secondary' : 'outline'}
            className="cursor-pointer px-3 py-1"
            onClick={() => setSelectedPattern(pattern.value)}
          >
            <span className="mr-1 text-lg">{pattern.icon}</span>
            {pattern.name}
          </Badge>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{exercise.title}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {exercise.patternType?.replace('_', ' ')} Pattern
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(exercise)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exercise.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Pattern Display */}
              <Card className="p-3 bg-purple-50 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 mb-1">
                    {formatPattern(exercise)}
                  </div>
                  <div className="text-xs text-purple-600">
                    Inhale • Hold • Exhale • Hold
                  </div>
                </div>
              </Card>
              
              <div className="space-y-2">
                {exercise.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{exercise.description}</p>
                )}
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {exercise.totalDurationMin || exercise.durationMin || 5} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat className="w-3 h-3" />
                    {exercise.rounds || 5} rounds
                  </div>
                  {exercise.difficulty && (
                    <Badge variant="secondary" className="text-xs">
                      {exercise.difficulty}
                    </Badge>
                  )}
                </div>
                
                {exercise.benefits && exercise.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {exercise.benefits.slice(0, 2).map((benefit: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                    {exercise.benefits.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{exercise.benefits.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
                
                {exercise.status === 'draft' && (
                  <Badge variant="destructive" className="text-xs">Draft</Badge>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Exercise
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
            <Wind className="w-8 h-8 text-cyan-600" />
          </div>
          <h3 className="text-lg font-medium">Create Breathing Exercises</h3>
          <p className="text-sm text-gray-600">
            Design pranayama practices with visual patterns, audio guidance, 
            and customizable breath counts for different experience levels.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Features Coming Soon:</p>
                <ul className="mt-2 space-y-1 text-blue-600">
                  <li>• Visual breath pattern animator</li>
                  <li>• Audio recording for guidance</li>
                  <li>• Custom count patterns</li>
                  <li>• Health benefits tracking</li>
                  <li>• Multi-language support</li>
                </ul>
              </div>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Exercise
          </Button>
        </div>
      </Card>
      )}

      {/* Breathing Form Dialog */}
      <BreathingForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingExercise(null);
        }}
        onSuccess={handleFormSuccess}
        editingExercise={editingExercise}
      />
    </div>
  );
}