'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, Headphones, Image, Clock, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MeditationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingMeditation?: any;
}

export function MeditationForm({ open, onOpenChange, onSuccess, editingMeditation }: MeditationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: editingMeditation?.title || '',
    description: editingMeditation?.description || '',
    type: editingMeditation?.type || 'guided',
    focus: editingMeditation?.focus || 'mindfulness',
    durationMin: editingMeditation?.durationMin || 10,
    audioUrl: editingMeditation?.audioUrl || '',
    thumbnailUrl: editingMeditation?.thumbnailUrl || '',
  });

  const meditationTypes = [
    { value: 'guided', label: 'Guided Meditation', description: 'Voice-guided journey' },
    { value: 'unguided', label: 'Unguided', description: 'Music or silence only' },
    { value: 'body_scan', label: 'Body Scan', description: 'Progressive relaxation' },
    { value: 'visualization', label: 'Visualization', description: 'Mental imagery' },
    { value: 'mantra', label: 'Mantra', description: 'Repetitive sounds/phrases' },
    { value: 'movement', label: 'Movement', description: 'Walking or active meditation' },
  ];

  const focusAreas = [
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'stress_relief', label: 'Stress Relief', icon: '😌' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'anxiety', label: 'Anxiety', icon: '💭' },
    { value: 'focus', label: 'Focus', icon: '🎯' },
    { value: 'gratitude', label: 'Gratitude', icon: '🙏' },
    { value: 'loving_kindness', label: 'Loving Kindness', icon: '❤️' },
    { value: 'energy', label: 'Energy', icon: '⚡' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' },
    { value: 'healing', label: 'Healing', icon: '✨' },
  ];

  const durationOptions = [
    { value: 3, label: '3 minutes', description: 'Quick reset' },
    { value: 5, label: '5 minutes', description: 'Short break' },
    { value: 10, label: '10 minutes', description: 'Daily practice' },
    { value: 15, label: '15 minutes', description: 'Extended session' },
    { value: 20, label: '20 minutes', description: 'Deep practice' },
    { value: 30, label: '30 minutes', description: 'Immersive journey' },
    { value: 45, label: '45 minutes', description: 'Advanced practice' },
    { value: 60, label: '60 minutes', description: 'Full experience' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = editingMeditation 
        ? `/api/content/meditations/${editingMeditation.id}`
        : '/api/content/meditations';
      
      const method = editingMeditation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess?.();
        onOpenChange(false);
        // Reset form if creating new
        if (!editingMeditation) {
          setFormData({
            title: '',
            description: '',
            type: 'guided',
            focus: 'mindfulness',
            durationMin: 10,
            audioUrl: '',
            thumbnailUrl: '',
          });
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save meditation');
      }
    } catch (error) {
      console.error('Error saving meditation:', error);
      alert('Failed to save meditation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMeditation ? 'Edit Meditation' : 'Create New Meditation'}
          </DialogTitle>
          <DialogDescription>
            Upload a guided meditation session for your students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title and Description */}
          <div>
            <Label htmlFor="title">Meditation Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Morning Mindfulness Journey"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the journey and benefits of this meditation..."
              rows={3}
            />
          </div>

          {/* Meditation Type */}
          <div>
            <Label>Meditation Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {meditationTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`p-3 cursor-pointer transition-colors ${
                    formData.type === type.value ? 'border-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                >
                  <h4 className="font-medium text-sm">{type.label}</h4>
                  <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Focus Area */}
          <div>
            <Label>Focus Area</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
              {focusAreas.map((area) => (
                <Card
                  key={area.value}
                  className={`p-2 cursor-pointer transition-colors text-center ${
                    formData.focus === area.value ? 'border-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, focus: area.value })}
                >
                  <div className="text-2xl mb-1">{area.icon}</div>
                  <p className="text-xs font-medium">{area.label}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label>Duration</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {durationOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`p-2 cursor-pointer transition-colors text-center ${
                    formData.durationMin === option.value ? 'border-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, durationMin: option.value })}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-gray-600">{option.description}</p>
                </Card>
              ))}
            </div>
            <div className="mt-2">
              <Label htmlFor="custom-duration" className="text-xs">Or custom duration (minutes)</Label>
              <Input
                id="custom-duration"
                type="number"
                min="1"
                max="120"
                value={formData.durationMin}
                onChange={(e) => setFormData({ ...formData, durationMin: parseInt(e.target.value) || 10 })}
                className="w-32"
              />
            </div>
          </div>

          {/* Audio Upload */}
          <div>
            <Label>Audio File *</Label>
            <Card className="border-2 border-dashed p-6">
              <div className="text-center">
                <Headphones className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium mb-1">Upload Meditation Audio</p>
                <p className="text-xs text-gray-600 mb-3">
                  MP3, M4A, or WAV (max 100MB)
                </p>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                {formData.audioUrl && (
                  <div className="mt-3 p-2 bg-green-50 rounded">
                    <p className="text-xs text-green-700">Audio file uploaded</p>
                  </div>
                )}
              </div>
            </Card>
            <p className="text-xs text-gray-500 mt-2">
              Note: Audio upload functionality will be integrated with your storage provider
            </p>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label>Thumbnail Image (Optional)</Label>
            <Card className="border-2 border-dashed p-4">
              <div className="text-center">
                <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-600 mb-2">
                  Upload cover image for this meditation
                </p>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
                {formData.thumbnailUrl && (
                  <div className="mt-2 p-1 bg-green-50 rounded">
                    <p className="text-xs text-green-700">Thumbnail uploaded</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Preview Card */}
          <div>
            <Label>Preview</Label>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {formData.title || 'Meditation Title'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.description || 'Description will appear here...'}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formData.durationMin} min
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {focusAreas.find(a => a.value === formData.focus)?.label || 'Focus'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {meditationTypes.find(t => t.value === formData.type)?.label || 'Type'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.title || !formData.audioUrl}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingMeditation ? 'Update' : 'Create'} Meditation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}