"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCallback } from 'react';

interface TabManagerProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function TabManager({ defaultValue, className, children }: TabManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleTabChange = useCallback((value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', value);
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/my_practice${query}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <Tabs 
      defaultValue={defaultValue} 
      value={searchParams.get('tab') || defaultValue}
      onValueChange={handleTabChange}
      className={className}
    >
      {children}
    </Tabs>
  );
}