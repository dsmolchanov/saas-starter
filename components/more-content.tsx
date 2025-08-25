'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MyPlaylistsContent } from '@/components/my-playlists-content';
import { SignOutButton } from '@/components/sign-out-button';
import { CompactLanguageSwitcher } from '@/components/ui/language-switcher-compact';
import { useTranslations, useIntl } from '@/components/providers/simple-intl-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ChevronRight,
  Share2,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  Mail,
  Shield,
  Users,
  LogOut,
  User,
  Activity,
  Trophy,
  Calendar,
  Clock,
  Flame,
  TrendingUp,
  LayoutDashboard,
  GraduationCap,
  Heart,
  Star,
  Award,
  ListMusic,
  Globe
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl?: string | null;
  role: string;
  teacherProfile?: {
    id: string;
    bio?: string | null;
  } | null;
}

interface Stats {
  practiceMinutes: number;
  totalMinutes: number;
  sessions: number;
  activeDays: number;
  memberSince: Date;
  currentStreak: number;
  longestStreak: number;
}

interface MoreContentProps {
  user: User;
  stats: Stats;
}

export function MoreContent({ user, stats }: MoreContentProps) {
  const t = useTranslations('more');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const { locale, setLocale } = useIntl();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const router = useRouter();
  const isTeacher = user.role === 'teacher' || !!(user.teacherProfile && user.teacherProfile.id);
  const isAdmin = user.role === 'admin' || user.role === 'owner';
  
  const handleLanguageChange = (newLocale: 'ru' | 'es' | 'en') => {
    // Use the context's setLocale which handles localStorage
    setLocale(newLocale);
    setShowLanguageModal(false);
    // No need to refresh, context will trigger re-render
  };
  const formatDate = (date: Date) => {
    const localeMap = {
      'en': 'en-US',
      'ru': 'ru-RU',
      'es': 'es-ES'
    };
    return date.toLocaleDateString(localeMap[locale] || 'en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const menuItems: Array<{
    icon: any;
    label: string;
    href: string;
    description: string;
    iconColor: string;
    badge?: string;
    badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
    onClick?: string;
  }> = [
    ...(isAdmin ? [{
      icon: Shield,
      label: t('adminPanel'),
      href: '/admin',
      description: t('adminPanelDesc'),
      badge: t('adminBadge'),
      badgeVariant: 'destructive' as const,
      iconColor: 'text-red-600'
    }] : []),
    ...(isTeacher ? [{
      icon: LayoutDashboard,
      label: t('teacherAdmin'),
      href: '/teacher-admin',
      description: t('teacherAdminDesc'),
      badge: t('teacherBadge'),
      badgeVariant: 'default' as const,
      iconColor: 'text-purple-600'
    }] : []),
    {
      icon: ListMusic,
      label: t('myPlaylists'),
      href: '#playlists',
      description: t('myPlaylistsDesc'),
      iconColor: 'text-indigo-600',
      onClick: 'playlists'
    },
    {
      icon: Share2,
      label: t('shareDzenYoga'),
      href: '/share',
      description: t('shareDzenYogaDesc'),
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      label: t('community'),
      href: '/community',
      description: t('communityDesc'),
      iconColor: 'text-green-600'
    },
    {
      icon: MessageSquare,
      label: t('messages'),
      href: '/messages',
      description: t('messagesDesc'),
      iconColor: 'text-indigo-600'
    },
    {
      icon: Bell,
      label: t('notifications'),
      href: '/settings/notifications',
      description: t('notificationsDesc'),
      iconColor: 'text-orange-600'
    },
    {
      icon: Globe,
      label: t('language'),
      href: '#language',
      description: t('languageDesc'),
      iconColor: 'text-blue-600',
      onClick: 'language'
    },
    {
      icon: Settings,
      label: t('accountSettings'),
      href: '/settings/account',
      description: t('accountSettingsDesc'),
      iconColor: 'text-gray-600'
    },
    {
      icon: HelpCircle,
      label: t('faqInfo'),
      href: '/help',
      description: t('faqInfoDesc'),
      iconColor: 'text-teal-600'
    },
    {
      icon: Mail,
      label: t('contactSupport'),
      href: '/support',
      description: t('contactSupportDesc'),
      iconColor: 'text-pink-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeSection && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveSection(null)}
                  className="mr-2"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === 'playlists' ? t('myPlaylists') : tNav('more')}
              </h1>
            </div>
            <CompactLanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {activeSection === 'playlists' ? (
          <MyPlaylistsContent userId={user.id} isTeacher={isTeacher} />
        ) : (
          <>
        {/* User Profile Card */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-gray-100">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 text-xl">
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user.name || 'Yogi'}</h2>
              <p className="text-sm text-gray-500">{t('memberSince')} {formatDate(stats.memberSince)}</p>
              {isTeacher && (
                <Badge className="mt-1 bg-purple-100 text-purple-700 border-purple-200">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {t('teacherBadge')}
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.practiceMinutes)}</p>
              <p className="text-xs text-gray-500">{t('practiceMinutes')}</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalMinutes)}</p>
              <p className="text-xs text-gray-500">{t('totalMinutes')}</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.sessions)}</p>
              <p className="text-xs text-gray-500">{t('sessions')}</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeDays)}</p>
              <p className="text-xs text-gray-500">{t('activeDays')}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Streak Info */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {stats.currentStreak} {t('dayStreak')}
                </p>
                <p className="text-xs text-gray-600">
                  {t('longest')}: {stats.longestStreak} {t('days')}
                </p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            item.onClick ? (
              <Card 
                key={index} 
                className="p-4 border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                onClick={() => {
                  if (item.onClick === 'language') {
                    setShowLanguageModal(true);
                  } else {
                    setActiveSection(item.onClick || null);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        {item.badge && (
                          <Badge variant={item.badgeVariant} className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ) : (
              <Link key={index} href={item.href}>
                <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          {item.badge && (
                            <Badge variant={item.badgeVariant} className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
            )
          ))}
        </div>

        {/* Sign Out Button */}
        <SignOutButton />

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">{tCommon('appName')} v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">{t('madeWith')} {<Heart className="w-3 h-3 inline text-red-500" />} {t('forYogis')}</p>
        </div>
        </>
        )}
      </div>
      
      {/* Language Selection Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Language / Выберите язык / Elige idioma</DialogTitle>
            <DialogDescription>
              Select your preferred language for the app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Card 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleLanguageChange('ru')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇷🇺</span>
                  <div>
                    <p className="font-semibold">Русский</p>
                    <p className="text-sm text-gray-500">Russian</p>
                  </div>
                </div>
                {locale === 'ru' && (
                  <Badge className="bg-purple-100 text-purple-700">{t('current')}</Badge>
                )}
              </div>
            </Card>
            
            <Card 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleLanguageChange('es')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇪🇸</span>
                  <div>
                    <p className="font-semibold">Español</p>
                    <p className="text-sm text-gray-500">Spanish</p>
                  </div>
                </div>
                {locale === 'es' && (
                  <Badge className="bg-purple-100 text-purple-700">{t('current')}</Badge>
                )}
              </div>
            </Card>
            
            <Card 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleLanguageChange('en')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <p className="font-semibold">English</p>
                    <p className="text-sm text-gray-500">English</p>
                  </div>
                </div>
                {locale === 'en' && (
                  <Badge className="bg-purple-100 text-purple-700">{t('current')}</Badge>
                )}
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}