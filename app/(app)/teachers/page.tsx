// Disable static prerendering to avoid DB access at build time
export const dynamic = 'force-dynamic';

import { db } from '@/lib/db/drizzle';
import { teachers } from '@/lib/db/schema';
import { TeachersContent } from '@/components/teachers-content';

export default async function TeachersPage() {
  const allTeachers = await db.query.teachers.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return <TeachersContent allTeachers={allTeachers} />;
}
