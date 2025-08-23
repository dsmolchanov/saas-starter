import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in?redirect=/admin');
  }

  // Check if user is admin
  const isAdmin = user.role === 'admin' || user.role === 'owner';
  
  if (!isAdmin) {
    redirect('/more');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <AdminDashboard locale="en" />
    </div>
  );
}