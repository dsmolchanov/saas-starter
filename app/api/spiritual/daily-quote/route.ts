import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's quote
    const { data: dailyQuote, error: dailyError } = await supabase
      .from('daily_quotes')
      .select(`
        *,
        quote:yoga_quotes(
          *,
          text:yoga_texts(*)
        )
      `)
      .eq('date', today)
      .single();

    if (!dailyError && dailyQuote) {
      return NextResponse.json({ 
        quote: dailyQuote.quote,
        isSpecial: dailyQuote.is_special_occasion,
        occasion: {
          en: dailyQuote.occasion_name_en,
          ru: dailyQuote.occasion_name_ru,
          es: dailyQuote.occasion_name_es
        }
      });
    }

    // If no quote for today, get a random one
    const { data: allQuotes, error: quotesError } = await supabase
      .from('yoga_quotes')
      .select(`
        *,
        text:yoga_texts(*)
      `);

    if (quotesError || !allQuotes || allQuotes.length === 0) {
      console.error('Error fetching quotes:', quotesError);
      return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }

    // Select a random quote
    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];

    // Save it as today's quote for consistency
    await supabase
      .from('daily_quotes')
      .insert({
        date: today,
        quote_id: randomQuote.id
      });

    return NextResponse.json({ 
      quote: randomQuote,
      isDefault: true
    });
  } catch (error) {
    console.error('Error in daily-quote API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { quoteId, interaction } = await request.json();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Record the interaction
    const { error } = await supabase
      .from('quote_interactions')
      .upsert({
        quote_id: quoteId,
        user_id: user.id,
        interaction_type: interaction
      }, {
        onConflict: 'quote_id,user_id,interaction_type'
      });

    if (error) {
      console.error('Error recording interaction:', error);
      return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in quote interaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}