import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's chakra focus
    const { data: todayFocus, error: focusError } = await supabase
      .from('chakra_daily_focus')
      .select(`
        *,
        chakra:chakras(*)
      `)
      .eq('date', today)
      .single();

    if (focusError && focusError.code !== 'PGRST116') {
      console.error('Error fetching chakra focus:', focusError);
      return NextResponse.json({ error: 'Failed to fetch chakra focus' }, { status: 500 });
    }

    // If no focus for today, get a default chakra based on day of week
    if (!todayFocus) {
      const dayOfWeek = new Date().getDay();
      const chakraNumber = (dayOfWeek % 7) + 1;
      
      const { data: defaultChakra, error: chakraError } = await supabase
        .from('chakras')
        .select('*')
        .eq('number', chakraNumber)
        .single();

      if (chakraError) {
        console.error('Error fetching default chakra:', chakraError);
        return NextResponse.json({ error: 'Failed to fetch chakra' }, { status: 500 });
      }

      return NextResponse.json({ 
        chakra: defaultChakra,
        isDefault: true,
        meditationMinutes: 15
      });
    }

    return NextResponse.json({ 
      chakra: todayFocus.chakra,
      customMessage: {
        en: todayFocus.custom_message_en,
        ru: todayFocus.custom_message_ru,
        es: todayFocus.custom_message_es
      },
      meditationMinutes: todayFocus.meditation_minutes,
      isDefault: false
    });
  } catch (error) {
    console.error('Error in chakra-today API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}