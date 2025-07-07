import { db } from '../lib/db/drizzle';
import { users, teams, teamMembers, categories, courses, lessons, focusAreas, lessonFocusAreas } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(lessonFocusAreas);
    await db.delete(focusAreas);
    await db.delete(lessons);
    await db.delete(courses);
    await db.delete(categories);
    await db.delete(teamMembers);
    await db.delete(teams);
    await db.delete(users);

    // Create test user
    console.log('Creating test user...');
    const [testUser] = await db.insert(users)
      .values({
        name: 'Yoga Master',
        email: 'yoga@example.com',
        passwordHash: 'hashed_password_placeholder',
        role: 'instructor',
      })
      .returning();

    // Create focus areas
    console.log('Creating focus areas...');
    const focusAreasData = [
      { name: 'Core', icon: 'target' },
      { name: 'Flexibility', icon: 'flex' },
      { name: 'Strength', icon: 'dumbbell' },
      { name: 'Balance', icon: 'scale' },
      { name: 'Mobility', icon: 'move' },
    ];
    
    const createdFocusAreas = [];
    for (const fa of focusAreasData) {
      const [created] = await db.insert(focusAreas).values(fa).returning();
      createdFocusAreas.push(created);
    }

    // Create categories
    console.log('Creating categories...');
    const [yogaCategory] = await db.insert(categories)
      .values({
        slug: 'yoga',
        title: 'Yoga',
        icon: 'lotus',
      })
      .returning();

    // Create courses
    console.log('Creating courses...');
    const [yogaCourse] = await db.insert(courses)
      .values({
        categoryId: yogaCategory.id,
        teacherId: testUser.id,
        title: 'Yoga for Beginners',
        description: 'A gentle introduction to yoga for complete beginners',
        level: 'beginner',
        isPublished: 1,
      })
      .returning();

    // Create sample yoga classes
    console.log('Creating sample yoga classes...');
    const yogaClasses = [
      {
        title: 'Morning Yoga Flow',
        description: 'Start your day with this energizing yoga flow to wake up your body and mind.',
        durationMin: 30,
        difficulty: 'Beginner',
        intensity: 'Low',
        style: 'Vinyasa',
        equipment: 'Yoga mat, blocks (optional)',
        focusAreaIds: [createdFocusAreas[0].id, createdFocusAreas[1].id], // Core, Flexibility
      },
      {
        title: 'Power Yoga for Strength',
        description: 'Build strength and endurance with this challenging power yoga sequence.',
        durationMin: 45,
        difficulty: 'Intermediate',
        intensity: 'High',
        style: 'Power Yoga',
        equipment: 'Yoga mat',
        focusAreaIds: [createdFocusAreas[2].id, createdFocusAreas[0].id], // Strength, Core
      },
      {
        title: 'Restorative Yoga',
        description: 'Relax and restore with this gentle, restful yoga practice.',
        durationMin: 60,
        difficulty: 'All Levels',
        intensity: 'Low',
        style: 'Restorative',
        equipment: 'Yoga mat, bolster, blanket',
        focusAreaIds: [createdFocusAreas[1].id, createdFocusAreas[4].id], // Flexibility, Mobility
      },
      {
        title: 'Balance & Stability',
        description: 'Improve your balance and stability with this focused yoga practice.',
        durationMin: 30,
        difficulty: 'Beginner',
        intensity: 'Moderate',
        style: 'Hatha',
        equipment: 'Yoga mat, wall for support',
        focusAreaIds: [createdFocusAreas[3].id, createdFocusAreas[0].id], // Balance, Core
      },
    ];

    for (const [index, yogaClass] of yogaClasses.entries()) {
      const [createdLesson] = await db.insert(lessons)
        .values({
          courseId: yogaCourse.id,
          title: yogaClass.title,
          description: yogaClass.description,
          durationMin: yogaClass.durationMin,
          difficulty: yogaClass.difficulty,
          intensity: yogaClass.intensity,
          style: yogaClass.style,
          equipment: yogaClass.equipment,
          orderIndex: index + 1,
        })
        .returning();

      // Add focus areas to the lesson
      for (const focusAreaId of yogaClass.focusAreaIds) {
        await db.insert(lessonFocusAreas).values({
          lessonId: createdLesson.id,
          focusAreaId,
        });
      }
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:');
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
