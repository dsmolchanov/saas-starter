import { db } from '@/lib/db/drizzle';
import { progress, classes, courses } from '@/lib/db/schema';
import { teachers } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Filter, List, Grip, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MyPracticeUI } from '@/components/my-practice-ui';
import Link from 'next/link';
import { ClearAuthErrors } from '@/components/clear-auth-errors';

export const dynamic = 'force-dynamic';

export default async function MyPracticePage() {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your practice</h1>
        <Button asChild>
          <Link href="/login?redirect=/my_practice">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Determine role
  const isTeacher = (await db.select().from(teachers).where(eq(teachers.id, user.id)).limit(1)).length > 0;

  // Get user's progress with class and course details
  const userProgress = await db
    .select({
      id: progress.id,
      completedAt: progress.completedAt,
      lesson: {
        id: classes.id,
        title: classes.title,
        durationMin: classes.durationMin,
        courseId: classes.courseId,
      },
      course: {
        id: courses.id,
        title: courses.title,
        coverUrl: courses.coverUrl,
      },
    })
    .from(progress)
    .where(eq(progress.userId, user.id))
    .leftJoin(classes, eq(progress.classId, classes.id))
    .leftJoin(courses, eq(classes.courseId, courses.id))
    .orderBy(desc(progress.completedAt))
    .limit(10);

  // Calculate stats
  const totalMinutes = userProgress.reduce((sum, item) => sum + (item.lesson?.durationMin || 0), 0);
  const totalSessions = userProgress.length;
  const daysActive = new Set(userProgress.map(p => p.completedAt.toISOString().split('T')[0])).size;

  return (
    <div className="container mx-auto px-4 pb-20 pt-4 max-w-md">
      <ClearAuthErrors />
      {/* Top bar */}
      <div className="flex items-center justify-center relative mb-6">
        <h1 className="text-lg font-semibold tracking-wide">MY PRACTICE</h1>
        <Avatar className="absolute right-0">
          <AvatarFallback>
            {user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      <MyPracticeUI user={{ id: user.id, name: user.name || 'User', avatarUrl: (user as any).avatarUrl }} initialRole={isTeacher ? 'teacher' : 'student'} />

      {/* Tabs */}
      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="w-full justify-between bg-transparent border-b border-border rounded-none p-0 mb-6">
          {['completed','classes','series','playlists'].map(key=> (
            <TabsTrigger key={key} value={key} className="flex-1 data-[state=active]:border-b-2 border border-transparent rounded-none py-2 text-sm tracking-wide uppercase">
              {key === 'playlists' ? 'MY PLAYLISTS' : key.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Completed Content */}
        <TabsContent value="completed">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div>
              <p className="text-lg font-semibold">{totalSessions}</p>
              <p className="text-xs tracking-wide text-muted-foreground">COMPLETED</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{daysActive}</p>
              <p className="text-xs tracking-wide text-muted-foreground">ACTIVE DAYS</p>
            </div>
            <div>
              <p className="text-lg font-semibold">0</p>
              <p className="text-xs tracking-wide text-muted-foreground">WEEK STREAK</p>
            </div>
            <div>
              <p className="text-lg font-semibold">
                {`${String(Math.floor(totalMinutes/60)).padStart(2,'0')}:${String(totalMinutes%60).padStart(2,'0')}`}
              </p>
              <p className="text-xs tracking-wide text-muted-foreground">TOTAL TIME</p>
            </div>
          </div>

          {/* Filters bar */}
          <div className="flex items-center justify-between border rounded-full px-4 py-2 text-sm mb-4">
            <button className="flex items-center gap-1">
              <Filter className="w-4 h-4" /> FILTERS
            </button>
            <div className="flex items-center gap-3">
              <List className="w-4 h-4" />
              <Grip className="w-4 h-4" />
            </div>
          </div>

          {/* Sort Row */}
          <div className="flex gap-4 mb-10">
            <button className="flex-1 border rounded-full px-4 py-2 flex items-center justify-between text-sm">
              LAST 30 DAYS <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex-1 border rounded-full px-4 py-2 flex items-center justify-between text-sm">
              NEWEST <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* No videos */}
          {userProgress.length === 0 ? (
            <p className="text-center text-xl text-muted-foreground font-medium py-20">NO VIDEOS HERE YET...</p>
          ) : (
            // TODO: map progress list cards similar to earlier implementation
            <div className="space-y-4">
              {/* progress cards to be implemented */}
            </div>
          )}
        </TabsContent>

        {/* Other tabs placeholder */}
        <TabsContent value="classes">
          <p className="text-center py-20 text-muted-foreground">Coming soon</p>
        </TabsContent>
        <TabsContent value="series">
          <p className="text-center py-20 text-muted-foreground">Coming soon</p>
        </TabsContent>
        <TabsContent value="playlists">
          <p className="text-center py-20 text-muted-foreground">Coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
