'use client';

import { useEffect } from 'react';

export function OAuthRedirectHandler() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    
    if (code) {
      console.log('🚨 OAuth code found on app page, redirecting to callback...');
      console.log('Current URL:', window.location.href);
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      // Try to get the next parameter from URL first, then from localStorage
      let next = searchParams.get('next');
      console.log('Next from URL params:', next);
      
      if (!next) {
        next = localStorage.getItem('oauth_redirect_target');
        console.log('Next from localStorage:', next);
        // Clean up the stored value
        if (next) {
          localStorage.removeItem('oauth_redirect_target');
        }
      }
      
      // Default to /my_practice if still no next parameter
      next = next || '/my_practice';
      console.log('Final next destination:', next);
      
      const callbackUrl = `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;
      console.log('Redirecting to callback URL:', callbackUrl);
      
      // Use window.location.href instead of replace to ensure the redirect works
      window.location.href = callbackUrl;
    }
  }, []);
  
  return null;
} 