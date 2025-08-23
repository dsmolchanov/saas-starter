import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Gift, Share2, Copy, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SharePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in?redirect=/share');
  }

  const shareUrl = `https://dzen.yoga/invite?ref=${user.id}`;
  const shareMessage = "Join me on Dzen Yoga! Get a free month of unlimited yoga classes. 🧘‍♀️";

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
            <h1 className="text-xl font-bold text-gray-900">Share Dzen Yoga</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Gift Card */}
        <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Give a Free Month</h2>
            <p className="text-gray-600">Share the gift of yoga with friends and family</p>
          </div>
        </Card>

        {/* Share Link */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Invite Link</h3>
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-600 break-all">{shareUrl}</p>
          </div>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </Card>

        {/* Share Options */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Via</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Twitter
            </Button>
          </div>
        </Card>

        {/* Benefits */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What Your Friends Get</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600">30 days of unlimited access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600">Access to all classes and programs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600">Personalized recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-600">No credit card required</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}