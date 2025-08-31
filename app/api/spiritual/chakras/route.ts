import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: chakras, error } = await supabase
      .from('chakras')
      .select('*')
      .order('number');

    if (error) {
      console.error('Error fetching chakras:', error);
      return NextResponse.json({ error: 'Failed to fetch chakras' }, { status: 500 });
    }

    return NextResponse.json({ chakras });
  } catch (error) {
    console.error('Error in chakras API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}