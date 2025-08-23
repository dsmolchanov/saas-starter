'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Grid3x3, List, BookOpen, AlertCircle } from 'lucide-react';

interface AsanaManagerProps {
  userId: string;
}

export function AsanaManager({ userId }: AsanaManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { name: 'Standing', count: 0, color: 'bg-blue-100 text-blue-700' },
    { name: 'Seated', count: 0, color: 'bg-green-100 text-green-700' },
    { name: 'Inversions', count: 0, color: 'bg-purple-100 text-purple-700' },
    { name: 'Backbends', count: 0, color: 'bg-orange-100 text-orange-700' },
    { name: 'Forward Folds', count: 0, color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Twists', count: 0, color: 'bg-pink-100 text-pink-700' },
    { name: 'Balance', count: 0, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Restorative', count: 0, color: 'bg-gray-100 text-gray-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Asana Library</h2>
          <p className="text-sm text-gray-600 mt-1">
            Build your comprehensive pose database
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Asana
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Sanskrit or English name..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Badge variant="secondary" className="cursor-pointer">All Poses</Badge>
        {categories.map((cat) => (
          <Badge key={cat.name} variant="outline" className={`cursor-pointer ${cat.color}`}>
            {cat.name} ({cat.count})
          </Badge>
        ))}
      </div>

      {/* Content Area */}
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium">Build Your Asana Library</h3>
          <p className="text-sm text-gray-600">
            Create a comprehensive database of yoga poses with Sanskrit names, 
            alignment cues, benefits, and variations. This will serve as the 
            foundation for all your classes and sequences.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Coming Soon!</p>
                <p className="text-blue-700 mt-1">
                  The Asana Library will include:
                </p>
                <ul className="mt-2 space-y-1 text-blue-600">
                  <li>• Visual pose browser with photos</li>
                  <li>• Detailed alignment instructions</li>
                  <li>• Benefits and contraindications</li>
                  <li>• Pose variations and modifications</li>
                  <li>• Quick add to class sequences</li>
                </ul>
              </div>
            </div>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Asana
          </Button>
        </div>
      </Card>
    </div>
  );
}