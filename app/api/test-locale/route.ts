import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('preferred-language')?.value || 'en';
  
  const supabase = await createServerSupabaseClient();
  
  // Get localized classes
  const { data: localizedClasses, error } = await supabase
    .rpc('get_classes_localized', {
      p_locale: locale,
      p_limit: 5
    });
  
  return NextResponse.json({
    locale,
    classes: localizedClasses?.map((c: any) => ({
      id: c.id,
      title: c.title,
      locale_used: locale
    })),
    error
  });
}