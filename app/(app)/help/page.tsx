import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, HelpCircle, BookOpen, CreditCard, Users, Shield, Video, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HelpPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/');
  }

  const helpCategories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of using Dzen Yoga',
      articles: 5,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Video,
      title: 'Classes & Content',
      description: 'How to find and play classes',
      articles: 8,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: CreditCard,
      title: 'Billing & Subscription',
      description: 'Manage your subscription and payments',
      articles: 6,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Connect with other yogis',
      articles: 4,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Shield,
      title: 'Account & Security',
      description: 'Keep your account safe',
      articles: 7,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Settings,
      title: 'Technical Issues',
      description: 'Troubleshooting common problems',
      articles: 9,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
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
            <h1 className="text-xl font-bold text-gray-900">FAQ & Info</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </Card>

        {/* Popular Questions */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Questions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">How do I cancel my subscription?</p>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">Can I download classes for offline use?</p>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">How do I become a teacher?</p>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </Card>

        {/* Help Categories */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 px-1">Browse by Category</h2>
          {helpCategories.map((category, index) => (
            <Card key={index} className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.title}</p>
                    <p className="text-xs text-gray-500">{category.articles} articles</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="p-6 border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-sm text-gray-600 mb-4">Our support team is here to assist you</p>
          <Link href="/support">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              Contact Support
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}