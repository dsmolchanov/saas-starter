import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { playlists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlistId = params.id;
    const body = await request.json();
    const { name, description, visibility, tags } = body;

    // Check if user owns the playlist
    const existingPlaylist = await db.query.playlists.findFirst({
      where: and(
        eq(playlists.id, playlistId),
        eq(playlists.userId, user.id)
      ),
    });

    if (!existingPlaylist) {
      return NextResponse.json({ error: 'Playlist not found or unauthorized' }, { status: 404 });
    }

    // Update playlist
    const [updatedPlaylist] = await db
      .update(playlists)
      .set({
        name: name?.trim() || existingPlaylist.name,
        description: description?.trim(),
        visibility: visibility || existingPlaylist.visibility,
        tags: tags || existingPlaylist.tags,
        updatedAt: new Date(),
      })
      .where(eq(playlists.id, playlistId))
      .returning();

    return NextResponse.json({ playlist: updatedPlaylist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlistId = params.id;

    // Check if user owns the playlist
    const existingPlaylist = await db.query.playlists.findFirst({
      where: and(
        eq(playlists.id, playlistId),
        eq(playlists.userId, user.id)
      ),
    });

    if (!existingPlaylist) {
      return NextResponse.json({ error: 'Playlist not found or unauthorized' }, { status: 404 });
    }

    // Delete playlist (cascade will handle related records)
    await db
      .delete(playlists)
      .where(eq(playlists.id, playlistId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}