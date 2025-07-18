import Link from 'next/link';
import { Button } from '@/components/ui/button';

// This is a static not-found page that doesn't use i18n
// to avoid dynamic server usage during static generation
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <h2 className="text-xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/my_practice">
              My Practice
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
  );
}
