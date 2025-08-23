'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MyPlaylists } from '@/components/my-playlists';
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
  ListMusic
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const isTeacher = user.role === 'teacher' || !!user.teacherProfile;
  const isAdmin = user.role === 'admin' || user.role === 'owner';
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
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
      label: 'Admin Panel',
      href: '/admin',
      description: 'System administration and management',
      badge: 'Admin',
      badgeVariant: 'destructive' as const,
      iconColor: 'text-red-600'
    }] : []),
    ...(isTeacher ? [{
      icon: LayoutDashboard,
      label: 'Teacher Admin',
      href: '/teacher-admin',
      description: 'Manage your courses and content',
      badge: 'Teacher',
      badgeVariant: 'default' as const,
      iconColor: 'text-purple-600'
    }] : []),
    {
      icon: ListMusic,
      label: 'My Playlists',
      href: '#playlists',
      description: 'Manage your practice collections',
      iconColor: 'text-indigo-600',
      onClick: 'playlists'
    },
    {
      icon: Share2,
      label: 'Share Dzen Yoga',
      href: '/share',
      description: 'Give a free month of unlimited access',
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      label: 'Community',
      href: '/community',
      description: 'Connect with other yogis',
      iconColor: 'text-green-600'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      href: '/messages',
      description: 'Your conversations',
      iconColor: 'text-indigo-600'
    },
    {
      icon: Bell,
      label: 'Notifications & Reminders',
      href: '/settings/notifications',
      description: 'Manage your alerts',
      iconColor: 'text-orange-600'
    },
    {
      icon: Settings,
      label: 'Account Settings',
      href: '/settings/account',
      description: 'Profile and preferences',
      iconColor: 'text-gray-600'
    },
    {
      icon: HelpCircle,
      label: 'FAQ & Info',
      href: '/help',
      description: 'Get answers to common questions',
      iconColor: 'text-teal-600'
    },
    {
      icon: Mail,
      label: 'Contact Support',
      href: '/support',
      description: 'We\'re here to help',
      iconColor: 'text-pink-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container max-w-md mx-auto px-4 py-6">
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
              {activeSection === 'playlists' ? 'My Playlists' : 'More'}
            </h1>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {activeSection === 'playlists' ? (
          <MyPlaylists userId={user.id} isTeacher={isTeacher} />
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
              <p className="text-sm text-gray-500">Member Since {formatDate(stats.memberSince)}</p>
              {isTeacher && (
                <Badge className="mt-1 bg-purple-100 text-purple-700 border-purple-200">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  Teacher
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
              <p className="text-xs text-gray-500">Practice Minutes</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalMinutes)}</p>
              <p className="text-xs text-gray-500">Total Minutes</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.sessions)}</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeDays)}</p>
              <p className="text-xs text-gray-500">Active Days</p>
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
                  {stats.currentStreak} Day Streak
                </p>
                <p className="text-xs text-gray-600">
                  Longest: {stats.longestStreak} days
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
                onClick={() => setActiveSection(item.onClick || null)}
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
        <Card className="p-4 border-0 shadow-sm">
          <Link href="/api/auth/signout">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-600">Sign Out</p>
                  <p className="text-xs text-gray-500">Log out of your account</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        </Card>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Dzen Yoga v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Made with {<Heart className="w-3 h-3 inline text-red-500" />} for yogis</p>
        </div>
        </>
        )}
      </div>
    </div>
  );
}