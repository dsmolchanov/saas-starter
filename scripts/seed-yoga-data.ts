import { db } from '../lib/db/drizzle';
import { users, teachers, categories, courses, classes, focusAreas, lessonFocusAreas } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const TEACHER_USER_ID = 'a25fc6f8-6bf8-4922-bcdf-f69327de0a21';

async function seedYogaData() {
  console.log('🧘‍♀️ Seeding yoga data...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(lessonFocusAreas);
    await db.delete(classes);
    await db.delete(courses);
    
    // Ensure the teacher user exists
    console.log('Creating teacher profile...');
    await db.insert(teachers).values({
      id: TEACHER_USER_ID,
      bio: 'Certified yoga instructor with 10+ years of experience in Hatha, Vinyasa, and Yin yoga.',
      instagramUrl: 'https://instagram.com/yogamaster',
      revenueShare: 70
    }).onConflictDoNothing();

    // Create focus areas
    console.log('Creating focus areas...');
    const focusAreasData = [
      { name: 'Core Strength', icon: 'target' },
      { name: 'Flexibility', icon: 'flex' },
      { name: 'Balance', icon: 'scale' },
      { name: 'Relaxation', icon: 'moon' },
      { name: 'Hip Opening', icon: 'circle' },
      { name: 'Back Bending', icon: 'arc' },
      { name: 'Arm Strength', icon: 'dumbbell' },
      { name: 'Mindfulness', icon: 'brain' },
    ];
    
    const createdFocusAreas = [];
    for (const fa of focusAreasData) {
      const [created] = await db.insert(focusAreas).values(fa).onConflictDoNothing().returning();
      if (created) createdFocusAreas.push(created);
    }

    // Get existing focus areas if they already exist
    const allFocusAreas = await db.select().from(focusAreas);

    // Create categories
    console.log('Creating categories...');
    const categoriesData = [
      { slug: 'hatha', title: 'Hatha Yoga', icon: 'lotus' },
      { slug: 'vinyasa', title: 'Vinyasa', icon: 'waves' },
      { slug: 'yin', title: 'Yin Yoga', icon: 'moon' },
      { slug: 'power', title: 'Power Yoga', icon: 'zap' },
      { slug: 'restorative', title: 'Restorative', icon: 'heart' },
    ];

    const createdCategories = [];
    for (const cat of categoriesData) {
      const [created] = await db.insert(categories).values(cat).onConflictDoNothing().returning();
      if (created) createdCategories.push(created);
    }

    // Get existing categories
    const allCategories = await db.select().from(categories);

    // Create courses
    console.log('Creating courses...');
    const coursesData = [
      {
        categoryId: allCategories.find(c => c.slug === 'hatha')?.id!,
        teacherId: TEACHER_USER_ID,
        title: 'Beginner Hatha Series',
        description: 'A gentle introduction to yoga fundamentals with emphasis on proper alignment.',
        level: 'Beginner',
        coverUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        isPublished: 1,
      },
      {
        categoryId: allCategories.find(c => c.slug === 'vinyasa')?.id!,
        teacherId: TEACHER_USER_ID,
        title: 'Morning Energizer',
        description: 'Dynamic sequences to awaken your body and energize your day.',
        level: 'Intermediate',
        coverUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
        isPublished: 1,
      },
      {
        categoryId: allCategories.find(c => c.slug === 'yin')?.id!,
        teacherId: TEACHER_USER_ID,
        title: 'Deep Relaxation Journey',
        description: 'Slow, meditative practice focusing on deep stretches and mindfulness.',
        level: 'All Levels',
        coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        isPublished: 1,
      },
    ];

    const createdCourses = [];
    for (const course of coursesData) {
      const [created] = await db.insert(courses).values(course).returning();
      createdCourses.push(created);
    }

    // Create individual classes/lessons
    console.log('Creating classes...');
    const classesData = [
      // Standalone classes (not part of a course)
      {
        courseId: null,
        teacherId: TEACHER_USER_ID,
        title: 'Quick Morning Stretch',
        description: 'A 15-minute energizing sequence perfect for starting your day.',
        durationMin: 15,
        videoPath: '/videos/morning-stretch.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800',
        difficulty: 'Beginner',
        intensity: 'Low',
        style: 'Gentle',
        equipment: 'None',
        orderIndex: 1,
      },
      {
        courseId: null,
        teacherId: TEACHER_USER_ID,
        title: 'Core Power',
        description: 'Build strength and stability with this challenging core-focused sequence.',
        durationMin: 30,
        videoPath: '/videos/core-power.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        difficulty: 'Advanced',
        intensity: 'High',
        style: 'Power Yoga',
        equipment: 'Mat',
        orderIndex: 2,
      },
      {
        courseId: null,
        teacherId: TEACHER_USER_ID,
        title: 'Hip Opening Bliss',
        description: 'Release tension and increase mobility with deep hip opening poses.',
        durationMin: 45,
        videoPath: '/videos/hip-opening.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        difficulty: 'Intermediate',
        intensity: 'Medium',
        style: 'Yin Yoga',
        equipment: 'Mat, Blocks',
        orderIndex: 3,
      },
      {
        courseId: null,
        teacherId: TEACHER_USER_ID,
        title: 'Evening Wind Down',
        description: 'Gentle restorative poses to help you relax and prepare for sleep.',
        durationMin: 25,
        videoPath: '/videos/evening-wind-down.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800',
        difficulty: 'Beginner',
        intensity: 'Low',
        style: 'Restorative',
        equipment: 'Mat, Bolster',
        orderIndex: 4,
      },
      {
        courseId: null,
        teacherId: TEACHER_USER_ID,
        title: 'Warrior Challenge',
        description: 'Build heat and strength with dynamic warrior pose variations.',
        durationMin: 40,
        videoPath: '/videos/warrior-challenge.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        difficulty: 'Intermediate',
        intensity: 'High',
        style: 'Vinyasa',
        equipment: 'Mat',
        orderIndex: 5,
      },
      {
        courseId: null,
        teacherId: TEACHER_USER_ID,
        title: 'Backbend Breakthrough',
        description: 'Safely open your heart and strengthen your back with progressive backbends.',
        durationMin: 35,
        videoPath: '/videos/backbend-breakthrough.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        difficulty: 'Advanced',
        intensity: 'Medium',
        style: 'Hatha',
        equipment: 'Mat, Strap',
        orderIndex: 6,
      },
    ];

    // Add course lessons
    const courseClasses = [
      // Beginner Hatha Series
      {
        courseId: createdCourses[0].id,
        teacherId: TEACHER_USER_ID,
        title: 'Foundation Poses',
        description: 'Learn the basic standing poses and proper alignment.',
        durationMin: 30,
        difficulty: 'Beginner',
        intensity: 'Low',
        style: 'Hatha',
        orderIndex: 1,
      },
      {
        courseId: createdCourses[0].id,
        teacherId: TEACHER_USER_ID,
        title: 'Seated Poses & Twists',
        description: 'Explore seated poses and gentle spinal twists.',
        durationMin: 25,
        difficulty: 'Beginner',
        intensity: 'Low',
        style: 'Hatha',
        orderIndex: 2,
      },
      // Morning Energizer
      {
        courseId: createdCourses[1].id,
        teacherId: TEACHER_USER_ID,
        title: 'Sun Salutation A',
        description: 'Master the classic sun salutation sequence.',
        durationMin: 20,
        difficulty: 'Intermediate',
        intensity: 'Medium',
        style: 'Vinyasa',
        orderIndex: 1,
      },
      {
        courseId: createdCourses[1].id,
        teacherId: TEACHER_USER_ID,
        title: 'Dynamic Standing Sequence',
        description: 'Dynamic sequence linking standing poses.',
        durationMin: 35,
        difficulty: 'Intermediate',
        intensity: 'High',
        style: 'Vinyasa',
        orderIndex: 2,
      },
    ];

    const allClasses = [...classesData, ...courseClasses];
    const createdClasses = [];
    
    for (const classData of allClasses) {
      const [created] = await db.insert(classes).values(classData).returning();
      createdClasses.push(created);
    }

    // Create focus area associations
    console.log('Creating focus area associations...');
    const focusAssociations = [
      { classTitle: 'Core Power', focusAreas: ['Core Strength', 'Arm Strength'] },
      { classTitle: 'Hip Opening Bliss', focusAreas: ['Hip Opening', 'Flexibility'] },
      { classTitle: 'Evening Wind Down', focusAreas: ['Relaxation', 'Mindfulness'] },
      { classTitle: 'Warrior Challenge', focusAreas: ['Core Strength', 'Balance'] },
      { classTitle: 'Backbend Breakthrough', focusAreas: ['Back Bending', 'Flexibility'] },
      { classTitle: 'Quick Morning Stretch', focusAreas: ['Flexibility', 'Mindfulness'] },
    ];

    for (const association of focusAssociations) {
      const classItem = createdClasses.find(c => c.title === association.classTitle);
      if (classItem) {
        for (const focusName of association.focusAreas) {
          const focusArea = allFocusAreas.find(fa => fa.name === focusName);
          if (focusArea) {
            await db.insert(lessonFocusAreas).values({
              classId: classItem.id,
              focusAreaId: focusArea.id,
            }).onConflictDoNothing();
          }
        }
      }
    }

    console.log('✅ Yoga data seeded successfully!');
    console.log(`Created ${createdCategories.length} categories`);
    console.log(`Created ${createdCourses.length} courses`);
    console.log(`Created ${createdClasses.length} classes`);
    console.log(`Created ${createdFocusAreas.length} focus areas`);

  } catch (error) {
    console.error('❌ Error seeding yoga data:', error);
    throw error;
  }
}

// Run the seed function
seedYogaData()
  .then(() => {
    console.log('🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }); 