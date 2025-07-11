'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Activity } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const LogoIcon = ({ className }: { className?: string }) => (
  <Image src="/logo.svg" alt="Dzen Yoga" width={24} height={24} className={cn('object-contain h-5 w-5', className)} />
);

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: LogoIcon },
  { name: 'Browse', href: '/browse', icon: Search },
  { name: 'My Practice', href: '/my_practice', icon: Activity },
];

export function MobileNav() {
  const pathname = usePathname() || '';

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                         (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'text-muted-foreground hover:text-foreground transition-colors',
                isActive ? 'text-foreground' : ''
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : '')} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
