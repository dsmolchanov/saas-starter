'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Wind, Timer, Heart, AlertCircle } from 'lucide-react';

interface BreathingManagerProps {
  userId: string;
}

export function BreathingManager({ userId }: BreathingManagerProps) {
  const patterns = [
    { name: 'Box Breathing', ratio: '4-4-4-4', difficulty: 'Beginner' },
    { name: '4-7-8 Breathing', ratio: '4-7-8', difficulty: 'Beginner' },
    { name: 'Alternate Nostril', ratio: 'Varied', difficulty: 'Intermediate' },
    { name: 'Kapalabhati', ratio: 'Rapid', difficulty: 'Advanced' },
    { name: 'Bhastrika', ratio: 'Bellows', difficulty: 'Advanced' },
  ];

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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wind className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-gray-600">Total Exercises</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">0 min</p>
              <p className="text-xs text-gray-600">Total Duration</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-gray-600">Guided Audio</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wind className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-gray-600">Visual Patterns</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pattern Templates */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Popular Breathing Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {patterns.map((pattern) => (
            <Card key={pattern.name} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{pattern.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">Pattern: {pattern.ratio}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {pattern.difficulty}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3">
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Empty State */}
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Exercise
          </Button>
        </div>
      </Card>
    </div>
  );
}