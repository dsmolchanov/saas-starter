'use client';

import Link from 'next/link';
import { Clock, Heart, Headphones } from 'lucide-react';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type MeditationCardProps = {
  id: string;
  title: string;
  instructor?: string;
  duration: number;
  type?: string;
  focus?: string;
  thumbnailUrl?: string;
  likes?: number;
};

export function MeditationCard({
  id,
  title,
  instructor,
  duration,
  type = 'Guided',
  focus,
  thumbnailUrl,
  likes: initialLikes = 0,
}: MeditationCardProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the meditation is already favorited
  useEffect(() => {
    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        if (data.favorites) {
          const favorited = data.favorites.some(
            (f: any) => f.itemType === 'meditation' && f.itemId === id
          );
          setIsFavorited(favorited);
        }
      })
      .catch(console.error);
  }, [id]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: 'meditation',
          itemId: id,
          action: 'toggle',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
        setLikes(prev => data.isFavorited ? prev + 1 : Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format duration as "Xh Ym" or "Xm" if less than 60 minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };

  return (
    <div className="group overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <Link href={`/meditations/${id}`} className="block">
        <div className="relative aspect-video bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <Headphones className="h-12 w-12 text-purple-500/50" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(duration)}
          </div>
          {/* Favorite button overlay */}
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-2 shadow-sm transition-all hover:bg-white hover:scale-110"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"
              )} 
            />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {type}
            </Badge>
            {focus && (
              <Badge variant="outline" className="text-xs">
                {focus}
              </Badge>
            )}
          </div>

          <h3 className="mb-1 line-clamp-2 font-medium leading-tight">
            {title}
          </h3>
          {instructor && (
            <p className="mb-3 text-sm text-muted-foreground">{instructor}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className={cn(
                "h-3 w-3",
                isFavorited && "fill-current text-red-500"
              )} />
              <span>{likes}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Headphones className="h-3 w-3" />
              <span>Meditation</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}