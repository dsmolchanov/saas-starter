import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { playlists, playlistItems, playlistFollowers, users } from '@/lib/db/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's playlists
    const userPlaylists = await db
      .select({
        playlist: playlists,
        itemCount: sql<number>`COUNT(DISTINCT ${playlistItems.id})`,
        followerCount: sql<number>`COUNT(DISTINCT ${playlistFollowers.id})`,
      })
      .from(playlists)
      .leftJoin(playlistItems, eq(playlistItems.playlistId, playlists.id))
      .leftJoin(playlistFollowers, eq(playlistFollowers.playlistId, playlists.id))
      .where(
        or(
          eq(playlists.userId, user.id),
          eq(playlists.teacherId, user.id)
        )
      )
      .groupBy(playlists.id)
      .orderBy(desc(playlists.updatedAt));

    // Format playlists with additional info
    const formattedPlaylists = userPlaylists.map(({ playlist, itemCount, followerCount }) => ({
      ...playlist,
      totalItems: itemCount || 0,
      followersCount: followerCount || 0,
      isOwner: playlist.userId === user.id || playlist.teacherId === user.id,
    }));

    return NextResponse.json({ playlists: formattedPlaylists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, visibility, tags } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if user is a teacher
    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        teacherProfile: true,
      }
    });

    const isTeacher = userProfile?.role === 'teacher' || !!userProfile?.teacherProfile;

    // Create playlist
    const [newPlaylist] = await db
      .insert(playlists)
      .values({
        userId: user.id,
        teacherId: isTeacher ? user.id : null,
        name: name.trim(),
        description: description?.trim(),
        visibility: visibility || 'private',
        tags: tags || [],
        playlistType: 'custom',
      })
      .returning();

    return NextResponse.json({ playlist: newPlaylist }, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
} 