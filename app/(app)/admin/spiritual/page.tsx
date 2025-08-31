import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Moon, 
  BookOpen, 
  Calendar,
  Settings,
  ChevronRight
} from 'lucide-react';

export default async function AdminSpiritualPage() {
  const user = await getUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const sections = [
    {
      title: 'Chakra Management',
      description: 'Manage chakra information and daily focus schedule',
      icon: Sparkles,
      href: '/admin/spiritual/chakras',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Moon Phases',
      description: 'Configure moon phase data and practice guidelines',
      icon: Moon,
      href: '/admin/spiritual/moon-phases',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Yoga Quotes',
      description: 'Manage daily quotes and inspirational texts',
      icon: BookOpen,
      href: '/admin/spiritual/quotes',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Schedule Overview',
      description: 'View and manage the spiritual content calendar',
      icon: Calendar,
      href: '/admin/spiritual/calendar',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Spiritual Content Management</h1>
            <p className="text-gray-600">Manage chakras, moon phases, and daily yoga wisdom</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                  <p className="text-gray-600">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chakras</p>
              <p className="text-2xl font-bold">7</p>
            </div>
            <Sparkles className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Moon Phases</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <Moon className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Yoga Quotes</p>
              <p className="text-2xl font-bold">10+</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>
      </div>
    </div>
  );
}