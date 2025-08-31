import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const data = await request.json();
    
    // Upsert to allow updating existing focus for a date
    const { data: focus, error } = await supabase
      .from('chakra_daily_focus')
      .upsert({
        ...data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chakra focus:', error);
      return NextResponse.json({ error: 'Failed to create focus' }, { status: 500 });
    }

    return NextResponse.json(focus);
  } catch (error) {
    console.error('Error in chakra focus creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}