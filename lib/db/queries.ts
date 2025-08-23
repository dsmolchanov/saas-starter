import { desc, and, eq, isNull, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, playlists, playlistItems, classes, courses, teachers } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'string'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionData.user.id))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: string,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: string) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

// Playlist queries
export async function getUserPlaylists(userId: string) {
  return await db
    .select({
      id: playlists.id,
      name: playlists.name,
      description: playlists.description,
      isPublic: playlists.isPublic,
      isSystem: playlists.isSystem,
      playlistType: playlists.playlistType,
      coverUrl: playlists.coverUrl,
      createdAt: playlists.createdAt,
      updatedAt: playlists.updatedAt,
      itemCount: sql<number>`count(${playlistItems.id})::int`,
    })
    .from(playlists)
    .leftJoin(playlistItems, eq(playlists.id, playlistItems.playlistId))
    .where(eq(playlists.userId, userId))
    .groupBy(playlists.id)
    .orderBy(playlists.isSystem, playlists.createdAt);
}

export async function getPlaylistWithItems(playlistId: string) {
  const playlist = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, playlistId))
    .limit(1);

  if (!playlist.length) return null;

  const items = await db
    .select({
      id: playlistItems.id,
      itemType: playlistItems.itemType,
      itemId: playlistItems.itemId,
      orderIndex: playlistItems.orderIndex,
      addedAt: playlistItems.addedAt,
      lesson: {
        id: classes.id,
        title: classes.title,
        durationMin: classes.durationMin,
        difficulty: classes.difficulty,
        thumbnailUrl: classes.thumbnailUrl,
        imageUrl: classes.imageUrl,
      },
      course: {
        id: courses.id,
        title: courses.title,
        description: courses.description,
        level: courses.level,
        imageUrl: courses.imageUrl,
      },
      teacher: {
        id: teachers.id,
        bio: teachers.bio,
        userId: users.id,
        userName: users.name,
        userAvatarUrl: users.avatarUrl,
      },
    })
    .from(playlistItems)
    .leftJoin(classes, and(eq(playlistItems.itemType, 'lesson'), eq(playlistItems.itemId, classes.id)))
    .leftJoin(courses, and(eq(playlistItems.itemType, 'course'), eq(playlistItems.itemId, courses.id)))
    .leftJoin(teachers, and(eq(playlistItems.itemType, 'teacher'), eq(playlistItems.itemId, teachers.id)))
    .leftJoin(users, eq(teachers.id, users.id))
    .where(eq(playlistItems.playlistId, playlistId))
    .orderBy(playlistItems.orderIndex, playlistItems.addedAt);

  return {
    ...playlist[0],
    items: items.map(item => ({
      id: item.id,
      itemType: item.itemType,
      itemId: item.itemId,
      orderIndex: item.orderIndex,
      addedAt: item.addedAt,
      data: item.itemType === 'lesson' ? item.lesson 
            : item.itemType === 'course' ? item.course 
            : item.teacher,
    })),
  };
}

export async function createPlaylist(data: {
  userId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  playlistType?: string;
}) {
  const [playlist] = await db
    .insert(playlists)
    .values({
      userId: data.userId,
      name: data.name,
      description: data.description,
      isPublic: data.isPublic ? 1 : 0,
      playlistType: data.playlistType || 'custom',
    })
    .returning();

  return playlist;
}

export async function addToPlaylist(data: {
  playlistId: string;
  itemType: 'lesson' | 'course' | 'teacher';
  itemId: string;
  addedBy: string;
  orderIndex?: number;
}) {
  // Check if item already exists in playlist
  const existing = await db
    .select()
    .from(playlistItems)
    .where(
      and(
        eq(playlistItems.playlistId, data.playlistId),
        eq(playlistItems.itemType, data.itemType),
        eq(playlistItems.itemId, data.itemId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Item already exists in playlist');
  }

  // If no order index provided, add to end
  let orderIndex = data.orderIndex;
  if (orderIndex === undefined) {
    const lastItem = await db
      .select({ orderIndex: playlistItems.orderIndex })
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, data.playlistId))
      .orderBy(desc(playlistItems.orderIndex))
      .limit(1);
    
    orderIndex = lastItem.length > 0 ? (lastItem[0].orderIndex || 0) + 1 : 0;
  }

  const [item] = await db
    .insert(playlistItems)
    .values({
      playlistId: data.playlistId,
      itemType: data.itemType,
      itemId: data.itemId,
      addedBy: data.addedBy,
      orderIndex,
    })
    .returning();

  return item;
}

export async function removeFromPlaylist(playlistId: string, itemType: string, itemId: string) {
  return await db
    .delete(playlistItems)
    .where(
      and(
        eq(playlistItems.playlistId, playlistId),
        eq(playlistItems.itemType, itemType),
        eq(playlistItems.itemId, itemId)
      )
    );
}

// DEPRECATED: These functions are replaced by the new favorites table and "Liked" playlist system
// The new system uses database triggers to automatically sync favorites with the Liked playlist
// See /api/favorites for the new implementation

/* 
export async function getFavoritesPlaylist(userId: string) {
  let favoritesPlaylist = await db
    .select()
    .from(playlists)
    .where(
      and(
        eq(playlists.userId, userId),
        eq(playlists.playlistType, 'favorites')
      )
    )
    .limit(1);

  // Create favorites playlist if it doesn't exist
  if (!favoritesPlaylist.length) {
    const [newPlaylist] = await db
      .insert(playlists)
      .values({
        userId,
        name: 'Favorites',
        isSystem: 1,
        playlistType: 'favorites',
      })
      .returning();
    
    favoritesPlaylist = [newPlaylist];
  }

  return await getPlaylistWithItems(favoritesPlaylist[0].id);
}

export async function addToFavorites(userId: string, itemType: 'lesson' | 'course' | 'teacher', itemId: string) {
  const favoritesPlaylist = await getFavoritesPlaylist(userId);
  
  if (!favoritesPlaylist) {
    throw new Error('Failed to create or retrieve favorites playlist');
  }
  
  return await addToPlaylist({
    playlistId: favoritesPlaylist.id,
    itemType,
    itemId,
    addedBy: userId,
  });
}

export async function removeFromFavorites(userId: string, itemType: 'lesson' | 'course' | 'teacher', itemId: string) {
  const favoritesPlaylist = await getFavoritesPlaylist(userId);
  
  if (!favoritesPlaylist) {
    throw new Error('Failed to create or retrieve favorites playlist');
  }
  
  return await removeFromPlaylist(favoritesPlaylist.id, itemType, itemId);
}

export async function checkIfFavorite(userId: string, itemType: 'lesson' | 'course' | 'teacher', itemId: string) {
  const favoritesPlaylist = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(
      and(
        eq(playlists.userId, userId),
        eq(playlists.playlistType, 'favorites')
      )
    )
    .limit(1);

  if (!favoritesPlaylist.length) return false;

  const favorite = await db
    .select()
    .from(playlistItems)
    .where(
      and(
        eq(playlistItems.playlistId, favoritesPlaylist[0].id),
        eq(playlistItems.itemType, itemType),
        eq(playlistItems.itemId, itemId)
      )
    )
    .limit(1);

  return favorite.length > 0;
}
*/
