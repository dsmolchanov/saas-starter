'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  href: string;
  image?: string | null;
  title: string;
  subtitle?: string;
  description?: string | null;
  duration?: number;
  difficulty?: string | null;
  instructor?: string | null;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait';
  size?: 'sm' | 'md' | 'lg';
  showHoverEffect?: boolean;
}

const sizeClasses = {
  sm: 'min-w-[200px] max-w-[200px]',
  md: 'min-w-[280px] max-w-[280px]',
  lg: 'min-w-[360px] max-w-[360px]',
};

const aspectClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
};

export function ContentCard({
  href,
  image,
  title,
  subtitle,
  description,
  duration,
  difficulty,
  instructor,
  badge,
  badgeVariant = 'default',
  className,
  aspectRatio = 'video',
  size = 'md',
  showHoverEffect = true,
}: ContentCardProps) {
  return (
    <Link href={href} className={cn('block', sizeClasses[size], className)}>
      <Card className={cn(
        'overflow-hidden border-0 shadow-sm transition-all duration-200',
        showHoverEffect && 'hover:shadow-lg hover:-translate-y-1',
        'bg-background'
      )}>
        {/* Image Container with Fixed Aspect Ratio */}
        <div className={cn(
          'relative overflow-hidden bg-muted',
          aspectClasses[aspectRatio]
        )}>
          {image ? (
            <>
              <Image
                src={image}
                alt={title}
                fill
                sizes={`(max-width: 768px) 100vw, ${size === 'sm' ? '200px' : size === 'md' ? '280px' : '360px'}`}
                className={cn(
                  'object-cover',
                  showHoverEffect && 'transition-transform duration-300 group-hover:scale-105'
                )}
              />
              {/* Gradient Overlay for Better Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <div className="text-4xl text-purple-300">🧘</div>
            </div>
          )}
          
          {/* Badge Overlay */}
          {badge && (
            <Badge 
              variant={badgeVariant}
              className="absolute top-2 right-2 backdrop-blur-sm bg-background/80"
            >
              {badge}
            </Badge>
          )}
        </div>

        {/* Content Container with Consistent Height */}
        <div className="p-4 space-y-2">
          {/* Title - Always visible, truncated if too long */}
          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {subtitle}
            </p>
          )}

          {/* Description - Optional, hidden on small cards */}
          {description && size !== 'sm' && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{duration} min</span>
              </div>
            )}
            
            {difficulty && (
              <div className="flex items-center gap-1">
                <BarChart className="h-3 w-3" />
                <span className="capitalize">{difficulty}</span>
              </div>
            )}
            
            {instructor && (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{instructor}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Grid wrapper component for consistent spacing
export function ContentCardGrid({ 
  children,
  className,
  columns = 'auto',
}: { 
  children: React.ReactNode;
  className?: string;
  columns?: 'auto' | 2 | 3 | 4 | 5 | 6;
}) {
  const gridCols = {
    'auto': 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4', 
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <div className={cn(
      'grid gap-4',
      typeof columns === 'number' ? gridCols[columns] : gridCols.auto,
      className
    )}>
      {children}
    </div>
  );
}

// Horizontal scroll wrapper for Netflix-like experience
export function ContentCardScroll({ 
  children,
  className,
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide',
      '-mx-4 px-4 md:mx-0 md:px-0',
      className
    )}>
      {React.Children.map(children, (child, index) => (
        <div key={index} className="snap-start flex-shrink-0">
          {child}
        </div>
      ))}
    </div>
  );
}