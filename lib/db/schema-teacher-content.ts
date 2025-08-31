// Teacher Content Schema Extensions
// This file contains all the new teacher content tables

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  date,
  time,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, classes, meditationSessions } from './schema';

// Enums
export const difficultyLevelEnum = pgEnum('difficulty_level', ['beginner', 'intermediate', 'advanced', 'all', 'progressive']);
export const challengeTypeEnum = pgEnum('challenge_type', ['general', 'morning_practice', 'flexibility', 'strength', 'meditation']);
export const liveClassStatusEnum = pgEnum('live_class_status', ['scheduled', 'live', 'completed', 'cancelled']);
export const workshopStatusEnum = pgEnum('workshop_status', ['draft', 'published', 'full', 'completed']);

// 1. Challenges
export const challenges = pgTable('challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  durationDays: integer('duration_days').notNull().default(30),
  difficultyLevel: varchar('difficulty_level', { length: 20 }),
  coverUrl: text('cover_url'),
  thumbnailUrl: text('thumbnail_url'),
  challengeType: varchar('challenge_type', { length: 50 }).default('general'),
  dailyCommitmentMin: integer('daily_commitment_min').default(20),
  totalParticipants: integer('total_participants').default(0),
  isPublished: boolean('is_published').default(false),
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const challengeDays = pgTable('challenge_days', {
  id: uuid('id').defaultRandom().primaryKey(),
  challengeId: uuid('challenge_id').references(() => challenges.id).notNull(),
  dayNumber: integer('day_number').notNull(),
  title: varchar('title', { length: 150 }),
  description: text('description'),
  classId: uuid('class_id').references(() => classes.id),
  meditationId: uuid('meditation_id').references(() => meditationSessions.id),
  breathingExerciseId: uuid('breathing_exercise_id'),
  videoUrl: text('video_url'),
  durationMin: integer('duration_min'),
  focusArea: varchar('focus_area', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const challengeParticipants = pgTable('challenge_participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  challengeId: uuid('challenge_id').references(() => challenges.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  currentDay: integer('current_day').default(1),
  totalDaysCompleted: integer('total_days_completed').default(0),
  isActive: boolean('is_active').default(true),
});

// 2. Live Classes
export const liveClasses = pgTable('live_classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  scheduledFor: timestamp('scheduled_for').notNull(),
  durationMin: integer('duration_min').notNull().default(60),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  meetingUrl: text('meeting_url'),
  recordingUrl: text('recording_url'),
  style: varchar('style', { length: 50 }),
  level: varchar('level', { length: 20 }),
  thumbnailUrl: text('thumbnail_url'),
  price: decimal('price', { precision: 10, scale: 2 }).default('0'),
  isFree: boolean('is_free').default(true),
  status: varchar('status', { length: 20 }).default('scheduled'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const liveClassRegistrations = pgTable('live_class_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  liveClassId: uuid('live_class_id').references(() => liveClasses.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  registeredAt: timestamp('registered_at').defaultNow(),
  attended: boolean('attended').default(false),
  rating: integer('rating'),
  feedback: text('feedback'),
});

// 3. Breathing Exercises
export const breathingExercises = pgTable('breathing_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  sanskritName: varchar('sanskrit_name', { length: 100 }),
  description: text('description'),
  instructions: text('instructions'),
  benefits: text('benefits'),
  contraindications: text('contraindications'),
  durationMin: integer('duration_min').notNull().default(5),
  difficultyLevel: varchar('difficulty_level', { length: 20 }),
  exerciseType: varchar('exercise_type', { length: 50 }),
  videoUrl: text('video_url'),
  audioUrl: text('audio_url'),
  animationUrl: text('animation_url'),
  inhaleCount: integer('inhale_count'),
  holdCount: integer('hold_count'),
  exhaleCount: integer('exhale_count'),
  roundsRecommended: integer('rounds_recommended'),
  thumbnailUrl: text('thumbnail_url'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Workshops
export const workshops = pgTable('workshops', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  detailedOutline: text('detailed_outline'),
  durationHours: decimal('duration_hours', { precision: 3, scale: 1 }).notNull().default('2.0'),
  scheduledDate: date('scheduled_date'),
  scheduledTime: time('scheduled_time'),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  workshopType: varchar('workshop_type', { length: 50 }),
  level: varchar('level', { length: 20 }),
  price: decimal('price', { precision: 10, scale: 2 }).default('0'),
  isOnline: boolean('is_online').default(true),
  location: text('location'),
  meetingUrl: text('meeting_url'),
  recordingUrl: text('recording_url'),
  materialsUrl: text('materials_url'),
  coverUrl: text('cover_url'),
  prerequisites: text('prerequisites'),
  whatToBring: text('what_to_bring'),
  isPublished: boolean('is_published').default(false),
  status: varchar('status', { length: 20 }).default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Articles
export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  subtitle: varchar('subtitle', { length: 300 }),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverUrl: text('cover_url'),
  category: varchar('category', { length: 50 }),
  tags: text('tags').array(),
  readingTimeMin: integer('reading_time_min'),
  isFeatured: boolean('is_featured').default(false),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  viewCount: integer('view_count').default(0),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Student Groups
export const studentGroups = pgTable('student_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  groupType: varchar('group_type', { length: 50 }),
  maxMembers: integer('max_members'),
  currentMembers: integer('current_members').default(0),
  coverUrl: text('cover_url'),
  isPrivate: boolean('is_private').default(true),
  enrollmentKey: varchar('enrollment_key', { length: 50 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isActive: boolean('is_active').default(true),
  welcomeMessage: text('welcome_message'),
  guidelines: text('guidelines'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const groupMembers = pgTable('group_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').references(() => studentGroups.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 20 }).default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
  isActive: boolean('is_active').default(true),
});

// 7. Pose Library
export const poseLibrary = pgTable('pose_library', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id),
  englishName: varchar('english_name', { length: 100 }).notNull(),
  sanskritName: varchar('sanskrit_name', { length: 100 }),
  translation: varchar('translation', { length: 200 }),
  description: text('description'),
  benefits: text('benefits'),
  contraindications: text('contraindications'),
  instructions: text('instructions'),
  modifications: text('modifications'),
  variations: text('variations'),
  poseCategory: varchar('pose_category', { length: 50 }),
  difficultyLevel: varchar('difficulty_level', { length: 20 }),
  primaryMuscleGroups: text('primary_muscle_groups').array(),
  secondaryMuscleGroups: text('secondary_muscle_groups').array(),
  chakras: text('chakras').array(),
  doshas: text('doshas').array(),
  coverUrl: text('cover_url'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  prepPoses: text('prep_poses').array(),
  followUpPoses: text('follow_up_poses').array(),
  holdTimeSeconds: integer('hold_time_seconds'),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 8. Programs
export const programs = pgTable('programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  programType: varchar('program_type', { length: 50 }),
  focusArea: varchar('focus_area', { length: 100 }),
  totalSessions: integer('total_sessions').notNull(),
  weeksDuration: integer('weeks_duration'),
  difficultyLevel: varchar('difficulty_level', { length: 20 }),
  coverUrl: text('cover_url'),
  thumbnailUrl: text('thumbnail_url'),
  price: decimal('price', { precision: 10, scale: 2 }).default('0'),
  isFree: boolean('is_free').default(true),
  prerequisites: text('prerequisites'),
  outcomes: text('outcomes'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const programSessions = pgTable('program_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id').references(() => programs.id).notNull(),
  sessionNumber: integer('session_number').notNull(),
  weekNumber: integer('week_number'),
  title: varchar('title', { length: 150 }),
  description: text('description'),
  classId: uuid('class_id').references(() => classes.id),
  meditationId: uuid('meditation_id').references(() => meditationSessions.id),
  breathingExerciseId: uuid('breathing_exercise_id').references(() => breathingExercises.id),
  articleId: uuid('article_id').references(() => articles.id),
  durationMin: integer('duration_min'),
  sessionType: varchar('session_type', { length: 50 }),
  homework: text('homework'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Quick Sequences
export const quickSequences = pgTable('quick_sequences', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  durationMin: integer('duration_min').notNull(),
  sequenceType: varchar('sequence_type', { length: 50 }),
  targetArea: varchar('target_area', { length: 50 }),
  difficultyLevel: varchar('difficulty_level', { length: 20 }),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  equipmentNeeded: text('equipment_needed').array(),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 10. Philosophy Content
export const philosophyContent = pgTable('philosophy_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id),
  contentType: varchar('content_type', { length: 50 }),
  source: varchar('source', { length: 100 }),
  chapter: varchar('chapter', { length: 50 }),
  verse: varchar('verse', { length: 50 }),
  sanskritText: text('sanskrit_text'),
  transliteration: text('transliteration'),
  translation: text('translation'),
  commentary: text('commentary'),
  modernApplication: text('modern_application'),
  audioUrl: text('audio_url'),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const challengesRelations = relations(challenges, ({ one, many }) => ({
  teacher: one(users, {
    fields: [challenges.teacherId],
    references: [users.id],
  }),
  days: many(challengeDays),
  participants: many(challengeParticipants),
}));

export const challengeDaysRelations = relations(challengeDays, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeDays.challengeId],
    references: [challenges.id],
  }),
  class: one(classes, {
    fields: [challengeDays.classId],
    references: [classes.id],
  }),
  meditation: one(meditationSessions, {
    fields: [challengeDays.meditationId],
    references: [meditationSessions.id],
  }),
  breathingExercise: one(breathingExercises, {
    fields: [challengeDays.breathingExerciseId],
    references: [breathingExercises.id],
  }),
}));

export const liveClassesRelations = relations(liveClasses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [liveClasses.teacherId],
    references: [users.id],
  }),
  registrations: many(liveClassRegistrations),
}));

export const workshopsRelations = relations(workshops, ({ one }) => ({
  teacher: one(users, {
    fields: [workshops.teacherId],
    references: [users.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  teacher: one(users, {
    fields: [articles.teacherId],
    references: [users.id],
  }),
}));

export const studentGroupsRelations = relations(studentGroups, ({ one, many }) => ({
  teacher: one(users, {
    fields: [studentGroups.teacherId],
    references: [users.id],
  }),
  members: many(groupMembers),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  teacher: one(users, {
    fields: [programs.teacherId],
    references: [users.id],
  }),
  sessions: many(programSessions),
}));

// Type exports
export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
export type ChallengeDay = typeof challengeDays.$inferSelect;
export type NewChallengeDay = typeof challengeDays.$inferInsert;
export type LiveClass = typeof liveClasses.$inferSelect;
export type NewLiveClass = typeof liveClasses.$inferInsert;
export type BreathingExercise = typeof breathingExercises.$inferSelect;
export type NewBreathingExercise = typeof breathingExercises.$inferInsert;
export type Workshop = typeof workshops.$inferSelect;
export type NewWorkshop = typeof workshops.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type StudentGroup = typeof studentGroups.$inferSelect;
export type NewStudentGroup = typeof studentGroups.$inferInsert;
export type PoseLibrary = typeof poseLibrary.$inferSelect;
export type NewPoseLibrary = typeof poseLibrary.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
export type QuickSequence = typeof quickSequences.$inferSelect;
export type NewQuickSequence = typeof quickSequences.$inferInsert;
export type PhilosophyContent = typeof philosophyContent.$inferSelect;
export type NewPhilosophyContent = typeof philosophyContent.$inferInsert;