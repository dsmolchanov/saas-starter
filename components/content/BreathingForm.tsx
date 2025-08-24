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
import { Plus, X, Upload, Loader2, Wind, Timer, Repeat, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BreathingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingExercise?: any;
}

export function BreathingForm({ open, onOpenChange, onSuccess, editingExercise }: BreathingFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: editingExercise?.title || '',
    description: editingExercise?.description || '',
    patternType: editingExercise?.patternType || 'box',
    inhaleCount: editingExercise?.inhaleCount || 4,
    holdInCount: editingExercise?.holdInCount || 4,
    exhaleCount: editingExercise?.exhaleCount || 4,
    holdOutCount: editingExercise?.holdOutCount || 4,
    rounds: editingExercise?.rounds || 5,
    difficulty: editingExercise?.difficulty || 'beginner',
    instructions: editingExercise?.instructions || [],
    benefits: editingExercise?.benefits || [],
    contraindications: editingExercise?.contraindications || [],
    audioGuidanceUrl: editingExercise?.audioGuidanceUrl || '',
    thumbnailUrl: editingExercise?.thumbnailUrl || '',
  });

  const [currentInput, setCurrentInput] = useState({
    instruction: '',
    benefit: '',
    contraindication: '',
  });

  const patternTemplates = [
    { 
      name: 'Box Breathing', 
      value: 'box',
      pattern: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
      description: 'Equal counts for all phases',
    },
    { 
      name: '4-7-8 Breathing', 
      value: '478',
      pattern: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
      description: 'Relaxation technique for sleep',
    },
    { 
      name: 'Wim Hof', 
      value: 'wimhof',
      pattern: { inhale: 2, holdIn: 0, exhale: 2, holdOut: 0 },
      description: 'Rapid breathing followed by retention',
    },
    { 
      name: 'Pranayama', 
      value: 'pranayama',
      pattern: { inhale: 4, holdIn: 16, exhale: 8, holdOut: 0 },
      description: '1:4:2 ratio for yogic breathing',
    },
    { 
      name: 'Custom', 
      value: 'custom',
      pattern: null,
      description: 'Create your own pattern',
    },
  ];

  const handleTemplateSelect = (template: any) => {
    if (template.pattern) {
      setFormData({
        ...formData,
        patternType: template.value,
        inhaleCount: template.pattern.inhale,
        holdInCount: template.pattern.holdIn,
        exhaleCount: template.pattern.exhale,
        holdOutCount: template.pattern.holdOut,
      });
    } else {
      setFormData({
        ...formData,
        patternType: template.value,
      });
    }
  };

  const calculateTotalDuration = () => {
    const secondsPerRound = formData.inhaleCount + formData.holdInCount + 
                           formData.exhaleCount + formData.holdOutCount;
    const totalSeconds = secondsPerRound * formData.rounds;
    return Math.ceil(totalSeconds / 60);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = editingExercise 
        ? `/api/content/breathing/${editingExercise.id}`
        : '/api/content/breathing';
      
      const method = editingExercise ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalDurationMin: calculateTotalDuration(),
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onOpenChange(false);
        // Reset form if creating new
        if (!editingExercise) {
          setFormData({
            title: '',
            description: '',
            patternType: 'box',
            inhaleCount: 4,
            holdInCount: 4,
            exhaleCount: 4,
            holdOutCount: 4,
            rounds: 5,
            difficulty: 'beginner',
            instructions: [],
            benefits: [],
            contraindications: [],
            audioGuidanceUrl: '',
            thumbnailUrl: '',
          });
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save breathing exercise');
      }
    } catch (error) {
      console.error('Error saving breathing exercise:', error);
      alert('Failed to save breathing exercise');
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), value.trim()],
      }));
      setCurrentInput(prev => ({ ...prev, [field.replace('s', '')]: '' }));
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingExercise ? 'Edit Breathing Exercise' : 'Create New Breathing Exercise'}
          </DialogTitle>
          <DialogDescription>
            Design a breathing exercise with custom patterns and guidance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title and Description */}
          <div>
            <Label htmlFor="title">Exercise Name *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Morning Energy Boost"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose and effects of this breathing exercise..."
              rows={3}
            />
          </div>

          {/* Pattern Templates */}
          <div>
            <Label>Breathing Pattern Template</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {patternTemplates.map((template) => (
                <Card
                  key={template.value}
                  className={`p-3 cursor-pointer transition-colors ${
                    formData.patternType === template.value ? 'border-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  {template.pattern && (
                    <div className="text-xs mt-2 text-gray-500">
                      {template.pattern.inhale}-{template.pattern.holdIn}-
                      {template.pattern.exhale}-{template.pattern.holdOut}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Pattern Configuration */}
          <div>
            <Label>Breathing Pattern (seconds)</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              <div>
                <Label className="text-xs">Inhale</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.inhaleCount}
                  onChange={(e) => setFormData({ ...formData, inhaleCount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-xs">Hold In</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.holdInCount}
                  onChange={(e) => setFormData({ ...formData, holdInCount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-xs">Exhale</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.exhaleCount}
                  onChange={(e) => setFormData({ ...formData, exhaleCount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-xs">Hold Out</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.holdOutCount}
                  onChange={(e) => setFormData({ ...formData, holdOutCount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            {/* Visual Pattern Preview */}
            <Card className="mt-3 p-3 bg-purple-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-purple-600" />
                  <span>Pattern Preview:</span>
                </div>
                <Badge variant="secondary">
                  {formData.inhaleCount + formData.holdInCount + formData.exhaleCount + formData.holdOutCount}s per cycle
                </Badge>
              </div>
            </Card>
          </div>

          {/* Rounds and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rounds">Number of Rounds</Label>
              <Input
                id="rounds"
                type="number"
                min="1"
                value={formData.rounds}
                onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>Total Duration</Label>
              <div className="flex items-center gap-2 mt-2">
                <Timer className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{calculateTotalDuration()} minutes</span>
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <Label>Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instructions */}
          <div>
            <Label>Step-by-Step Instructions</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentInput.instruction}
                onChange={(e) => setCurrentInput({ ...currentInput, instruction: e.target.value })}
                placeholder="Add an instruction..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('instructions', currentInput.instruction);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray('instructions', currentInput.instruction)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.instructions.map((instruction, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-500">{i + 1}.</span>
                  <span className="flex-1 text-sm">{instruction}</span>
                  <button
                    onClick={() => removeFromArray('instructions', i)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <Label>Benefits</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentInput.benefit}
                onChange={(e) => setCurrentInput({ ...currentInput, benefit: e.target.value })}
                placeholder="Add a benefit..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('benefits', currentInput.benefit);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray('benefits', currentInput.benefit)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((benefit, i) => (
                <Badge key={i} variant="secondary">
                  {benefit}
                  <button
                    onClick={() => removeFromArray('benefits', i)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Contraindications */}
          <div>
            <Label>Contraindications</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentInput.contraindication}
                onChange={(e) => setCurrentInput({ ...currentInput, contraindication: e.target.value })}
                placeholder="Add a contraindication..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('contraindications', currentInput.contraindication);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray('contraindications', currentInput.contraindication)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.contraindications.map((item, i) => (
                <Badge key={i} variant="destructive">
                  {item}
                  <button
                    onClick={() => removeFromArray('contraindications', i)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Audio Upload (placeholder) */}
          <div>
            <Label>Audio Guidance</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Audio guidance upload coming soon
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingExercise ? 'Update' : 'Create'} Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}