'use client';

import { useEffect } from 'react';

export function OAuthRedirectHandler() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    
    if (code) {
      console.log('🚨 OAuth code found on app page, redirecting to callback...');
      
      // Try to get the next parameter from URL first, then from localStorage
      let next = searchParams.get('next');
      if (!next) {
        next = localStorage.getItem('oauth_redirect_target');
        // Clean up the stored value
        localStorage.removeItem('oauth_redirect_target');
      }
      
      // Default to /my_practice if still no next parameter
      next = next || '/my_practice';
      
      const callbackUrl = `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;
      console.log('Redirecting to callback with next:', next);
      window.location.replace(callbackUrl);
    }
  }, []);
  
  return null;
} 