import { db } from '@/lib/db/drizzle';
import { teachers } from '@/lib/db/schema';
import { InstructorCard } from '@/components/instructor-card';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default async function TeachersPage() {
  const allTeachers = await db.query.teachers.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Instructors</h1>
        <p className="text-muted-foreground">
          Meet our team of experienced yoga instructors
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search instructors..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {allTeachers.map((teacher) => {
          const user = teacher.user || { name: 'Instructor' };
          return (
            <InstructorCard
              key={teacher.id}
              id={teacher.id}
              name={user.name}
              bio={teacher.bio || 'Yoga Instructor'}
            />
          );
        })}
      </div>
    </div>
  );
}
