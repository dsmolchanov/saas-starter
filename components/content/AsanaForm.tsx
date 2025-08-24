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
import { Plus, X, Upload, Loader2 } from 'lucide-react';

interface AsanaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingAsana?: any;
}

export function AsanaForm({ open, onOpenChange, onSuccess, editingAsana }: AsanaFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sanskritName: editingAsana?.sanskritName || '',
    englishName: editingAsana?.englishName || '',
    category: editingAsana?.category || '',
    poseType: editingAsana?.poseType || 'foundation',
    description: editingAsana?.description || '',
    difficulty: editingAsana?.difficulty || 'beginner',
    holdDurationSeconds: editingAsana?.holdDurationSeconds || 30,
    breathPattern: editingAsana?.breathPattern || '',
    drishti: editingAsana?.drishti || '',
    benefits: editingAsana?.benefits || [],
    contraindications: editingAsana?.contraindications || [],
    alignmentCues: editingAsana?.alignmentCues || [],
    commonMistakes: editingAsana?.commonMistakes || [],
    imageUrls: editingAsana?.imageUrls || [],
    videoUrl: editingAsana?.videoUrl || '',
  });

  const [currentInput, setCurrentInput] = useState({
    benefit: '',
    contraindication: '',
    alignmentCue: '',
    commonMistake: '',
  });

  const categories = [
    'standing',
    'seated',
    'supine',
    'prone',
    'inversion',
    'backbend',
    'forward_fold',
    'twist',
    'balance',
    'arm_balance',
    'restorative',
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = editingAsana 
        ? `/api/content/asanas/${editingAsana.id}`
        : '/api/content/asanas';
      
      const method = editingAsana ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess?.();
        onOpenChange(false);
        // Reset form if creating new
        if (!editingAsana) {
          setFormData({
            sanskritName: '',
            englishName: '',
            category: '',
            poseType: 'foundation',
            description: '',
            difficulty: 'beginner',
            holdDurationSeconds: 30,
            breathPattern: '',
            drishti: '',
            benefits: [],
            contraindications: [],
            alignmentCues: [],
            commonMistakes: [],
            imageUrls: [],
            videoUrl: '',
          });
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save asana');
      }
    } catch (error) {
      console.error('Error saving asana:', error);
      alert('Failed to save asana');
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
            {editingAsana ? 'Edit Asana' : 'Create New Asana'}
          </DialogTitle>
          <DialogDescription>
            Add a new pose to your asana library with detailed information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sanskrit">Sanskrit Name *</Label>
              <Input
                id="sanskrit"
                value={formData.sanskritName}
                onChange={(e) => setFormData({ ...formData, sanskritName: e.target.value })}
                placeholder="e.g., Tadasana"
              />
            </div>
            <div>
              <Label htmlFor="english">English Name *</Label>
              <Input
                id="english"
                value={formData.englishName}
                onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                placeholder="e.g., Mountain Pose"
              />
            </div>
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
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
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the pose and its key characteristics..."
              rows={3}
            />
          </div>

          {/* Hold Duration and Breath */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hold">Hold Duration (seconds)</Label>
              <Input
                id="hold"
                type="number"
                value={formData.holdDurationSeconds}
                onChange={(e) => setFormData({ ...formData, holdDurationSeconds: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="breath">Breath Pattern</Label>
              <Input
                id="breath"
                value={formData.breathPattern}
                onChange={(e) => setFormData({ ...formData, breathPattern: e.target.value })}
                placeholder="e.g., Normal, Ujjayi"
              />
            </div>
            <div>
              <Label htmlFor="drishti">Drishti (Gaze)</Label>
              <Input
                id="drishti"
                value={formData.drishti}
                onChange={(e) => setFormData({ ...formData, drishti: e.target.value })}
                placeholder="e.g., Third eye, Nose tip"
              />
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
              {formData.benefits.map((benefit: string, i: number) => (
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
              {formData.contraindications.map((item: string, i: number) => (
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

          {/* Alignment Cues */}
          <div>
            <Label>Alignment Cues</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentInput.alignmentCue}
                onChange={(e) => setCurrentInput({ ...currentInput, alignmentCue: e.target.value })}
                placeholder="Add an alignment cue..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('alignmentCues', currentInput.alignmentCue);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray('alignmentCues', currentInput.alignmentCue)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.alignmentCues.map((cue: string, i: number) => (
                <Badge key={i} variant="outline">
                  {cue}
                  <button
                    onClick={() => removeFromArray('alignmentCues', i)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Media Upload (placeholder) */}
          <div>
            <Label>Images</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Image upload coming soon
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
            {editingAsana ? 'Update' : 'Create'} Asana
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}