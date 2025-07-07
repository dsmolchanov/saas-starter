import Image from 'next/image';
import Link from 'next/link';

type InstructorCardProps = {
  id: number;
  name: string | null;
  imageUrl?: string | null;
  bio?: string | null;
  className?: string;
};

export function InstructorCard({ id, name, imageUrl, bio, className = '' }: InstructorCardProps) {
  const displayName = name || 'Instructor';
  
  return (
    <Link 
      href={`/instructors/${id}`}
      className={`group block ${className}`}
    >
      <div className="aspect-square rounded-full overflow-hidden bg-muted mb-3">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={displayName}
            width={200}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-2xl font-medium text-primary">
              {displayName[0]?.toUpperCase() || 'I'}
            </span>
          </div>
        )}
      </div>
      <div className="text-center">
        <h3 className="font-medium group-hover:text-primary transition-colors">
          {displayName}
        </h3>
        {bio && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {bio}
          </p>
        )}
      </div>
    </Link>
  );
}
