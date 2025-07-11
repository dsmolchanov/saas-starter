import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  uuid,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// This is the single source of truth for the database schema.
// It uses UUIDs for all primary keys to be compatible with Supabase.

// Corresponds to the public.users table, which should be kept in sync with auth.users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(), // This ID must match the ID in auth.users
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).unique(),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash'),
  // Role can be 'student' or 'teacher' or 'admin'
  role: varchar('role', { length: 20 }).notNull().default('student'),
});

export const teams = pgTable('teams', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripeProductId: text('stripe_product_id'),
    planName: varchar('plan_name', { length: 50 }),
    subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    teamId: uuid('team_id').notNull().references(() => teams.id),
    role: varchar('role', { length: 50 }).notNull(),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id').notNull().references(() => teams.id),
    userId: uuid('user_id').references(() => users.id),
    action: text('action').notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id').notNull().references(() => teams.id),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    invitedBy: uuid('invited_by').notNull().references(() => users.id),
    invitedAt: timestamp('invited_at').notNull().defaultNow(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 100 }),
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  level: varchar('level', { length: 50 }),
  coverUrl: text('cover_url'),
  imageUrl: text('image_url'),
  isPublished: integer('is_published').notNull().default(0),
});

export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  durationMin: integer('duration_min').notNull().default(0),
  videoPath: text('video_path'),
  thumbnailUrl: text('thumbnail_url'),
  imageUrl: text('image_url'),
  difficulty: varchar('difficulty', { length: 20 }),
  intensity: varchar('intensity', { length: 20 }),
  style: varchar('style', { length: 50 }),
  equipment: text('equipment'),
  orderIndex: integer('order_index'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Keep lessons as an alias for backward compatibility
export const lessons = classes;

export const focusAreas = pgTable('focus_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }),
});

export const lessonFocusAreas = pgTable('lesson_focus_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id').references(() => classes.id).notNull(),
  focusAreaId: uuid('focus_area_id').references(() => focusAreas.id).notNull(),
});

export const progress = pgTable('progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  classId: uuid('class_id').references(() => classes.id).notNull(),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  status: varchar('status', { length: 20 }).notNull(),
  currentPeriodEnd: timestamp('current_period_end'),
});

export const teachers = pgTable('teachers', {
  id: uuid('id').primaryKey().references(() => users.id),
  bio: text('bio'),
  instagramUrl: varchar('instagram_url', { length: 255 }),
  revenueShare: integer('revenue_share').notNull().default(0),
});

export const playlists = pgTable('playlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isPublic: integer('is_public').notNull().default(0),
  isSystem: integer('is_system').notNull().default(0),
  playlistType: varchar('playlist_type', { length: 20 }).notNull().default('custom'),
  coverUrl: text('cover_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const playlistItems = pgTable('playlist_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    playlistId: uuid('playlist_id').references(() => playlists.id, { onDelete: 'cascade' }).notNull(),
    itemType: varchar('item_type', { length: 20 }).notNull(),
    itemId: uuid('item_id').notNull(),
    orderIndex: integer('order_index').notNull().default(0),
    addedAt: timestamp('added_at').notNull().defaultNow(),
    addedBy: uuid('added_by').references(() => users.id),
}, (table) => ({
    uniquePlaylistItem: {
        columns: [table.playlistId, table.itemType, table.itemId],
        name: 'unique_playlist_item_supabase',
    },
}));

export const dailyUserMetrics = pgTable('daily_user_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    date: date('date').notNull(),
    minutesSpent: integer('minutes_spent').notNull().default(0),
    lessonsCompleted: integer('lessons_completed').notNull().default(0),
    streakDays: integer('streak_days').notNull().default(0),
});

export const dailyTeacherMetrics = pgTable('daily_teacher_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    teacherId: uuid('teacher_id').references(() => users.id).notNull(),
    date: date('date').notNull(),
    uniqueUsers: integer('unique_users').notNull().default(0),
    minutesWatched: integer('minutes_watched').notNull().default(0),
    lessonsCompleted: integer('lessons_completed').notNull().default(0),
});

// RELATIONS

export const usersRelations = relations(users, ({ many, one }) => ({
    teacherProfile: one(teachers, {
        fields: [users.id],
        references: [teachers.id],
    }),
    coursesTaught: many(courses),
    progress: many(progress),
    subscriptions: many(subscriptions),
    playlists: many(playlists),
    playlistItemsAdded: many(playlistItems, { relationName: 'playlistItemsAddedBy' }),
    teamMemberships: many(teamMembers),
    invitationsSent: many(invitations),
    activityLogs: many(activityLogs),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
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
  classes: many(classes),
  lessons: many(classes), // Alias for backward compatibility
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  course: one(courses, {
    fields: [classes.courseId],
    references: [courses.id],
  }),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  progress: many(progress),
  focusAreas: many(lessonFocusAreas),
}));

// Alias for backward compatibility
export const lessonsRelations = classesRelations;

export const focusAreasRelations = relations(focusAreas, ({ many }) => ({
  lessons: many(lessonFocusAreas),
}));

export const lessonFocusAreasRelations = relations(lessonFocusAreas, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonFocusAreas.classId],
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
    fields: [progress.classId],
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

export const dailyUserMetricsRelations = relations(dailyUserMetrics, ({ one }) => ({
  user: one(users, {
    fields: [dailyUserMetrics.userId],
    references: [users.id],
  }),
}));

export const dailyTeacherMetricsRelations = relations(dailyTeacherMetrics, ({ one }) => ({
  teacher: one(users, {
    fields: [dailyTeacherMetrics.teacherId],
    references: [users.id],
  }),
}));


// TYPES

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
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
export type DailyUserMetric = typeof dailyUserMetrics.$inferSelect;
export type NewDailyUserMetric = typeof dailyUserMetrics.$inferInsert;
export type DailyTeacherMetric = typeof dailyTeacherMetrics.$inferSelect;
export type NewDailyTeacherMetric = typeof dailyTeacherMetrics.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
