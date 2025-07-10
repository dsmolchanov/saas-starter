import { NextRequest, NextResponse } from 'next/server';
import { getUser, getFavoritesPlaylist, addToFavorites, removeFromFavorites, checkIfFavorite } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await getFavoritesPlaylist(user.id);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
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
    const { itemType, itemId, action } = body;

    if (!itemType || !itemId || !action) {
      return NextResponse.json({ error: 'itemType, itemId, and action are required' }, { status: 400 });
    }

    if (!['lesson', 'course', 'teacher'].includes(itemType)) {
      return NextResponse.json({ error: 'Invalid itemType' }, { status: 400 });
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Action must be add or remove' }, { status: 400 });
    }

    let result;
    if (action === 'add') {
      try {
        result = await addToFavorites(user.id, itemType, parseInt(itemId));
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          return NextResponse.json({ error: 'Item already in favorites' }, { status: 409 });
        }
        throw error;
      }
    } else {
      result = await removeFromFavorites(user.id, itemType, parseInt(itemId));
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error updating favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 