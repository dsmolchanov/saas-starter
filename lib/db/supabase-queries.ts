import { supabaseDb } from './drizzle';
import { 
  users, 
  playlists, 
  playlistItems, 
  lessons, 
  courses, 
  teachers,
  categories,
  focusAreas,
  lessonFocusAreas,
  progress,
  subscriptions
} from './supabase-schema';
import { sql, eq, and, desc } from 'drizzle-orm';

// Playlist queries for Supabase (using UUIDs)
export async function getUserPlaylistsSupabase(userId: string) {
  return await supabaseDb
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

export async function getPlaylistWithItemsSupabase(playlistId: string) {
  const playlist = await supabaseDb
    .select()
    .from(playlists)
    .where(eq(playlists.id, playlistId))
    .limit(1);

  if (!playlist.length) return null;

  const items = await supabaseDb
    .select({
      id: playlistItems.id,
      itemType: playlistItems.itemType,
      itemId: playlistItems.itemId,
      orderIndex: playlistItems.orderIndex,
      addedAt: playlistItems.addedAt,
      lesson: {
        id: lessons.id,
        title: lessons.title,
        durationMin: lessons.durationMin,
        difficulty: lessons.difficulty,
        thumbnailUrl: lessons.thumbnailUrl,
        imageUrl: lessons.imageUrl,
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
        user: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
      },
    })
    .from(playlistItems)
    .leftJoin(lessons, and(eq(playlistItems.itemType, 'lesson'), eq(playlistItems.itemId, lessons.id)))
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

export async function createPlaylistSupabase(data: {
  userId: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  playlistType?: string;
}) {
  const [playlist] = await supabaseDb
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

export async function addToPlaylistSupabase(data: {
  playlistId: string;
  itemType: 'lesson' | 'course' | 'teacher';
  itemId: string;
  addedBy: string;
  orderIndex?: number;
}) {
  // Check if item already exists in playlist
  const existing = await supabaseDb
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
    const lastItem = await supabaseDb
      .select({ orderIndex: playlistItems.orderIndex })
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, data.playlistId))
      .orderBy(desc(playlistItems.orderIndex))
      .limit(1);
    
    orderIndex = lastItem.length > 0 ? (lastItem[0].orderIndex || 0) + 1 : 0;
  }

  const [item] = await supabaseDb
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

export async function removeFromPlaylistSupabase(playlistId: string, itemType: string, itemId: string) {
  return await supabaseDb
    .delete(playlistItems)
    .where(
      and(
        eq(playlistItems.playlistId, playlistId),
        eq(playlistItems.itemType, itemType),
        eq(playlistItems.itemId, itemId)
      )
    );
}

export async function getFavoritesPlaylistSupabase(userId: string) {
  let favoritesPlaylist = await supabaseDb
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
    const [newPlaylist] = await supabaseDb
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

  return await getPlaylistWithItemsSupabase(favoritesPlaylist[0].id);
}

export async function addToFavoritesSupabase(userId: string, itemType: 'lesson' | 'course' | 'teacher', itemId: string) {
  const favoritesPlaylist = await getFavoritesPlaylistSupabase(userId);
  
  return await addToPlaylistSupabase({
    playlistId: favoritesPlaylist.id,
    itemType,
    itemId,
    addedBy: userId,
  });
}

export async function removeFromFavoritesSupabase(userId: string, itemType: 'lesson' | 'course' | 'teacher', itemId: string) {
  const favoritesPlaylist = await getFavoritesPlaylistSupabase(userId);
  
  return await removeFromPlaylistSupabase(favoritesPlaylist.id, itemType, itemId);
}

export async function checkIfFavoriteSupabase(userId: string, itemType: 'lesson' | 'course' | 'teacher', itemId: string) {
  const favoritesPlaylist = await supabaseDb
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

  const favorite = await supabaseDb
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

// Additional Supabase-specific queries
export async function getBrowseDataSupabase() {
  const [categoriesData, lessonsData, coursesData, teachersData, focusAreasData] = await Promise.all([
    supabaseDb.select().from(categories),
    supabaseDb
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        durationMin: lessons.durationMin,
        difficulty: lessons.difficulty,
        intensity: lessons.intensity,
        style: lessons.style,
        equipment: lessons.equipment,
        thumbnailUrl: lessons.thumbnailUrl,
        imageUrl: lessons.imageUrl,
        course: {
          id: courses.id,
          title: courses.title,
        },
      })
      .from(lessons)
      .leftJoin(courses, eq(lessons.courseId, courses.id)),
    supabaseDb
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        level: courses.level,
        imageUrl: courses.imageUrl,
        teacher: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
        lessonCount: sql<number>`count(${lessons.id})::int`,
      })
      .from(courses)
      .leftJoin(teachers, eq(courses.teacherId, teachers.id))
      .leftJoin(users, eq(teachers.id, users.id))
      .leftJoin(lessons, eq(courses.id, lessons.courseId))
      .where(eq(courses.isPublished, 1))
      .groupBy(courses.id, users.id),
    supabaseDb
      .select({
        id: teachers.id,
        bio: teachers.bio,
        user: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
        courseCount: sql<number>`count(${courses.id})::int`,
      })
      .from(teachers)
      .leftJoin(users, eq(teachers.id, users.id))
      .leftJoin(courses, eq(teachers.id, courses.teacherId))
      .groupBy(teachers.id, users.id),
    supabaseDb.select().from(focusAreas),
  ]);

  return {
    categories: categoriesData,
    lessons: lessonsData,
    courses: coursesData,
    teachers: teachersData,
    focusAreas: focusAreasData,
  };
} 