'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">Oops!</h1>
              <h2 className="text-xl font-semibold text-gray-700">Something went wrong</h2>
              <p className="text-gray-600">
                We encountered an error. Please try again or go back to the home page.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                Try Again
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Go Home
                </Link>
              </Button>
            </div>
            
            {/* Multilingual fallback links */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Try in different languages:</p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link href="/" className="text-blue-600 hover:underline">
                  🇷🇺 Русский
                </Link>
                <Link href="/en" className="text-blue-600 hover:underline">
                  🇺🇸 English
                </Link>
                <Link href="/es-MX" className="text-blue-600 hover:underline">
                  🇲🇽 Español
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 