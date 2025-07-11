'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams?.get('code');
    if (code) {
      // If there's an OAuth code on the home page, redirect to proper callback
      console.log('Found OAuth code on home page, redirecting to callback handler');
      const callbackUrl = `/auth/callback?code=${code}&next=${encodeURIComponent('/my_practice')}`;
      router.replace(callbackUrl);
    }
  }, [searchParams, router]);
  
  return null;
} 