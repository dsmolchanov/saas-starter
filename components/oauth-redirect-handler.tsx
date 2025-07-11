'use client';

import { useEffect } from 'react';

export function OAuthRedirectHandler() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    
    if (code) {
      console.log('🚨 OAuth code found on app page, redirecting to callback...');
      const next = searchParams.get('next') || '/my_practice';
      const callbackUrl = `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;
      window.location.replace(callbackUrl);
    }
  }, []);
  
  return null;
} 