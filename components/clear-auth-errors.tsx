'use client';

import { useEffect } from 'react';

export function ClearAuthErrors() {
  useEffect(() => {
    if (window.location.hash) {
      if (window.location.hash.includes('error=') || window.location.hash.includes('flow_state')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, []);
  
  return null;
} 