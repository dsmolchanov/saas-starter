import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { classes, users, teachers, courses } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get current user
    const currentUser = await getUser();
    console.log('Current user in debug endpoint:', currentUser?.id, currentUser?.name);
    
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        currentUser: null 
      });
    }
    
    // Get user profile with teacher info
    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, currentUser.id),
      with: {
        teacherProfile: true,
      }
    });
    
    // Method 1: Query using Drizzle ORM query builder
    const classesMethod1 = await db.query.classes.findMany({
      where: eq(classes.teacherId, currentUser.id),
      orderBy: [desc(classes.createdAt)],
    });
    
    // Method 2: Direct SQL query  
    const classesMethod2 = await db
      .select()
      .from(classes)
      .where(eq(classes.teacherId, currentUser.id))
      .orderBy(desc(classes.createdAt));
    
    // Get courses
    const userCourses = await db.query.courses.findMany({
      where: eq(courses.teacherId, currentUser.id),
      with: {
        classes: true,
      },
      orderBy: [desc(courses.id)],
    });
    
    // Raw SQL query to double-check
    const rawQuery = await db.execute(
      sql`SELECT id, title, teacher_id FROM classes WHERE teacher_id = ${currentUser.id}`
    );
    
    return NextResponse.json({
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      },
      userProfile: {
        id: userProfile?.id,
        name: userProfile?.name,
        role: userProfile?.role,
        hasTeacherProfile: !!userProfile?.teacherProfile,
        teacherId: userProfile?.teacherProfile?.id,
      },
      classesMethod1: {
        count: classesMethod1.length,
        classes: classesMethod1.map(c => ({
          id: c.id,
          title: c.title,
          teacherId: c.teacherId,
        })),
      },
      classesMethod2: {
        count: classesMethod2.length,
        classes: classesMethod2.map(c => ({
          id: c.id,
          title: c.title,
          teacherId: c.teacherId,
        })),
      },
      courses: {
        count: userCourses.length,
        courses: userCourses.map(c => ({
          id: c.id,
          title: c.title,
          classCount: c.classes?.length || 0,
        })),
      },
      rawSqlResult: {
        count: rawQuery.length,
        rows: rawQuery,
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}