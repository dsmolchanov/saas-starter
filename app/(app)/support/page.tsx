import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Mail, MessageSquare, Phone } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
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
            <h1 className="text-xl font-bold text-gray-900">Contact Support</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Contact Methods */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 border-0 shadow-sm text-center">
            <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-xs text-gray-500">support@dzen.yoga</p>
          </Card>
          <Card className="p-4 border-0 shadow-sm text-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Live Chat</p>
            <p className="text-xs text-gray-500">Available 9-5 PST</p>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h2>
          
          <form className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="What can we help you with?" 
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select 
                id="category"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Technical Issue</option>
                <option>Billing Question</option>
                <option>Account Help</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Please describe your issue or question in detail..."
                rows={5}
              />
            </div>

            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              Send Message
            </Button>
          </form>
        </Card>

        {/* Response Time */}
        <Card className="p-4 border-0 shadow-sm bg-blue-50">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Average response time:</span> We typically respond within 24 hours during business days.
          </p>
        </Card>
      </div>
    </div>
  );
}