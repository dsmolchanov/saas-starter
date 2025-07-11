'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/hooks/useFavorites';

interface FavoriteButtonProps {
  lessonId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function FavoriteButton({ lessonId, className = "w-full", size = "lg", variant = "default" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { isLoading, toggleFavorite } = useFavorites();

  useEffect(() => {
    // Check if this lesson is already in favorites
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          const isInFavorites = data.favorites?.items?.some(
            (item: any) => item.itemType === 'lesson' && item.itemId === lessonId
          );
          setIsFavorite(!!isInFavorites);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkFavoriteStatus();
  }, [lessonId]);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(
        { itemType: 'lesson', itemId: lessonId },
        isFavorite
      );
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Could add a toast notification here
    }
  };

  if (isInitializing) {
    return (
      <Button disabled className={className} size={size} variant={variant}>
        <Heart className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={className}
      size={size}
      variant={isFavorite ? "secondary" : variant}
    >
      <Heart 
        className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} 
      />
      {isLoading 
        ? 'Updating...' 
        : isFavorite 
          ? 'Remove from Favorites' 
          : 'Add to Favorites'
      }
    </Button>
  );
} 