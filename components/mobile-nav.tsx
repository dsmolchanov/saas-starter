'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Activity, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/components/providers/simple-intl-provider';

type NavItem = {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const LogoIcon = ({ className }: { className?: string }) => (
  <img src="/favicon.ico" alt="Dzen Yoga" width={20} height={20} className={cn('object-contain h-5 w-5', className)} />
);

const navItems: NavItem[] = [
  { key: 'home', href: '/home', icon: LogoIcon },
  { key: 'browse', href: '/browse', icon: Search },
  { key: 'myPractice', href: '/my_practice', icon: Activity },
  { key: 'more', href: '/more', icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname() || '';
  const t = useTranslations('navigation');

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
              <span className="text-xs mt-1">{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
