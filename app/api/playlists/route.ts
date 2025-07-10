import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserPlaylists, createPlaylist } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlists = await getUserPlaylists(user.id);
    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    const playlist = await createPlaylist({
      userId: user.id,
      name: name.trim(),
      description: description?.trim(),
      isPublic: Boolean(isPublic),
    });

    return NextResponse.json({ playlist }, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 