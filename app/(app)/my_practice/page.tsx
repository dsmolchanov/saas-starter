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
import { AdminDashboard } from '@/components/admin-dashboard';
import { TeacherDashboard } from '@/components/teacher-dashboard';
import { SignOutButton } from '@/components/sign-out-button';
import { SimpleLanguageToggle } from '@/components/simple-language-toggle';
import Link from 'next/link';
import { ClearAuthErrors } from '@/components/clear-auth-errors';
import { headers } from 'next/headers';

// This page needs dynamic rendering for user authentication
export const dynamic = 'force-dynamic';

// Detect current locale from URL or headers
async function getCurrentLocale(): Promise<string> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  
  if (pathname.startsWith('/en')) return 'en';
  if (pathname.startsWith('/es-MX')) return 'es-MX';
  return 'ru'; // default
}

// Locale-aware translations
function getTranslations(locale: string) {
  const translations = {
    ru: {
      signInToAccount: 'Войдите в свой аккаунт',
      signIn: 'Войти',
      myPractice: 'МОЯ ПРАКТИКА',
      adminView: 'Админ панель',
      studentView: 'Студент',
      teacherView: 'Преподаватель'
    },
    en: {
      signInToAccount: 'Sign in to your account',
      signIn: 'Sign In',
      myPractice: 'MY PRACTICE',
      adminView: 'Admin View',
      studentView: 'Student',
      teacherView: 'Teacher'
    },
    'es-MX': {
      signInToAccount: 'Inicia sesión en tu cuenta',
      signIn: 'Iniciar Sesión',
      myPractice: 'MI PRÁCTICA',
      adminView: 'Vista Administrador',
      studentView: 'Estudiante',
      teacherView: 'Profesor'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export default async function MyPracticePage() {
  const user = await getUser();
  const currentLocale = await getCurrentLocale();
  const t = getTranslations(currentLocale);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.signInToAccount}</h1>
        <Button asChild>
          <Link href="/login?redirect=/my_practice">{t.signIn}</Link>
        </Button>
      </div>
    );
  }

  const isAdmin = ['admin', 'owner'].includes(user.role);
  const isTeacher = (await db.select().from(teachers).where(eq(teachers.id, user.id)).limit(1)).length > 0 ||
                   user.teacherApplicationStatus === 'approved';

  // Get user's progress with class and course details for student view
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

  // Component for student practice view
  const StudentPracticeView = () => (
    <div className="container mx-auto px-4 pb-20 pt-4 max-w-md">
      <MyPracticeUI 
        user={{ 
          id: user.id, 
          name: user.name || 'User', 
          email: user.email || null,
          avatarUrl: (user as any).avatarUrl,
          teacherApplicationStatus: user.teacherApplicationStatus 
        }} 
        initialRole='student'
        locale={currentLocale}
      />

      {/* Tabs */}
      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="w-full justify-between bg-transparent border-b border-border rounded-none p-0 mb-6">
          {[
            { key: 'completed', label: 'Completed' },
            { key: 'classes', label: 'Classes' },
            { key: 'series', label: 'Series' },
            { key: 'playlists', label: 'Playlists' }
          ].map(tab => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex-1 data-[state=active]:border-b-2 border border-transparent rounded-none py-2 text-sm tracking-wide uppercase">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Completed Content */}
        <TabsContent value="completed">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div>
              <p className="text-lg font-semibold">{totalSessions}</p>
              <p className="text-xs tracking-wide text-muted-foreground">Completed Sessions</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{daysActive}</p>
              <p className="text-xs tracking-wide text-muted-foreground">Active Days</p>
            </div>
            <div>
              <p className="text-lg font-semibold">0</p>
              <p className="text-xs tracking-wide text-muted-foreground">Week Streak</p>
            </div>
            <div>
              <p className="text-lg font-semibold">
                {`${String(Math.floor(totalMinutes/60)).padStart(2,'0')}:${String(totalMinutes%60).padStart(2,'0')}`}
              </p>
              <p className="text-xs tracking-wide text-muted-foreground">Total Time</p>
            </div>
          </div>

          {/* Filters bar */}
          <div className="flex items-center justify-between border rounded-full px-4 py-2 text-sm mb-4">
            <button className="flex items-center gap-1">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="flex items-center gap-3">
              <List className="w-4 h-4" />
              <Grip className="w-4 h-4" />
            </div>
          </div>

          {/* Sort Row */}
          <div className="flex gap-4 mb-10">
            <button className="flex-1 border rounded-full px-4 py-2 flex items-center justify-between text-sm">
              Last 30 Days <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex-1 border rounded-full px-4 py-2 flex items-center justify-between text-sm">
              Newest <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* No videos */}
          {userProgress.length === 0 ? (
            <p className="text-center text-xl text-muted-foreground font-medium py-20">No videos yet</p>
          ) : (
            <div className="space-y-4">
              {/* progress cards to be implemented */}
            </div>
          )}
        </TabsContent>

        {/* Other tabs placeholder */}
        <TabsContent value="classes">
          <p className="text-center py-20 text-muted-foreground">Coming Soon</p>
        </TabsContent>
        <TabsContent value="series">
          <p className="text-center py-20 text-muted-foreground">Coming Soon</p>
        </TabsContent>
        <TabsContent value="playlists">
          <p className="text-center py-20 text-muted-foreground">Coming Soon</p>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Component for teacher view
  const TeacherPracticeView = () => (
    <div className="container mx-auto px-4 pb-20 pt-4 max-w-2xl">
      <MyPracticeUI 
        user={{ 
          id: user.id, 
          name: user.name || 'User', 
          email: user.email || null,
          avatarUrl: (user as any).avatarUrl,
          teacherApplicationStatus: user.teacherApplicationStatus 
        }} 
        initialRole='teacher'
        locale={currentLocale}
      />
    </div>
  );

  // Component for admin view
  const AdminPracticeView = () => (
    <div className="container mx-auto px-4 pb-20 pt-4 max-w-2xl">
      <AdminDashboard locale={currentLocale} />
    </div>
  );

  // If admin, show role switching interface
  if (isAdmin) {
    return (
      <div className="min-h-screen">
        <ClearAuthErrors />
        
        {/* Header with avatar and sign out */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold tracking-wide">{t.myPractice}</h1>
              <div className="flex items-center gap-3">
                <SimpleLanguageToggle />
                <Avatar>
                  <AvatarFallback>
                    {user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'A'}
                  </AvatarFallback>
                </Avatar>
                <SignOutButton variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" showIcon={false}>
                  Sign Out
                </SignOutButton>
              </div>
            </div>

            {/* Role switching tabs for admins */}
            <Tabs defaultValue="admin" className="w-full mt-4">
              <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0">
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:border-b-2 border border-transparent rounded-none py-2 px-4 text-sm tracking-wide uppercase"
                >
                  {t.adminView}
                </TabsTrigger>
                <TabsTrigger 
                  value="teacher" 
                  className="data-[state=active]:border-b-2 border border-transparent rounded-none py-2 px-4 text-sm tracking-wide uppercase"
                >
                  {t.teacherView}
                </TabsTrigger>
                <TabsTrigger 
                  value="student" 
                  className="data-[state=active]:border-b-2 border border-transparent rounded-none py-2 px-4 text-sm tracking-wide uppercase"
                >
                  {t.studentView}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="mt-6">
                <AdminPracticeView />
              </TabsContent>

              <TabsContent value="teacher" className="mt-6">
                <TeacherPracticeView />
              </TabsContent>

              <TabsContent value="student" className="mt-6">
                <StudentPracticeView />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // If teacher (but not admin), show teacher/student role switching
  if (isTeacher) {
    return (
      <div className="min-h-screen">
        <ClearAuthErrors />
        
        {/* Header with avatar and sign out */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold tracking-wide">{t.myPractice}</h1>
              <div className="flex items-center gap-3">
                <SimpleLanguageToggle />
                <Avatar>
                  <AvatarFallback>
                    {user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'T'}
                  </AvatarFallback>
                </Avatar>
                <SignOutButton variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" showIcon={false}>
                  Sign Out
                </SignOutButton>
              </div>
            </div>

            {/* Role switching tabs for teachers */}
            <Tabs defaultValue="teacher" className="w-full mt-4">
              <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0">
                <TabsTrigger 
                  value="teacher" 
                  className="data-[state=active]:border-b-2 border border-transparent rounded-none py-2 px-4 text-sm tracking-wide uppercase"
                >
                  {t.teacherView}
                </TabsTrigger>
                <TabsTrigger 
                  value="student" 
                  className="data-[state=active]:border-b-2 border border-transparent rounded-none py-2 px-4 text-sm tracking-wide uppercase"
                >
                  {t.studentView}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teacher" className="mt-6">
                <TeacherPracticeView />
              </TabsContent>

              <TabsContent value="student" className="mt-6">
                <StudentPracticeView />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // Non-admin, non-teacher users (students) see their student view
  return (
    <div className="container mx-auto px-4 pb-20 pt-4 max-w-md">
      <ClearAuthErrors />
      {/* Top bar */}
      <div className="flex items-center justify-center relative mb-6">
        <h1 className="text-lg font-semibold tracking-wide">{t.myPractice}</h1>
        <div className="absolute right-0 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <SimpleLanguageToggle />
            <Avatar>
              <AvatarFallback>
                {user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <SignOutButton variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" showIcon={false}>
            Sign Out
          </SignOutButton>
        </div>
      </div>

      <StudentPracticeView />
    </div>
  );
}
