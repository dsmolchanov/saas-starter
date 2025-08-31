'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Edit, 
  Calendar,
  Plus,
  Save,
  X,
  Globe,
  Sparkles
} from 'lucide-react';

interface Chakra {
  id: string;
  number: number;
  sanskrit_name: string;
  color_hex: string;
  mantra?: string;
  frequency_hz?: number;
  name_en: string;
  name_ru: string;
  name_es: string;
  element_en?: string;
  element_ru?: string;
  element_es?: string;
  location_en?: string;
  location_ru?: string;
  location_es?: string;
  description_en?: string;
  description_ru?: string;
  description_es?: string;
  healing_focus_en?: string;
  healing_focus_ru?: string;
  healing_focus_es?: string;
  affirmation_en?: string;
  affirmation_ru?: string;
  affirmation_es?: string;
}

interface DailyFocus {
  id: string;
  date: string;
  chakra_id: string;
  custom_message_en?: string;
  custom_message_ru?: string;
  custom_message_es?: string;
  meditation_minutes?: number;
}

interface ChakraManagerProps {
  initialChakras: Chakra[];
  initialDailyFocus: DailyFocus[];
}

export function ChakraManager({ initialChakras, initialDailyFocus }: ChakraManagerProps) {
  const [chakras] = useState(initialChakras);
  const [dailyFocus, setDailyFocus] = useState(initialDailyFocus);
  const [editingChakra, setEditingChakra] = useState<Chakra | null>(null);
  const [editingFocus, setEditingFocus] = useState<DailyFocus | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChakraId, setSelectedChakraId] = useState('');
  const [customMessages, setCustomMessages] = useState({
    en: '',
    ru: '',
    es: ''
  });
  const [meditationMinutes, setMeditationMinutes] = useState(15);

  const getChakraColorClass = (hex: string) => {
    const colorMap: { [key: string]: string } = {
      '#DC2626': 'bg-red-500',
      '#EA580C': 'bg-orange-500',
      '#EAB308': 'bg-yellow-500',
      '#22C55E': 'bg-green-500',
      '#3B82F6': 'bg-blue-500',
      '#6366F1': 'bg-indigo-500',
      '#9333EA': 'bg-purple-500'
    };
    return colorMap[hex.toUpperCase()] || 'bg-gray-500';
  };

  const handleSaveChakra = async () => {
    if (!editingChakra) return;
    
    try {
      const response = await fetch(`/api/admin/chakras/${editingChakra.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingChakra)
      });

      if (response.ok) {
        setEditingChakra(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error saving chakra:', error);
    }
  };

  const handleScheduleFocus = async () => {
    if (!selectedChakraId || !selectedDate) return;
    
    try {
      const response = await fetch('/api/admin/chakra-focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          chakra_id: selectedChakraId,
          custom_message_en: customMessages.en,
          custom_message_ru: customMessages.ru,
          custom_message_es: customMessages.es,
          meditation_minutes: meditationMinutes
        })
      });

      if (response.ok) {
        const newFocus = await response.json();
        setDailyFocus([newFocus, ...dailyFocus]);
        setIsScheduleDialogOpen(false);
        resetScheduleForm();
      }
    } catch (error) {
      console.error('Error scheduling focus:', error);
    }
  };

  const resetScheduleForm = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedChakraId('');
    setCustomMessages({ en: '', ru: '', es: '' });
    setMeditationMinutes(15);
  };

  return (
    <div className="space-y-6">
      {/* Chakras List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Seven Chakras
          </h2>
        </div>

        <div className="grid gap-4">
          {chakras.map((chakra) => (
            <Card key={chakra.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${getChakraColorClass(chakra.color_hex)} flex items-center justify-center text-white font-bold`}>
                    {chakra.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{chakra.name_en}</h3>
                      <Badge variant="secondary">{chakra.sanskrit_name}</Badge>
                      {chakra.mantra && (
                        <Badge variant="outline">{chakra.mantra}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{chakra.description_en}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Element: {chakra.element_en}</span>
                      <span>Location: {chakra.location_en}</span>
                      {chakra.frequency_hz && (
                        <span>{chakra.frequency_hz} Hz</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm italic">"{chakra.affirmation_en}"</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingChakra(chakra)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Daily Focus Schedule */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Daily Focus Schedule
          </h2>
          <Button onClick={() => setIsScheduleDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Focus
          </Button>
        </div>

        <div className="space-y-2">
          {dailyFocus.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No scheduled focus days</p>
          ) : (
            dailyFocus.map((focus) => {
              const chakra = chakras.find(c => c.id === focus.chakra_id);
              return (
                <div key={focus.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium w-32">
                    {new Date(focus.date).toLocaleDateString()}
                  </div>
                  {chakra && (
                    <>
                      <div className={`w-4 h-4 rounded-full ${getChakraColorClass(chakra.color_hex)}`} />
                      <div className="flex-1">
                        <span className="font-medium">{chakra.name_en}</span>
                        {focus.custom_message_en && (
                          <p className="text-sm text-gray-600 mt-1">{focus.custom_message_en}</p>
                        )}
                      </div>
                    </>
                  )}
                  <Badge>{focus.meditation_minutes} min</Badge>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Edit Chakra Dialog */}
      {editingChakra && (
        <Dialog open={!!editingChakra} onOpenChange={() => setEditingChakra(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {editingChakra.name_en}</DialogTitle>
              <DialogDescription>
                Update chakra information in all languages
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="en" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ru">Русский</TabsTrigger>
                <TabsTrigger value="es">Español</TabsTrigger>
              </TabsList>

              <TabsContent value="en" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editingChakra.name_en}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      name_en: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingChakra.description_en || ''}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      description_en: e.target.value
                    })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Affirmation</label>
                  <Input
                    value={editingChakra.affirmation_en || ''}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      affirmation_en: e.target.value
                    })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ru" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название</label>
                  <Input
                    value={editingChakra.name_ru}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      name_ru: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <Textarea
                    value={editingChakra.description_ru || ''}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      description_ru: e.target.value
                    })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Аффирмация</label>
                  <Input
                    value={editingChakra.affirmation_ru || ''}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      affirmation_ru: e.target.value
                    })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="es" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <Input
                    value={editingChakra.name_es}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      name_es: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea
                    value={editingChakra.description_es || ''}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      description_es: e.target.value
                    })}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Afirmación</label>
                  <Input
                    value={editingChakra.affirmation_es || ''}
                    onChange={(e) => setEditingChakra({
                      ...editingChakra,
                      affirmation_es: e.target.value
                    })}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingChakra(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChakra}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Focus Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Chakra Focus</DialogTitle>
            <DialogDescription>
              Set a specific chakra focus for a date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Chakra</label>
              <Select value={selectedChakraId} onValueChange={setSelectedChakraId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a chakra" />
                </SelectTrigger>
                <SelectContent>
                  {chakras.map((chakra) => (
                    <SelectItem key={chakra.id} value={chakra.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getChakraColorClass(chakra.color_hex)}`} />
                        {chakra.name_en}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Meditation Duration (minutes)</label>
              <Input
                type="number"
                value={meditationMinutes}
                onChange={(e) => setMeditationMinutes(parseInt(e.target.value))}
                min={5}
                max={60}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Custom Message (Optional)</label>
              <Tabs defaultValue="en" className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="en">EN</TabsTrigger>
                  <TabsTrigger value="ru">RU</TabsTrigger>
                  <TabsTrigger value="es">ES</TabsTrigger>
                </TabsList>
                <TabsContent value="en">
                  <Textarea
                    placeholder="English message"
                    value={customMessages.en}
                    onChange={(e) => setCustomMessages({
                      ...customMessages,
                      en: e.target.value
                    })}
                    rows={2}
                  />
                </TabsContent>
                <TabsContent value="ru">
                  <Textarea
                    placeholder="Русское сообщение"
                    value={customMessages.ru}
                    onChange={(e) => setCustomMessages({
                      ...customMessages,
                      ru: e.target.value
                    })}
                    rows={2}
                  />
                </TabsContent>
                <TabsContent value="es">
                  <Textarea
                    placeholder="Mensaje en español"
                    value={customMessages.es}
                    onChange={(e) => setCustomMessages({
                      ...customMessages,
                      es: e.target.value
                    })}
                    rows={2}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleFocus}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}