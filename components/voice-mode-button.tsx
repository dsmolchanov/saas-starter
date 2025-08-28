'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface VoiceModeButtonProps {
  classId: string;
  isAiEnabled?: boolean;
}

export function VoiceModeButton({ classId, isAiEnabled = true }: VoiceModeButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [settings, setSettings] = useState({
    level: 'intermediate',
    modifications: [] as string[]
  });

  const handleStartVoiceSession = () => {
    // Store settings in session storage for the voice page to use
    sessionStorage.setItem('voiceSettings', JSON.stringify(settings));
    router.push(`/classes/${classId}/voice`);
  };

  const toggleModification = (mod: string) => {
    setSettings(prev => ({
      ...prev,
      modifications: prev.modifications.includes(mod)
        ? prev.modifications.filter(m => m !== mod)
        : [...prev.modifications, mod]
    }));
  };

  if (!isAiEnabled) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="gap-2"
        variant="default"
        size="lg"
      >
        <Mic className="w-5 h-5" />
        <Sparkles className="w-4 h-4" />
        Start with Voice AI
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Personalize Your Voice Session</DialogTitle>
            <DialogDescription>
              Tell us about your practice to get personalized guidance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Experience Level */}
            <div className="space-y-3">
              <Label>Your Experience Level</Label>
              <RadioGroup
                value={settings.level}
                onValueChange={(value) => setSettings(prev => ({ ...prev, level: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="font-normal">
                    Beginner - New to yoga
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="font-normal">
                    Intermediate - Regular practice
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="font-normal">
                    Advanced - Experienced practitioner
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Modifications */}
            <div className="space-y-3">
              <Label>Any Limitations or Injuries?</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="back_injury"
                    checked={settings.modifications.includes('back_injury')}
                    onCheckedChange={() => toggleModification('back_injury')}
                  />
                  <Label htmlFor="back_injury" className="font-normal">
                    Back sensitivity
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="knee_injury"
                    checked={settings.modifications.includes('knee_injury')}
                    onCheckedChange={() => toggleModification('knee_injury')}
                  />
                  <Label htmlFor="knee_injury" className="font-normal">
                    Knee issues
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="shoulder_injury"
                    checked={settings.modifications.includes('shoulder_injury')}
                    onCheckedChange={() => toggleModification('shoulder_injury')}
                  />
                  <Label htmlFor="shoulder_injury" className="font-normal">
                    Shoulder limitations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pregnancy"
                    checked={settings.modifications.includes('pregnancy')}
                    onCheckedChange={() => toggleModification('pregnancy')}
                  />
                  <Label htmlFor="pregnancy" className="font-normal">
                    Pregnancy modifications
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartVoiceSession}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Start Practice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}