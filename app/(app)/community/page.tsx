import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Users, Trophy, Flame, Target, MessageCircle, Heart } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/');
  }

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
            <h1 className="text-xl font-bold text-gray-900">Community</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Active Now */}
        <Card className="p-6 border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Active Now</h2>
            </div>
            <Badge className="bg-green-100 text-green-700">23 yogis</Badge>
          </div>
          <p className="text-sm text-gray-600">Join live sessions and practice together</p>
          <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
            Join Live Session
          </Button>
        </Card>

        {/* Challenges */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Current Challenges</h2>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">30-Day Morning Flow</p>
                  <p className="text-xs text-gray-500">234 participants • 5 days left</p>
                </div>
                <Badge variant="secondary">Joined</Badge>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">Flexibility Challenge</p>
                  <p className="text-xs text-gray-500">567 participants • 12 days left</p>
                </div>
                <Button size="sm" variant="outline">Join</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Top Streaks</h2>
            </div>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Sarah M.', streak: 365, avatar: '👑' },
              { rank: 2, name: 'Alex K.', streak: 234, avatar: '🥈' },
              { rank: 3, name: 'Maya R.', streak: 189, avatar: '🥉' },
              { rank: 15, name: 'You', streak: 45, avatar: '🧘', isUser: true },
            ].map((item) => (
              <div key={item.rank} className={`flex items-center gap-3 p-2 rounded-lg ${item.isUser ? 'bg-purple-50' : ''}`}>
                <span className="text-lg font-bold text-gray-500 w-8">#{item.rank}</span>
                <span className="text-2xl">{item.avatar}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.streak} day streak</p>
                </div>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
            ))}
          </div>
        </Card>

        {/* Discussion */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Discussions</h2>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 text-sm">Tips for morning practice?</p>
              <p className="text-xs text-gray-500 mt-1">23 replies • 2 hours ago</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 text-sm">Favorite yoga mat recommendations</p>
              <p className="text-xs text-gray-500 mt-1">45 replies • 5 hours ago</p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            View All Discussions
          </Button>
        </Card>
      </div>
    </div>
  );
}