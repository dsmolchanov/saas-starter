import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Call the database function to ensure content is available
    const { data, error } = await supabase.rpc('ensure_spiritual_content_available');
    
    if (error) {
      console.error('Error populating spiritual content:', error);
      return NextResponse.json(
        { error: 'Failed to populate spiritual content' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in spiritual populate endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Force population by calling the daily function directly
    const { error } = await supabase.rpc('daily_spiritual_population');
    
    if (error) {
      console.error('Error forcing spiritual content population:', error);
      return NextResponse.json(
        { error: 'Failed to force populate spiritual content' },
        { status: 500 }
      );
    }
    
    // Get status after population
    const { data: status } = await supabase.rpc('ensure_spiritual_content_available');
    
    return NextResponse.json({
      success: true,
      message: 'Spiritual content populated successfully',
      ...status
    });
  } catch (error) {
    console.error('Error in spiritual populate endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}