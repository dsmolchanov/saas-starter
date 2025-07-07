import { db } from '../lib/db/drizzle';
import { users, teams, teamMembers, courses, lessons, categories } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection by querying the database
    const result = await db.select().from(users).limit(1);
    console.log('✅ Successfully connected to the database');
    
    // Create test data
    console.log('\nCreating test data...');
    
    // 1. Create a test user
    const [newUser] = await db.insert(users)
      .values({
        name: 'Test User',
        email: `testuser_${Date.now()}@example.com`,
        passwordHash: 'hashed_password_placeholder', // In a real app, use proper password hashing
        role: 'admin',
      })
      .returning();
    
    console.log('✅ Created test user:', newUser);
    
    // 2. Create a test team
    const [newTeam] = await db.insert(teams)
      .values({
        name: 'Test Team',
        planName: 'premium',
        subscriptionStatus: 'active',
      })
      .returning();
    
    console.log('✅ Created test team:', newTeam);
    
    // 3. Add user to team
    const [newTeamMember] = await db.insert(teamMembers)
      .values({
        userId: newUser.id,
        teamId: newTeam.id,
        role: 'owner',
      })
      .returning();
    
    console.log('✅ Added user to team:', newTeamMember);
    
    // 4. Create a category
    const [newCategory] = await db.insert(categories)
      .values({
        slug: 'programming',
        title: 'Programming',
        icon: 'code',
      })
      .returning();
    
    console.log('✅ Created category:', newCategory);
    
    // 5. Create a course
    const [newCourse] = await db.insert(courses)
      .values({
        categoryId: newCategory.id,
        teacherId: newUser.id,
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript from scratch',
        level: 'beginner',
        isPublished: 1,
      })
      .returning();
    
    console.log('✅ Created course:', newCourse);
    
    // 6. Create a lesson
    const [newLesson] = await db.insert(lessons)
      .values({
        courseId: newCourse.id,
        title: 'Getting Started with TypeScript',
        durationMin: 30,
        orderIndex: 1,
      })
      .returning();
    
    console.log('✅ Created lesson:', newLesson);
    
    // 7. Query the data back
    console.log('\nQuerying test data...');
    const teamWithMembers = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.id, newTeam.id),
      with: {
        teamMembers: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    console.log('\nTeam with members:', JSON.stringify(teamWithMembers, null, 2));
    
    const courseWithLessons = await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, newCourse.id),
      with: {
        lessons: true,
        category: true,
      },
    });
    
    console.log('\nCourse with lessons:', JSON.stringify(courseWithLessons, null, 2));
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing database connection:');
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testDatabaseConnection();
