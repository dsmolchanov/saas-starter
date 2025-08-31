import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { ChakraManager } from '@/components/admin/chakra-manager';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminChakrasPage() {
  const user = await getUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const supabase = await createServerSupabaseClient();
  
  const { data: chakras } = await supabase
    .from('chakras')
    .select('*')
    .order('number');

  const { data: dailyFocus } = await supabase
    .from('chakra_daily_focus')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chakra Management</h1>
        <p className="text-gray-600">Manage chakra information and daily focus schedule</p>
      </div>
      
      <ChakraManager 
        initialChakras={chakras || []} 
        initialDailyFocus={dailyFocus || []}
      />
    </div>
  );
}