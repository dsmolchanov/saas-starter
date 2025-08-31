import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { playlists, playlistItems, classes, meditationSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import PlaylistView from './playlist-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaylistPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getUser();

  // Fetch playlist
  const playlist = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
  });

  if (!playlist) {
    notFound();
  }

  // Check access permissions
  const isOwner = user?.id === playlist.userId;
  const isPublic = playlist.visibility === 'public' || playlist.isPublic === 1;
  const isUnlisted = playlist.visibility === 'unlisted';

  // If private and not owner, deny access
  if (!isPublic && !isUnlisted && !isOwner) {
    notFound();
  }

  // Fetch playlist items with their content
  const items = await db
    .select({
      item: playlistItems,
      class: classes,
      meditation: meditationSessions,
    })
    .from(playlistItems)
    .leftJoin(classes, eq(classes.id, playlistItems.itemId))
    .leftJoin(meditationSessions, eq(meditationSessions.id, playlistItems.itemId))
    .where(eq(playlistItems.playlistId, id))
    .orderBy(playlistItems.orderIndex);

  // Format items for display
  const formattedItems = items
    .map(({ item, class: classData, meditation }) => {
      if (item.itemType === 'class' && classData) {
        return {
          id: classData.id,
          type: 'class' as const,
          title: classData.title,
          description: classData.description,
          duration: classData.durationMin,
          thumbnailUrl: classData.thumbnailUrl || classData.coverUrl,
          teacherId: classData.teacherId,
        };
      } else if (item.itemType === 'meditation' && meditation) {
        return {
          id: meditation.id,
          type: 'meditation' as const,
          title: meditation.title,
          description: meditation.description,
          duration: meditation.durationMin,
          thumbnailUrl: meditation.thumbnailUrl,
          teacherId: meditation.teacherId,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <PlaylistView
      playlist={playlist}
      items={formattedItems}
      isOwner={isOwner}
      currentUser={user}
    />
  );
}