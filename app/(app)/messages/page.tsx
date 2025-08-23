import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in?redirect=/messages');
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
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Messages Yet</h2>
          <p className="text-gray-500 text-center max-w-xs">
            Connect with teachers and fellow yogis to start conversations
          </p>
          <Button className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600">
            Browse Community
          </Button>
        </div>
      </div>
    </div>
  );
}