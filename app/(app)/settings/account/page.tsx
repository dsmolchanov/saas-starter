import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, User, Mail, Camera, Shield, Key } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountSettingsPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in?redirect=/settings/account');
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
            <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Settings */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user.name || ''} placeholder="Your name" />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email || ''} disabled />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600">
            Save Changes
          </Button>
        </Card>

        {/* Security Settings */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Two-Factor Authentication
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-0 shadow-sm border-red-100">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
            Delete Account
          </Button>
        </Card>
      </div>
    </div>
  );
}