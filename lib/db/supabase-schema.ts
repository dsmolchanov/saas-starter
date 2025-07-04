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
  isPublished: integer('is_published').notNull().default(0),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .references(() => courses.id)
    .notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  durationMin: integer('duration_min'),
  videoPath: text('video_path'),
  orderIndex: integer('order_index'),
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
  stripeCustomerId: text('stripe_customer_id').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  currentPeriodEnd: timestamp('current_period_end'),
});

export const teachers = pgTable('teachers', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id),
  bio: text('bio'),
  instagramUrl: varchar('instagram_url', { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  progress: many(progress),
  subscriptions: many(subscriptions),
  teacherProfile: many(teachers),
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

export const teachersRelations = relations(teachers, ({ one }) => ({
  user: one(users, {
    fields: [teachers.id],
    references: [users.id],
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
export type Progress = typeof progress.$inferSelect;
export type NewProgress = typeof progress.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
