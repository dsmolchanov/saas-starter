'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Headphones, Mic, Music, Brain, AlertCircle, Clock } from 'lucide-react';

interface MeditationManagerProps {
  userId: string;
}

export function MeditationManager({ userId }: MeditationManagerProps) {
  const meditationTypes = [
    { type: 'Guided', icon: Mic, count: 0, color: 'bg-purple-100 text-purple-700' },
    { type: 'Music Only', icon: Music, count: 0, color: 'bg-blue-100 text-blue-700' },
    { type: 'Sleep', icon: Clock, count: 0, color: 'bg-indigo-100 text-indigo-700' },
    { type: 'Mindfulness', icon: Brain, count: 0, color: 'bg-green-100 text-green-700' },
  ];

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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Meditation
        </Button>
      </div>

      {/* Meditation Types Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {meditationTypes.map((item) => (
          <Card key={item.type} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-12 h-12 rounded-lg ${item.color.split(' ')[0]} flex items-center justify-center mb-3`}>
              <item.icon className={`w-6 h-6 ${item.color.split(' ')[1]}`} />
            </div>
            <h3 className="font-medium">{item.type}</h3>
            <p className="text-2xl font-semibold mt-1">{item.count}</p>
            <p className="text-xs text-gray-600">sessions</p>
          </Card>
        ))}
      </div>

      {/* Duration Categories */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Duration Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['5 min', '10 min', '15 min', '20 min', '30+ min'].map((duration) => (
            <Card key={duration} className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
              <Clock className="w-5 h-5 mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-medium">{duration}</p>
              <p className="text-xs text-gray-500 mt-1">0 meditations</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Empty State */}
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
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Record Your First Meditation
          </Button>
        </div>
      </Card>
    </div>
  );
}