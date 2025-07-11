"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  DollarSign, 
  BookOpen,
  Heart,
  Star,
  Globe
} from 'lucide-react';

interface ApplicationData {
  experienceLevel: string;
  trainingBackground: string;
  offlinePractice: string;
  regularStudentsCount: string;
  revenueModel: string;
  motivation: string;
  additionalInfo: string;
}

interface TeacherOnboardingProps {
  onComplete: (data: ApplicationData) => void;
  onCancel: () => void;
}

export function TeacherOnboarding({ onComplete, onCancel }: TeacherOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationData>({
    experienceLevel: '',
    trainingBackground: '',
    offlinePractice: '',
    regularStudentsCount: '',
    revenueModel: '',
    motivation: '',
    additionalInfo: '',
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Dzen Yoga Teachers',
      description: 'Join our community of passionate yoga instructors',
      content: 'welcome'
    },
    {
      id: 'experience',
      title: 'Your Yoga Teaching Experience',
      description: 'Tell us about your journey as a yoga instructor',
      content: 'form'
    },
    {
      id: 'training',
      title: 'Your Training Background',
      description: 'Where did you learn to become a yoga teacher?',
      content: 'form'
    },
    {
      id: 'practice',
      title: 'Your Current Practice',
      description: 'Tell us about your offline teaching experience',
      content: 'form'
    },
    {
      id: 'students',
      title: 'Your Student Community',
      description: 'How many regular students do you currently teach?',
      content: 'form'
    },
    {
      id: 'revenue',
      title: 'Revenue Model Preference',
      description: 'Choose how you\'d like to earn with Dzen Yoga',
      content: 'form'
    },
    {
      id: 'motivation',
      title: 'Why Dzen Yoga?',
      description: 'Share your motivation for joining our platform',
      content: 'form'
    },
    {
      id: 'submit',
      title: 'Ready to Submit',
      description: 'Review your application and submit',
      content: 'review'
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const updateFormData = (field: keyof ApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (steps[currentStep].id) {
      case 'experience':
        return formData.experienceLevel !== '';
      case 'training':
        return formData.trainingBackground.trim() !== '';
      case 'revenue':
        return formData.revenueModel !== '';
      default:
        return true;
    }
  };

  const renderWelcome = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Share Your Passion for Yoga</h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Join thousands of students on their wellness journey. Build your online presence, 
          reach new students, and grow your yoga teaching practice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="p-4 bg-primary/5 rounded-lg">
          <Users className="w-8 h-8 text-primary mb-2 mx-auto" />
          <h3 className="font-semibold mb-1">Global Reach</h3>
          <p className="text-sm text-muted-foreground">Connect with students worldwide</p>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg">
          <BookOpen className="w-8 h-8 text-primary mb-2 mx-auto" />
          <h3 className="font-semibold mb-1">Create Courses</h3>
          <p className="text-sm text-muted-foreground">Build structured learning experiences</p>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg">
          <DollarSign className="w-8 h-8 text-primary mb-2 mx-auto" />
          <h3 className="font-semibold mb-1">Earn Revenue</h3>
          <p className="text-sm text-muted-foreground">Monetize your expertise</p>
        </div>
      </div>
    </div>
  );

  const renderExperienceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">What's your teaching experience level?</h3>
        <p className="text-muted-foreground">This helps us understand your background better</p>
      </div>

      <RadioGroup 
        value={formData.experienceLevel} 
        onValueChange={(value) => updateFormData('experienceLevel', value)}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="beginner" id="beginner" />
          <Label htmlFor="beginner" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">New Teacher (0-1 years)</p>
              <p className="text-sm text-muted-foreground">Recently completed teacher training</p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="intermediate" id="intermediate" />
          <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">Developing Teacher (1-3 years)</p>
              <p className="text-sm text-muted-foreground">Building experience and student base</p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="experienced" id="experienced" />
          <Label htmlFor="experienced" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">Experienced Teacher (3-7 years)</p>
              <p className="text-sm text-muted-foreground">Established practice with regular students</p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="expert" id="expert" />
          <Label htmlFor="expert" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">Expert Teacher (7+ years)</p>
              <p className="text-sm text-muted-foreground">Senior instructor with deep expertise</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  const renderTrainingStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Where did you learn to teach yoga?</h3>
        <p className="text-muted-foreground">Tell us about your yoga teacher training background</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="training">Training Background *</Label>
          <Textarea
            id="training"
            placeholder="e.g., 200-hour YTT at [School Name], 500-hour Advanced Training, specific styles you're certified in..."
            value={formData.trainingBackground}
            onChange={(e) => updateFormData('trainingBackground', e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 What to include:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Yoga Alliance certifications (RYT-200, RYT-500, etc.)</li>
          <li>• Training schools or studios you attended</li>
          <li>• Specific yoga styles you're trained in</li>
          <li>• Continuing education or workshops</li>
        </ul>
      </div>
    </div>
  );

  const renderPracticeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Do you currently teach offline?</h3>
        <p className="text-muted-foreground">Tell us about your current teaching locations and style</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="offline">Current Offline Practice</Label>
          <Textarea
            id="offline"
            placeholder="e.g., I teach at [Studio Name] in [City], private sessions at home, outdoor classes in the park..."
            value={formData.offlinePractice}
            onChange={(e) => updateFormData('offlinePractice', e.target.value)}
            rows={3}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional - Leave blank if you don't currently teach offline
          </p>
        </div>
      </div>
    </div>
  );

  const renderStudentsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">How many regular students do you have?</h3>
        <p className="text-muted-foreground">This includes both offline and online students</p>
      </div>

      <RadioGroup 
        value={formData.regularStudentsCount} 
        onValueChange={(value) => updateFormData('regularStudentsCount', value)}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="0-10" id="students-0-10" />
          <Label htmlFor="students-0-10" className="flex-1 cursor-pointer">
            <p className="font-medium">0-10 students</p>
            <p className="text-sm text-muted-foreground">Just starting or small group</p>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="10-25" id="students-10-25" />
          <Label htmlFor="students-10-25" className="flex-1 cursor-pointer">
            <p className="font-medium">10-25 students</p>
            <p className="text-sm text-muted-foreground">Growing community</p>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="25-50" id="students-25-50" />
          <Label htmlFor="students-25-50" className="flex-1 cursor-pointer">
            <p className="font-medium">25-50 students</p>
            <p className="text-sm text-muted-foreground">Established following</p>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="50+" id="students-50+" />
          <Label htmlFor="students-50+" className="flex-1 cursor-pointer">
            <p className="font-medium">50+ students</p>
            <p className="text-sm text-muted-foreground">Large community</p>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  const renderRevenueStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">How would you like to earn?</h3>
        <p className="text-muted-foreground">Choose the revenue model that works best for you</p>
      </div>

      <RadioGroup 
        value={formData.revenueModel} 
        onValueChange={(value) => updateFormData('revenueModel', value)}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="percentage" id="percentage" />
          <Label htmlFor="percentage" className="flex-1 cursor-pointer">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">Revenue Share (70% to you)</p>
                <Badge variant="default">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Earn 70% of subscription revenue from students who attend your classes each month
              </p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 opacity-60">
          <RadioGroupItem value="per_class" id="per_class" disabled />
          <Label htmlFor="per_class" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">Per Class Fee</p>
              <p className="text-sm text-muted-foreground">Fixed fee per individual class (Coming Soon)</p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 opacity-60">
          <RadioGroupItem value="per_course" id="per_course" disabled />
          <Label htmlFor="per_course" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">Per Course Fee</p>
              <p className="text-sm text-muted-foreground">Fixed fee per complete course (Coming Soon)</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">🌟 Why Revenue Share?</h4>
        <p className="text-sm text-green-800">
          Our revenue share model aligns our success with yours. The more engaged students are with your content, 
          the more you earn. It encourages creating high-quality, engaging classes that students love.
        </p>
      </div>
    </div>
  );

  const renderMotivationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Why do you want to join Dzen Yoga?</h3>
        <p className="text-muted-foreground">Share your motivation and vision with us</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="motivation">Your Motivation</Label>
          <Textarea
            id="motivation"
            placeholder="Tell us why you're excited to teach on Dzen Yoga, what you hope to achieve, and how you want to help students..."
            value={formData.motivation}
            onChange={(e) => updateFormData('motivation', e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="additional">Anything else you'd like us to know?</Label>
          <Textarea
            id="additional"
            placeholder="Special skills, unique teaching style, languages you speak, or anything else that makes you unique..."
            value={formData.additionalInfo}
            onChange={(e) => updateFormData('additionalInfo', e.target.value)}
            rows={3}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">Optional</p>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Review Your Application</h3>
        <p className="text-muted-foreground">Make sure everything looks good before submitting</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Experience Level</h4>
          <p className="text-sm text-muted-foreground capitalize">{formData.experienceLevel.replace('_', ' ')}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Training Background</h4>
          <p className="text-sm text-muted-foreground">{formData.trainingBackground}</p>
        </div>

        {formData.offlinePractice && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Current Practice</h4>
            <p className="text-sm text-muted-foreground">{formData.offlinePractice}</p>
          </div>
        )}

        {formData.regularStudentsCount && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Regular Students</h4>
            <p className="text-sm text-muted-foreground">{formData.regularStudentsCount} students</p>
          </div>
        )}

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Revenue Model</h4>
          <p className="text-sm text-muted-foreground capitalize">{formData.revenueModel.replace('_', ' ')}</p>
        </div>

        {formData.motivation && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Motivation</h4>
            <p className="text-sm text-muted-foreground">{formData.motivation}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• We'll review your application within 2-3 business days</li>
          <li>• You'll receive an email notification about the status</li>
          <li>• If approved, you'll get access to the teacher dashboard</li>
          <li>• Our team will help you set up your first course</li>
        </ul>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return renderWelcome();
      case 'experience':
        return renderExperienceStep();
      case 'training':
        return renderTrainingStep();
      case 'practice':
        return renderPracticeStep();
      case 'students':
        return renderStudentsStep();
      case 'revenue':
        return renderRevenueStep();
      case 'motivation':
        return renderMotivationStep();
      case 'submit':
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStepContent()}
        </CardContent>

        <div className="flex justify-between p-6 pt-0">
          <Button 
            variant="outline" 
            onClick={currentStep === 0 ? onCancel : prevStep}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Submit Application
            </Button>
          ) : (
            <Button 
              onClick={nextStep} 
              disabled={!isStepValid()}
              className="gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
} 