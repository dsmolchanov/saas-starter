import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { favorites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user's favorites
    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, user.id));
    
    return NextResponse.json({ favorites: userFavorites });
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

    if (!['class', 'meditation', 'course'].includes(itemType)) {
      return NextResponse.json({ error: 'Invalid itemType. Must be class, meditation, or course' }, { status: 400 });
    }

    if (!['add', 'remove', 'toggle'].includes(action)) {
      return NextResponse.json({ error: 'Action must be add, remove, or toggle' }, { status: 400 });
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, user.id),
          eq(favorites.itemType, itemType),
          eq(favorites.itemId, itemId)
        )
      )
      .limit(1);

    let result;
    if (action === 'toggle') {
      // Toggle based on current state
      action = existing.length > 0 ? 'remove' : 'add';
    }

    if (action === 'add' && existing.length === 0) {
      // Add to favorites (trigger will add to Liked playlist)
      [result] = await db
        .insert(favorites)
        .values({
          userId: user.id,
          itemType,
          itemId,
        })
        .returning();
    } else if (action === 'remove' && existing.length > 0) {
      // Remove from favorites (trigger will remove from Liked playlist)
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, user.id),
            eq(favorites.itemType, itemType),
            eq(favorites.itemId, itemId)
          )
        );
      result = { removed: true };
    } else {
      // No change needed
      result = existing[0] || { exists: false };
    }

    return NextResponse.json({ 
      success: true, 
      isFavorited: action === 'add',
      result 
    });
  } catch (error) {
    console.error('Error updating favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 