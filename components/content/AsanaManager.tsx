'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Grid3x3, List, BookOpen, AlertCircle, Edit, Trash2, Clock, Eye } from 'lucide-react';
import { AsanaForm } from './AsanaForm';

interface AsanaManagerProps {
  userId: string;
}

export function AsanaManager({ userId }: AsanaManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [asanas, setAsanas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsana, setEditingAsana] = useState<any>(null);

  const categories = [
    { name: 'Standing', value: 'standing', count: 0, color: 'bg-blue-100 text-blue-700' },
    { name: 'Seated', value: 'seated', count: 0, color: 'bg-green-100 text-green-700' },
    { name: 'Inversions', value: 'inversion', count: 0, color: 'bg-purple-100 text-purple-700' },
    { name: 'Backbends', value: 'backbend', count: 0, color: 'bg-orange-100 text-orange-700' },
    { name: 'Forward Folds', value: 'forward_fold', count: 0, color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Twists', value: 'twist', count: 0, color: 'bg-pink-100 text-pink-700' },
    { name: 'Balance', value: 'balance', count: 0, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Restorative', value: 'restorative', count: 0, color: 'bg-gray-100 text-gray-700' },
  ];

  useEffect(() => {
    fetchAsanas();
  }, [selectedCategory, searchQuery]);

  const fetchAsanas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        teacherId: userId,
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/content/asanas?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAsanas(data.asanas || []);
      }
    } catch (error) {
      console.error('Error fetching asanas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (asanaId: string) => {
    if (!confirm('Are you sure you want to delete this asana?')) return;
    
    try {
      const response = await fetch(`/api/content/asanas/${asanaId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchAsanas();
      }
    } catch (error) {
      console.error('Error deleting asana:', error);
    }
  };

  const handleEdit = (asana: any) => {
    setEditingAsana(asana);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchAsanas();
    setEditingAsana(null);
  };

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
        <Button onClick={() => setFormOpen(true)}>
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
        <Badge 
          variant={selectedCategory === 'all' ? 'secondary' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          All Poses ({asanas.length})
        </Badge>
        {categories.map((cat) => (
          <Badge 
            key={cat.value} 
            variant={selectedCategory === cat.value ? 'secondary' : 'outline'}
            className={`cursor-pointer ${selectedCategory === cat.value ? cat.color : ''}`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.name} ({asanas.filter(a => a.category === cat.value).length})
          </Badge>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : asanas.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {asanas.map((asana) => (
            <Card key={asana.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{asana.englishName}</h3>
                  <p className="text-sm text-gray-600">{asana.sanskritName}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(asana)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(asana.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {asana.category?.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {asana.difficulty || 'All levels'}
                  </Badge>
                  {asana.status === 'draft' && (
                    <Badge variant="destructive" className="text-xs">Draft</Badge>
                  )}
                </div>
                
                {asana.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{asana.description}</p>
                )}
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {asana.holdDurationSeconds && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {asana.holdDurationSeconds}s hold
                    </div>
                  )}
                  {asana.drishti && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {asana.drishti}
                    </div>
                  )}
                </div>
                
                {asana.benefits && asana.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asana.benefits.slice(0, 2).map((benefit: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                    {asana.benefits.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{asana.benefits.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
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
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Asana
          </Button>
        </div>
      </Card>
      )}

      {/* Asana Form Dialog */}
      <AsanaForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingAsana(null);
        }}
        onSuccess={handleFormSuccess}
        editingAsana={editingAsana}
      />
    </div>
  );
}