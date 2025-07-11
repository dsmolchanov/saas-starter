import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { categories, focusAreas } from '@/lib/db/schema';

// GET - Fetch categories and focus areas for forms
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    // Fetch all categories
    const allCategories = await db.query.categories.findMany({
      columns: {
        id: true,
        slug: true,
        title: true,
        icon: true,
      },
      orderBy: (categories, { asc }) => [asc(categories.title)],
    });

    // Fetch all focus areas
    const allFocusAreas = await db.query.focusAreas.findMany({
      columns: {
        id: true,
        name: true,
        icon: true,
      },
      orderBy: (focusAreas, { asc }) => [asc(focusAreas.name)],
    });

    // Define difficulty levels
    const difficultyLevels = [
      'Beginner',
      'Intermediate', 
      'Advanced',
      'All Levels'
    ];

    // Define intensity levels
    const intensityLevels = [
      'Low',
      'Medium',
      'High'
    ];

    // Define yoga styles
    const yogaStyles = [
      'Hatha',
      'Vinyasa',
      'Yin',
      'Power',
      'Restorative',
      'Ashtanga',
      'Bikram',
      'Kundalini',
      'Gentle Flow'
    ];

    return NextResponse.json({ 
      categories: allCategories,
      focusAreas: allFocusAreas,
      difficultyLevels,
      intensityLevels,
      yogaStyles
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
} 