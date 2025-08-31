'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/components/providers/simple-intl-provider';
import { CompactLanguageSwitcher } from '@/components/ui/language-switcher-compact';
import { 
  Play, 
  Flame, 
  Sun, 
  Moon, 
  Wind, 
  Heart,
  Calendar,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  ChevronRight,
  Activity,
  Target,
  BookOpen,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Class {
  id: string;
  title: string;
  durationMin: number;
  style?: string | null;
  difficulty?: string | null;
  thumbnailUrl?: string | null;
  teacher?: {
    id: string;
    name: string | null;
  } | null;
}

interface Teacher {
  id: string;
  bio?: string | null;
  user?: {
    id: string;
    name: string | null;
    avatarUrl?: string | null;
  } | null;
}

interface SpiritualContent {
  chakra?: any;
  moonPhase?: any;
  yogaQuote?: any;
}

interface HomeContentProps {
  user: User;
  currentStreak: number;
  recommendedClass: Class | undefined;
  popularClasses: Class[];
  latestClasses: Class[];
  featuredTeacher: Teacher | undefined;
  practicedToday: boolean;
  totalMinutes: number;
  spiritualContent?: SpiritualContent;
}


// Breathing exercises
const breathingExercises = [
  { name: "Box Breathing", duration: "4-4-4-4", description: "Calming and centering" },
  { name: "Ujjayi Breath", duration: "Deep & Slow", description: "Ocean breath for focus" },
  { name: "Nadi Shodhana", duration: "5 minutes", description: "Alternate nostril for balance" },
  { name: "Kapalabhati", duration: "3 rounds", description: "Energizing breath of fire" },
];


export function HomeContent({
  user,
  currentStreak,
  recommendedClass,
  popularClasses,
  latestClasses,
  featuredTeacher,
  practicedToday,
  totalMinutes,
  spiritualContent,
}: HomeContentProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const [greeting, setGreeting] = useState('goodMorning');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breathingExercise, setBreathingExercise] = useState(breathingExercises[0]);
  const [currentLang, setCurrentLang] = useState<'en' | 'ru' | 'es'>('en');
  

  useEffect(() => {
    const updateTimeBasedContent = () => {
      const now = new Date();
      const hour = now.getHours();
      setCurrentTime(now);
      
      if (hour < 12) {
        setGreeting('goodMorning');
        setTimeOfDay('morning');
      } else if (hour < 17) {
        setGreeting('goodAfternoon');
        setTimeOfDay('afternoon');
      } else {
        setGreeting('goodEvening');
        setTimeOfDay('evening');
      }

      // Daily rotating content based on date
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      setBreathingExercise(breathingExercises[dayOfYear % breathingExercises.length]);
      
      // Get current language from pathname or localStorage
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      let detectedLang: 'en' | 'ru' | 'es' = 'en';
      
      if (pathname.startsWith('/ru')) {
        detectedLang = 'ru';
      } else if (pathname.startsWith('/es')) {
        detectedLang = 'es';
      } else {
        const storedLang = typeof window !== 'undefined' ? localStorage.getItem('locale') as 'en' | 'ru' | 'es' : null;
        if (storedLang) {
          detectedLang = storedLang;
        }
      }
      
      setCurrentLang(detectedLang);
    };

    updateTimeBasedContent();
    const interval = setInterval(updateTimeBasedContent, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Helper functions to get localized content
  const getLocalizedField = (obj: any, field: string) => {
    if (!obj) return '';
    
    // Convert field name to snake_case if needed (e.g., 'energyType' -> 'energy_type')
    const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    // Try current language field first
    const langField = `${snakeField}_${currentLang}`;
    if (obj[langField]) return obj[langField];
    
    // Also try the original field name with language suffix (in case it's already snake_case)
    const originalLangField = `${field}_${currentLang}`;
    if (obj[originalLangField]) return obj[originalLangField];
    
    // Fallback to English
    const enField = `${snakeField}_en`;
    if (obj[enField]) return obj[enField];
    
    const originalEnField = `${field}_en`;
    if (obj[originalEnField]) return obj[originalEnField];
    
    // Try without language suffix (for legacy data)
    if (obj[field]) return obj[field];
    if (obj[snakeField]) return obj[snakeField];
    
    // Return empty string if nothing found
    return '';
  };

  const getChakraColorClass = (hex: string) => {
    if (!hex) return 'bg-gray-500';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header with Greeting */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-medium text-gray-900">
                {t(greeting)}, {user.name?.split(' ')[0]}
              </h1>
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CompactLanguageSwitcher />
              <Link href="/my_practice">
                <Avatar className="w-10 h-10 ring-2 ring-gray-100">
                  <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
                    {user.name?.charAt(0) || 'Y'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Daily Practice Card - Hero Section */}
        {!practicedToday && recommendedClass && (
          <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">{t('todaysPractice')}</p>
                  <h2 className="text-xl font-semibold text-gray-900">{recommendedClass.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('with')} {recommendedClass.teacher?.name || t('expertTeacher')}
                  </p>
                </div>
                {timeOfDay === 'morning' ? (
                  <Sun className="w-8 h-8 text-yellow-500" />
                ) : timeOfDay === 'evening' ? (
                  <Moon className="w-8 h-8 text-indigo-500" />
                ) : (
                  <Sun className="w-8 h-8 text-orange-500" />
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary" className="bg-white/80">
                  <Clock className="w-3 h-3 mr-1" />
                  {recommendedClass.durationMin} min
                </Badge>
                {recommendedClass.style && (
                  <Badge variant="secondary" className="bg-white/80">
                    {recommendedClass.style}
                  </Badge>
                )}
                {recommendedClass.difficulty && (
                  <Badge variant="secondary" className="bg-white/80">
                    {recommendedClass.difficulty}
                  </Badge>
                )}
              </div>

              <Link href={`/classes/${recommendedClass.id}`}>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Play className="w-4 h-4 mr-2" />
                  {t('startPractice')}
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Flame className={`w-6 h-6 mb-1 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
              <p className="text-2xl font-semibold">{currentStreak}</p>
              <p className="text-xs text-gray-500">{t('dayStreak')}</p>
            </div>
          </Card>
          
          <Card className="p-4 text-center border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Activity className="w-6 h-6 mb-1 text-green-500" />
              <p className="text-2xl font-semibold">{Math.floor(totalMinutes / 60)}</p>
              <p className="text-xs text-gray-500">{t('hoursTotal')}</p>
            </div>
          </Card>
          
          <Card className="p-4 text-center border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Target className="w-6 h-6 mb-1 text-blue-500" />
              <p className="text-2xl font-semibold">{practicedToday ? '✓' : '—'}</p>
              <p className="text-xs text-gray-500">{t('today')}</p>
            </div>
          </Card>
        </div>

        {/* Daily Wisdom */}
        <Card className="p-5 border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div className="flex-1">
              {spiritualContent?.yogaQuote ? (
                <>
                  <p className="text-sm font-medium text-gray-900 italic">
                    "{getLocalizedField(spiritualContent.yogaQuote, 'quote') || spiritualContent.yogaQuote.text}"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    — {spiritualContent.yogaQuote.author || spiritualContent.yogaQuote.text?.author || 'Ancient Wisdom'}
                    {spiritualContent.yogaQuote.chapter && spiritualContent.yogaQuote.verse && 
                      ` (${spiritualContent.yogaQuote.chapter}:${spiritualContent.yogaQuote.verse})`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 italic">
                    {currentLang === 'ru' 
                      ? '"Тело получает пользу от движения, а ум - от покоя."'
                      : '"The body benefits from movement, and the mind benefits from stillness."'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentLang === 'ru' ? '— Сакйонг Мипам' : '— Sakyong Mipham'}
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Breathing Exercise */}
        <Card className="p-5 border-0 shadow-sm bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5 text-cyan-600" />
                <p className="text-sm font-medium text-gray-900">{t('breathingPractice')}</p>
              </div>
              <p className="font-semibold text-gray-900">{breathingExercise.name}</p>
              <p className="text-xs text-gray-600">{breathingExercise.description}</p>
              <Badge variant="secondary" className="mt-2 bg-white/60">
                {breathingExercise.duration}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-cyan-600">
              {t('tryNow')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Today's Focus - Chakra & Moon */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${spiritualContent?.chakra ? getChakraColorClass(spiritualContent.chakra.color_hex) : 'bg-purple-500'}`} />
              <p className="text-xs font-medium text-gray-600">{t('chakraFocus')}</p>
            </div>
            {spiritualContent?.chakra ? (
              <>
                <p className="font-semibold text-sm">
                  {getLocalizedField(spiritualContent.chakra, 'name')}
                </p>
                <p className="text-xs text-gray-500">{spiritualContent.chakra.sanskrit_name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {getLocalizedField(spiritualContent.chakra, 'element')}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-sm">{currentLang === 'ru' ? 'Корневая чакра' : 'Root Chakra'}</p>
                <p className="text-xs text-gray-500">Muladhara</p>
                <p className="text-xs text-gray-400 mt-1">{currentLang === 'ru' ? 'Земля' : 'Earth'}</p>
              </>
            )}
          </Card>

          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{spiritualContent?.moonPhase?.emoji || '🌙'}</span>
              <p className="text-xs font-medium text-gray-600">{t('moonPhase')}</p>
            </div>
            {spiritualContent?.moonPhase ? (
              <>
                <p className="font-semibold text-sm">
                  {getLocalizedField(spiritualContent.moonPhase, 'name')}
                </p>
                <p className="text-xs text-gray-500">
                  {getLocalizedField(spiritualContent.moonPhase, 'energy_type')}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-sm">{currentLang === 'ru' ? 'Растущая луна' : 'Waxing Moon'}</p>
                <p className="text-xs text-gray-500">{currentLang === 'ru' ? 'Энергия роста' : 'Growth Energy'}</p>
              </>
            )}
          </Card>
        </div>

        {/* Featured Teacher */}
        {featuredTeacher && featuredTeacher.user && (
          <Card className="p-5 border-0 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">{t('teacherSpotlight')}</p>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <Link href={`/teacher/${featuredTeacher.id}`}>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  {featuredTeacher.user.avatarUrl ? (
                    <AvatarImage src={featuredTeacher.user.avatarUrl} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
                      {featuredTeacher.user.name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{featuredTeacher.user.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{featuredTeacher.bio || t('expertYogaTeacher')}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          </Card>
        )}

        {/* Popular Classes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{t('popularNow')}</h3>
            <Link href="/classes" className="text-sm text-purple-600 hover:text-purple-700">
              {tCommon('seeAll')}
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {popularClasses.map((cls) => (
              <Link key={cls.id} href={`/classes/${cls.id}`}>
                <Card className="w-36 p-3 border-0 shadow-sm hover:shadow-md transition-shadow flex-shrink-0">
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 mb-2 flex items-center justify-center relative">
                    {cls.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cls.thumbnailUrl} alt={cls.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Play className="w-6 h-6 text-purple-600" />
                    )}
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[10px]">#{popularClasses.indexOf(cls) + 1}</span>
                    </div>
                  </div>
                  <p className="font-medium text-xs text-gray-900 line-clamp-2">{cls.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{cls.durationMin} min</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest Classes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{t('justAdded')}</h3>
            <Link href="/classes" className="text-sm text-purple-600 hover:text-purple-700">
              {tCommon('seeAll')}
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {latestClasses.map((cls) => (
              <Link key={cls.id} href={`/classes/${cls.id}`}>
                <Card className="w-36 p-3 border-0 shadow-sm hover:shadow-md transition-shadow flex-shrink-0">
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 mb-2 flex items-center justify-center">
                    {cls.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cls.thumbnailUrl} alt={cls.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Zap className="w-6 h-6 text-indigo-500" />
                    )}
                  </div>
                  <p className="font-medium text-xs text-gray-900 line-clamp-2">{cls.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{cls.durationMin} min</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/browse">
            <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('explore')}</p>
                  <p className="text-xs text-gray-500">{t('allClasses')}</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/my_practice">
            <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('progress')}</p>
                  <p className="text-xs text-gray-500">{t('yourJourney')}</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Community Section */}
        <Card className="p-5 border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-gray-900">{t('community')}</p>
              </div>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">23</span> {t('yogisPracticingNow')}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-green-600">
              {t('joinLive')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}