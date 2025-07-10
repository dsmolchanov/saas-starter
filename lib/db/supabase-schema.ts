import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 20 }).notNull().default('student'),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 100 }),
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id')
    .references(() => categories.id)
    .notNull(),
  teacherId: uuid('teacher_id')
    .references(() => users.id)
    .notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  level: varchar('level', { length: 50 }),
  coverUrl: text('cover_url'),
  imageUrl: text('image_url'),
  isPublished: integer('is_published').notNull().default(0),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .references(() => courses.id),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  durationMin: integer('duration_min').notNull().default(0),
  videoPath: text('video_path'),
  thumbnailUrl: text('thumbnail_url'),
  imageUrl: text('image_url'),
  difficulty: varchar('difficulty', { length: 20 }), // beginner, intermediate, advanced
  intensity: varchar('intensity', { length: 20 }), // low, medium, high
  style: varchar('style', { length: 50 }), // e.g., 'Vinyasa', 'Hatha', etc.
  equipment: text('equipment'), // Comma-separated list of equipment
  orderIndex: integer('order_index'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Focus areas table (e.g., Core, Flexibility, Strength)
export const focusAreas = pgTable('focus_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }),
});

// Junction table for many-to-many relationship between lessons and focus areas
export const lessonFocusAreas = pgTable('lesson_focus_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .references(() => lessons.id)
    .notNull(),
  focusAreaId: uuid('focus_area_id')
    .references(() => focusAreas.id)
    .notNull(),
});

export const progress = pgTable('progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  lessonId: uuid('lesson_id')
    .references(() => lessons.id)
    .notNull(),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  status: varchar('status', { length: 20 }).notNull(),
  currentPeriodEnd: timestamp('current_period_end'),
});

export const teachers = pgTable('teachers', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id),
  bio: text('bio'),
  instagramUrl: varchar('instagram_url', { length: 255 }),
  revenueShare: integer('revenue_share').notNull().default(0),
});

// Playlists table - user-created playlists and system playlists (favorites, etc.)
export const playlists = pgTable('playlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isPublic: integer('is_public').notNull().default(0), // 0 = private, 1 = public
  isSystem: integer('is_system').notNull().default(0), // 0 = user-created, 1 = system (favorites, etc.)
  playlistType: varchar('playlist_type', { length: 20 }).notNull().default('custom'), // 'favorites', 'custom', 'generated'
  coverUrl: text('cover_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Playlist items - polymorphic relationship to lessons, courses, teachers
export const playlistItems = pgTable('playlist_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  playlistId: uuid('playlist_id')
    .references(() => playlists.id, { onDelete: 'cascade' })
    .notNull(),
  itemType: varchar('item_type', { length: 20 }).notNull(), // 'lesson', 'course', 'teacher'
  itemId: uuid('item_id').notNull(), // UUID of the lesson/course/teacher
  orderIndex: integer('order_index').notNull().default(0),
  addedAt: timestamp('added_at').notNull().defaultNow(),
  addedBy: uuid('added_by').references(() => users.id), // Who added this item
}, (table) => ({
  // Unique constraint to prevent duplicate items in same playlist
  uniquePlaylistItem: {
    columns: [table.playlistId, table.itemType, table.itemId],
    name: 'unique_playlist_item_supabase',
  },
}));

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  progress: many(progress),
  subscriptions: many(subscriptions),
  teacherProfile: many(teachers),
  playlists: many(playlists),
  playlistItemsAdded: many(playlistItems, { relationName: 'playlistItemsAddedBy' }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  teacher: one(users, {
    fields: [courses.teacherId],
    references: [users.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(progress),
  focusAreas: many(lessonFocusAreas),
}));

export const focusAreasRelations = relations(focusAreas, ({ many }) => ({
  lessons: many(lessonFocusAreas),
}));

export const lessonFocusAreasRelations = relations(lessonFocusAreas, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonFocusAreas.lessonId],
    references: [lessons.id],
  }),
  focusArea: one(focusAreas, {
    fields: [lessonFocusAreas.focusAreaId],
    references: [focusAreas.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.id],
    references: [users.id],
  }),
  courses: many(courses),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  items: many(playlistItems),
}));

export const playlistItemsRelations = relations(playlistItems, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistItems.playlistId],
    references: [playlists.id],
  }),
  addedBy: one(users, {
    fields: [playlistItems.addedBy],
    references: [users.id],
    relationName: 'playlistItemsAddedBy',
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
export type FocusArea = typeof focusAreas.$inferSelect;
export type NewFocusArea = typeof focusAreas.$inferInsert;
export type LessonFocusArea = typeof lessonFocusAreas.$inferSelect;
export type NewLessonFocusArea = typeof lessonFocusAreas.$inferInsert;
export type Progress = typeof progress.$inferSelect;
export type NewProgress = typeof progress.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type PlaylistItem = typeof playlistItems.$inferSelect;
export type NewPlaylistItem = typeof playlistItems.$inferInsert;
