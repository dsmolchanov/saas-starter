'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload,
  Video,
  Music,
  Clock,
  Tag,
  Users,
  Globe,
  Lock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Sparkles,
  Image,
  FileText,
  Settings,
  Plus,
  X,
  Check,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Volume2,
  Target,
  Heart,
  Wind,
  Zap
} from 'lucide-react';
// import { useTranslations } from '@/components/providers/simple-intl-provider';
import { cn } from '@/lib/utils';

// Step configuration for different content types
const stepConfigs = {
  class: [
    { id: 'basics', title: 'Basic Info', icon: FileText },
    { id: 'media', title: 'Media Upload', icon: Video },
    { id: 'details', title: 'Class Details', icon: Settings },
    { id: 'sequence', title: 'Pose Sequence', icon: Target },
    { id: 'publish', title: 'Review & Publish', icon: Eye }
  ],
  breathing: [
    { id: 'basics', title: 'Basic Info', icon: FileText },
    { id: 'pattern', title: 'Breathing Pattern', icon: Wind },
    { id: 'guidance', title: 'Audio Guidance', icon: Volume2 },
    { id: 'benefits', title: 'Benefits & Safety', icon: Heart },
    { id: 'publish', title: 'Review & Publish', icon: Eye }
  ],
  asana: [
    { id: 'basics', title: 'Basic Info', icon: FileText },
    { id: 'media', title: 'Images & Video', icon: Image },
    { id: 'alignment', title: 'Alignment Cues', icon: Target },
    { id: 'variations', title: 'Variations', icon: Zap },
    { id: 'publish', title: 'Review & Publish', icon: Eye }
  ],
  // Add more configurations for other content types...
};

interface ContentCreatorProps {
  contentType: string;
  userId: string;
}

export function ContentCreator({ contentType, userId }: ContentCreatorProps) {
  const router = useRouter();
  const { toast } = useToast();
  // const t = useTranslations('teacherStudio');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [contentData, setContentData] = useState<any>({
    title: '',
    description: '',
    difficulty: 'beginner',
    duration: 30,
    tags: [],
    visibility: 'public',
    thumbnailUrl: '',
    videoUrl: '',
    // Content-specific fields
    ...(contentType === 'class' && {
      style: 'vinyasa',
      intensity: 'moderate',
      equipment: [],
      poseSequence: []
    }),
    ...(contentType === 'breathing' && {
      patternType: 'box',
      inhaleCount: 4,
      holdInCount: 4,
      exhaleCount: 4,
      holdOutCount: 4,
      rounds: 10,
      benefits: [],
      contraindications: []
    }),
    ...(contentType === 'asana' && {
      sanskritName: '',
      englishName: '',
      category: 'standing',
      alignmentCues: [],
      commonMistakes: [],
      variations: []
    })
  });

  const steps = stepConfigs[contentType as keyof typeof stepConfigs] || stepConfigs.class;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // API call to create content
      const response = await fetch('/api/teacher/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentData,
          contentType,
          teacherId: userId,
          status: 'published'
        })
      });

      if (!response.ok) throw new Error('Failed to publish');

      toast({
        title: 'Content Published!',
        description: 'Your content is now live and available to students.',
      });

      router.push('/teacher-studio');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish content. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const response = await fetch('/api/teacher/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentData,
          contentType,
          teacherId: userId,
          status: 'draft'
        })
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({
        title: 'Draft Saved',
        description: 'Your content has been saved as a draft.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'basics':
        return <BasicsStep contentData={contentData} setContentData={setContentData} />;
      case 'media':
        return <MediaStep contentData={contentData} setContentData={setContentData} contentType={contentType} />;
      case 'details':
        return <DetailsStep contentData={contentData} setContentData={setContentData} />;
      case 'pattern':
        return <PatternStep contentData={contentData} setContentData={setContentData} />;
      case 'sequence':
        return <SequenceStep contentData={contentData} setContentData={setContentData} />;
      case 'publish':
        return <PublishStep contentData={contentData} contentType={contentType} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExitDialog(true)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Create {contentType.replace('_', ' ')}</h1>
                <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  disabled={index > currentStep}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    isActive && 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                    isCompleted && 'text-green-600 dark:text-green-400',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    isActive && 'bg-purple-600 text-white',
                    isCompleted && 'bg-green-600 text-white',
                    !isActive && !isCompleted && 'bg-gray-200 dark:bg-gray-800'
                  )}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden md:inline font-medium">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepData.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave content creator?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved as a draft. You can continue editing later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/teacher-studio')}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Step Components
function BasicsStep({ contentData, setContentData }: any) {
  const handleTagAdd = (tag: string) => {
    if (tag && !contentData.tags.includes(tag)) {
      setContentData({ ...contentData, tags: [...contentData.tags, tag] });
    }
  };

  const handleTagRemove = (tag: string) => {
    setContentData({
      ...contentData,
      tags: contentData.tags.filter((t: string) => t !== tag)
    });
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={contentData.title}
            onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
            placeholder="Enter a compelling title for your content"
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {contentData.title.length}/150 characters
          </p>
        </div>
        
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={contentData.description}
            onChange={(e) => setContentData({ ...contentData, description: e.target.value })}
            placeholder="Describe what students will learn and experience"
            className="mt-2 min-h-[120px]"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Write a clear description that helps students understand the value
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={contentData.difficulty}
              onValueChange={(value) => setContentData({ ...contentData, difficulty: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="all_levels">All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={contentData.duration}
              onChange={(e) => setContentData({ ...contentData, duration: parseInt(e.target.value) })}
              className="mt-2"
              min="5"
              max="180"
            />
          </div>
        </div>
        
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            {contentData.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => handleTagRemove(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTagAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Morning', 'Evening', 'Flexibility', 'Strength', 'Relaxation', 'Energy'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                onClick={() => handleTagAdd(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Visibility</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[
              { value: 'public', label: 'Public', icon: Globe, description: 'Available to everyone' },
              { value: 'members', label: 'Members Only', icon: Users, description: 'Requires membership' },
              { value: 'premium', label: 'Premium', icon: Sparkles, description: 'Premium members only' },
              { value: 'private', label: 'Private', icon: Lock, description: 'Only you can see' }
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setContentData({ ...contentData, visibility: option.value })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    contentData.visibility === option.value
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function MediaStep({ contentData, setContentData, contentType }: any) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File, type: 'video' | 'thumbnail') => {
    setIsUploading(true);
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // In real implementation, upload to cloud storage
    // const url = await uploadToCloudStorage(file);
    // setContentData({ ...contentData, [type === 'video' ? 'videoUrl' : 'thumbnailUrl']: url });
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Media Upload</h2>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="external">External Links</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          {/* Video Upload */}
          <div>
            <Label>Video Content</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-purple-600" />
                  <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                  <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                </div>
              ) : contentData.videoUrl ? (
                <div className="space-y-4">
                  <Video className="h-12 w-12 mx-auto text-green-600" />
                  <p className="font-medium">Video uploaded successfully</p>
                  <Button variant="outline" size="sm">
                    Replace Video
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drop your video here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      MP4, MOV, or MKV up to 5GB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'video');
                    }}
                    id="video-upload"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="video-upload" className="cursor-pointer">
                      Choose Video
                    </label>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Thumbnail Upload */}
          <div>
            <Label>Thumbnail Image</Label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                {contentData.thumbnailUrl ? (
                  <div className="space-y-2">
                    <Image className="h-8 w-8 mx-auto text-green-600" />
                    <p className="text-sm font-medium">Thumbnail uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm">Upload thumbnail</p>
                    <p className="text-xs text-muted-foreground">1280x720px recommended</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Auto-generate from video</p>
                <Button variant="outline" className="w-full">
                  Generate Thumbnail
                </Button>
                <p className="text-xs text-muted-foreground">
                  We'll pick the best frame from your video
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="external" className="space-y-6">
          <div>
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              value={contentData.videoUrl}
              onChange={(e) => setContentData({ ...contentData, videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              YouTube, Vimeo, or direct video URLs supported
            </p>
          </div>
          
          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={contentData.thumbnailUrl}
              onChange={(e) => setContentData({ ...contentData, thumbnailUrl: e.target.value })}
              placeholder="https://example.com/thumbnail.jpg"
              className="mt-2"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Additional Media */}
      <div className="mt-6">
        <Label>Background Music (Optional)</Label>
        <div className="mt-2 flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Music className="h-4 w-4" />
            Choose from Library
          </Button>
          <span className="text-sm text-muted-foreground">or</span>
          <Button variant="outline">
            Upload Custom Track
          </Button>
        </div>
      </div>
    </Card>
  );
}

function DetailsStep({ contentData, setContentData }: any) {
  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Class Details</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Yoga Style</Label>
            <Select
              value={contentData.style}
              onValueChange={(value) => setContentData({ ...contentData, style: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vinyasa">Vinyasa</SelectItem>
                <SelectItem value="hatha">Hatha</SelectItem>
                <SelectItem value="yin">Yin</SelectItem>
                <SelectItem value="ashtanga">Ashtanga</SelectItem>
                <SelectItem value="power">Power</SelectItem>
                <SelectItem value="restorative">Restorative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Intensity</Label>
            <Select
              value={contentData.intensity}
              onValueChange={(value) => setContentData({ ...contentData, intensity: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gentle">Gentle</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="vigorous">Vigorous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label>Equipment Needed</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              'Mat', 'Blocks', 'Strap', 'Bolster', 'Blanket', 'Wall',
              'Chair', 'Wheel', 'None'
            ].map((item) => (
              <button
                key={item}
                onClick={() => {
                  const equipment = contentData.equipment || [];
                  if (equipment.includes(item)) {
                    setContentData({
                      ...contentData,
                      equipment: equipment.filter((e: string) => e !== item)
                    });
                  } else {
                    setContentData({
                      ...contentData,
                      equipment: [...equipment, item]
                    });
                  }
                }}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all',
                  (contentData.equipment || []).includes(item)
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Focus Areas</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: 'flexibility', label: 'Flexibility', icon: '🤸' },
              { value: 'strength', label: 'Strength', icon: '💪' },
              { value: 'balance', label: 'Balance', icon: '⚖️' },
              { value: 'relaxation', label: 'Relaxation', icon: '😌' },
              { value: 'core', label: 'Core', icon: '🎯' },
              { value: 'backbends', label: 'Backbends', icon: '🌙' }
            ].map((area) => (
              <button
                key={area.value}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{area.icon}</span>
                  <span className="font-medium">{area.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PatternStep({ contentData, setContentData }: any) {
  const patterns = {
    box: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
    '478': { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
    equal: { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 },
    custom: { inhale: 0, holdIn: 0, exhale: 0, holdOut: 0 }
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Breathing Pattern</h2>
      
      <div className="space-y-6">
        <div>
          <Label>Pattern Type</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {Object.entries(patterns).map(([key, pattern]) => (
              <button
                key={key}
                onClick={() => setContentData({
                  ...contentData,
                  patternType: key,
                  inhaleCount: pattern.inhale,
                  holdInCount: pattern.holdIn,
                  exhaleCount: pattern.exhale,
                  holdOutCount: pattern.holdOut
                })}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-all',
                  contentData.patternType === key
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                )}
              >
                <p className="font-medium capitalize">{key} Breathing</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pattern.inhale}-{pattern.holdIn}-{pattern.exhale}-{pattern.holdOut}
                </p>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Pattern Counts (seconds)</Label>
          <div className="grid grid-cols-4 gap-4 mt-2">
            <div>
              <Label className="text-sm">Inhale</Label>
              <Input
                type="number"
                value={contentData.inhaleCount}
                onChange={(e) => setContentData({ ...contentData, inhaleCount: parseInt(e.target.value) })}
                min="0"
                max="20"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Hold In</Label>
              <Input
                type="number"
                value={contentData.holdInCount}
                onChange={(e) => setContentData({ ...contentData, holdInCount: parseInt(e.target.value) })}
                min="0"
                max="20"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Exhale</Label>
              <Input
                type="number"
                value={contentData.exhaleCount}
                onChange={(e) => setContentData({ ...contentData, exhaleCount: parseInt(e.target.value) })}
                min="0"
                max="20"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Hold Out</Label>
              <Input
                type="number"
                value={contentData.holdOutCount}
                onChange={(e) => setContentData({ ...contentData, holdOutCount: parseInt(e.target.value) })}
                min="0"
                max="20"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label>Visual Preview</Label>
          <div className="mt-2 p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wind className="h-12 w-12 text-blue-600" />
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-sm text-muted-foreground">
              Total cycle: {contentData.inhaleCount + contentData.holdInCount + contentData.exhaleCount + contentData.holdOutCount} seconds
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SequenceStep({ contentData, setContentData }: any) {
  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Pose Sequence Builder</h2>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="font-medium">Drag and drop poses to build your sequence</p>
          <p className="text-sm text-muted-foreground mt-1">
            Or use our AI to generate a sequence based on your class parameters
          </p>
          <Button className="mt-4" variant="outline">
            Generate with AI
          </Button>
        </div>
        
        <div>
          <Label>Sequence Timeline</Label>
          <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['Mountain Pose', 'Forward Fold', 'Halfway Lift', 'Plank', 'Chaturanga', 'Upward Dog', 'Downward Dog'].map((pose, index) => (
                <div key={index} className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm font-medium">{pose}</p>
                  <p className="text-xs text-muted-foreground mt-1">30s</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PublishStep({ contentData, contentType }: any) {
  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Review & Publish</h2>
      
      <div className="space-y-6">
        {/* Preview Card */}
        <div className="border rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
            {contentData.thumbnailUrl ? (
              <img 
                src={contentData.thumbnailUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <Badge className="absolute top-4 left-4">
              {contentData.duration} min
            </Badge>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold">{contentData.title || 'Untitled'}</h3>
            <p className="text-muted-foreground mt-2">
              {contentData.description || 'No description provided'}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline">{contentData.difficulty}</Badge>
              <Badge variant="outline">{contentData.visibility}</Badge>
              {contentData.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Checklist */}
        <div>
          <h3 className="font-semibold mb-4">Publishing Checklist</h3>
          <div className="space-y-2">
            {[
              { label: 'Title and description added', checked: !!contentData.title && !!contentData.description },
              { label: 'Media uploaded', checked: !!contentData.videoUrl || !!contentData.thumbnailUrl },
              { label: 'Difficulty level set', checked: !!contentData.difficulty },
              { label: 'Tags added', checked: contentData.tags.length > 0 },
              { label: 'Visibility configured', checked: !!contentData.visibility }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.checked ? (
                  <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
                <span className={cn('text-sm', !item.checked && 'text-muted-foreground')}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Publishing Options */}
        <div>
          <h3 className="font-semibold mb-4">Publishing Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Schedule for later</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Send notification to followers</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Share on social media</span>
            </label>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">Ready to publish!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your content will be available immediately after publishing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}