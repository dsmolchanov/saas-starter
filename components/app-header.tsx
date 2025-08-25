'use client';

import { CompactLanguageSwitcher } from '@/components/ui/language-switcher-compact';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/components/providers/simple-intl-provider';

export function AppHeader() {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  
  const getPageTitle = () => {
    if (pathname === '/' || pathname === '/home') return t('home');
    if (pathname === '/browse') return t('browse');
    if (pathname === '/my_practice') return t('myPractice');
    if (pathname === '/more') return t('more');
    if (pathname === '/classes') return t('classes');
    if (pathname === '/courses') return t('courses');
    if (pathname === '/teachers') return t('teachers');
    if (pathname === '/community') return t('community');
    if (pathname === '/messages') return t('messages');
    if (pathname === '/teacher-admin') return t('admin');
    return '';
  };

  const title = getPageTitle();
  
  // Only show header on main pages
  const showHeader = ['/', '/home', '/browse', '/my_practice', '/more', '/classes', '/courses', '/teachers', '/community', '/messages', '/teacher-admin'].includes(pathname);
  
  if (!showHeader) return null;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <CompactLanguageSwitcher />
      </div>
    </header>
  );
}