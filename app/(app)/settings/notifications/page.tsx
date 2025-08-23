import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Bell, Clock, Mail, MessageSquare, Heart, Trophy } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NotificationSettingsPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in?redirect=/settings/notifications');
  }

  const notificationSettings = [
    {
      category: 'Practice Reminders',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      settings: [
        { id: 'daily-reminder', label: 'Daily practice reminder', enabled: true },
        { id: 'streak-reminder', label: 'Streak reminders', enabled: true },
        { id: 'goal-reminder', label: 'Goal progress updates', enabled: false },
      ]
    },
    {
      category: 'Social',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      settings: [
        { id: 'new-message', label: 'New messages', enabled: true },
        { id: 'new-follower', label: 'New followers', enabled: true },
        { id: 'class-comment', label: 'Comments on your classes', enabled: true },
      ]
    },
    {
      category: 'Updates',
      icon: Bell,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      settings: [
        { id: 'new-classes', label: 'New classes from favorite teachers', enabled: true },
        { id: 'challenges', label: 'Community challenges', enabled: false },
        { id: 'tips', label: 'Yoga tips and insights', enabled: true },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/more">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Notifications & Reminders</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Master Switch */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">All Notifications</p>
                <p className="text-sm text-gray-500">Master control for all alerts</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>

        {/* Notification Categories */}
        {notificationSettings.map((category) => (
          <Card key={category.category} className="p-6 border-0 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 ${category.bgColor} rounded-full flex items-center justify-center`}>
                <category.icon className={`w-4 h-4 ${category.color}`} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{category.category}</h2>
            </div>
            
            <div className="space-y-4">
              {category.settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <Label htmlFor={setting.id} className="text-sm font-normal text-gray-700 cursor-pointer">
                    {setting.label}
                  </Label>
                  <Switch id={setting.id} defaultChecked={setting.enabled} />
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Notification Methods */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Methods</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-600" />
                <Label htmlFor="push" className="text-sm font-normal text-gray-700 cursor-pointer">
                  Push Notifications
                </Label>
              </div>
              <Switch id="push" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <Label htmlFor="email" className="text-sm font-normal text-gray-700 cursor-pointer">
                  Email Notifications
                </Label>
              </div>
              <Switch id="email" defaultChecked />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}