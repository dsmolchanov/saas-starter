'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, 
  Loader2,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export function LoginPasswordless({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/home';
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === 'signup',
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 bg-white">
      <div className="mx-auto w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-6">
            <div className="w-2 h-2 bg-gray-900 rounded-full" />
          </div>
          <h1 className="text-xl font-medium text-gray-900">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            We'll send you a magic link to sign in
          </p>
        </div>

        <div className="space-y-6">
          {!success ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-normal text-gray-600">
                  Email
                </Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-lg border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors"
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full h-11 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-normal transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Send Magic Link</>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-600">
                We sent a magic link to <span className="font-medium">{email}</span>
              </p>
              <p className="text-xs text-gray-500">
                Click the link in the email to sign in. The link expires in 60 minutes.
              </p>
              
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={async () => {
              const target = redirect || '/home';
              localStorage.setItem('oauth_redirect_target', target);
              const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`;
              
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: redirectUrl
                }
              });
            }}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 533.5 544.3">
              <path fill="#4285f4" d="m533.5 278.4c0-17.5-1.5-35.3-4.7-52.4h-254v99.1h144.1c-6.2 33.4-24.8 61.5-52.9 80.7l85.6 66.6c50.1-46.1 79-114.1 79-193z"/>
              <path fill="#34a853" d="m279 544.3c71.6 0 132-23.7 176-64.3l-85.6-66.6c-23.8 16-54.4 25.2-90.4 25.2-69.4 0-128-46.8-149-109.5l-87.2 67.5c42.3 84.1 131 147.7 236.2 147.7z"/>
              <path fill="#fbbc04" d="m130 329.1c-9.8-29.4-9.8-61.4 0-90.8l-87.2-67.5c-38.3 75.6-38.3 164.5 0 240.1z"/>
              <path fill="#ea4335" d="m279 107.7c38.9-.6 76.4 13.9 105.1 40.7l78.6-78.6c-48.3-44.9-112.6-69.3-183.6-69.8-105.1 0-193.9 63.6-236.2 147.8l87.2 67.5c21-62.8 79.6-109.6 149-109.6z"/>
            </svg>
            <span className="text-sm">Continue with Google</span>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={mode === 'signin' ? '/sign-up' : '/sign-in'}
              className="text-gray-900 hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}