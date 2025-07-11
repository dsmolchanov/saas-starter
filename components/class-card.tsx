import Link from 'next/link';
import { Clock, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Image from 'next/image';

type ClassCardProps = {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  difficulty: string;
  intensity: string;
  focusAreas: string[];
  thumbnailUrl?: string;
  likes: number;
};

export function ClassCard({
  id,
  title,
  instructor,
  duration,
  difficulty,
  intensity,
  focusAreas = [],
  thumbnailUrl,
  likes,
}: ClassCardProps) {
  // Format duration as "Xh Ym" or "Xm" if less than 60 minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="group overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <Link href={`/classes/${id}`} className="block">
        <div className="relative aspect-video bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-lg font-medium text-muted-foreground">
                {title[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            {formatDuration(duration)}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {intensity}
            </Badge>
          </div>

          <h3 className="mb-1 line-clamp-2 font-medium leading-tight">
            {title}
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">{instructor}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3" />
              <span>{likes}</span>
            </div>

            {focusAreas.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1">
                {focusAreas.slice(0, 2).map((area) => (
                  <Badge
                    key={area}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {area}
                  </Badge>
                ))}
                {focusAreas.length > 2 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{focusAreas.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
