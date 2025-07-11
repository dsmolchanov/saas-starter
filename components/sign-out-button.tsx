'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SignOutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function SignOutButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  showIcon = true,
  children 
}: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear session cookie by calling our server action
      await fetch('/api/auth/signout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear local storage
        localStorage.clear();
        // Clear session storage
        sessionStorage.clear();
      }
      
      console.log('Successfully signed out');
      
      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, still redirect to be safe
      router.push('/');
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleSignOut}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children || 'Sign Out'}
    </Button>
  );
} 