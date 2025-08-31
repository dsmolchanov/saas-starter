import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const data = await request.json();
    const { id } = await params;
    
    const { error } = await supabase
      .from('chakras')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating chakra:', error);
      return NextResponse.json({ error: 'Failed to update chakra' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in chakra update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}