'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { supabaseSignIn as signIn, supabaseSignUp as signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect');
  const priceId = searchParams?.get('priceId');
  const inviteId = searchParams?.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'signin'
            ? 'Sign in to your account'
            : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Google OAuth */}
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 rounded-full"
            onClick={async () => {
              const supabase = createClient();
              // Use environment variable if set, otherwise fall back to window.location.origin
              const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
              const target = redirect || '/my_practice';
              const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(target)}`;
              
              console.log('OAuth Debug Info:');
              console.log('- Origin:', origin);
              console.log('- Target:', target);
              console.log('- Redirect URL:', redirectUrl);
              console.log('- Current URL:', window.location.href);
              
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: redirectUrl
                }
              });
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3"><path fill="#4285f4" d="m533.5 278.4c0-17.5-1.5-35.3-4.7-52.4h-254v99.1h144.1c-6.2 33.4-24.8 61.5-52.9 80.7l85.6 66.6c50.1-46.1 79-114.1 79-193z"/><path fill="#34a853" d="m279 544.3c71.6 0 132-23.7 176-64.3l-85.6-66.6c-23.8 16-54.4 25.2-90.4 25.2-69.4 0-128-46.8-149-109.5l-87.2 67.5c42.3 84.1 131 147.7 236.2 147.7z"/><path fill="#fbbc04" d="m130 329.1c-9.8-29.4-9.8-61.4 0-90.8l-87.2-67.5c-38.3 75.6-38.3 164.5 0 240.1z"/><path fill="#ea4335" d="m279 107.7c38.9-.6 76.4 13.9 105.1 40.7l78.6-78.6c-48.3-44.9-112.6-69.3-183.6-69.8-105.1 0-193.9 63.6-236.2 147.8l87.2 67.5c21-62.8 79.6-109.6 149-109.6z"/></svg>
            Continue with Google
          </Button>
        </div>

        <form className="space-y-6" action={formAction} suppressHydrationWarning>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <div className="mt-1" suppressHydrationWarning>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={50}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                suppressHydrationWarning
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <div className="mt-1" suppressHydrationWarning>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                defaultValue={state.password}
                required
                minLength={8}
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                suppressHydrationWarning
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-red-500 text-sm">{state.error}</div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Sign up'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                {mode === 'signin'
                  ? 'New to our platform?'
                  : 'Already have an account?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
              }${priceId ? `${redirect ? '&' : '?'}priceId=${priceId}` : ''}`}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {mode === 'signin'
                ? 'Create an account'
                : 'Sign in to existing account'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
