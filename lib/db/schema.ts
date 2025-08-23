import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  uuid,
  date,
  time,
  boolean,
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
  teacherApplicationStatus: varchar('teacher_application_status', { length: 20 }),
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
  videoPath: text('video_path'), // For uploaded videos (legacy support)
  videoUrl: text('video_url'), // For external URLs (YouTube, Vimeo, etc.)
  videoType: varchar('video_type', { length: 20 }).default('upload'), // 'upload', 'youtube', 'vimeo', 'external', 'mux'
  thumbnailUrl: text('thumbnail_url'),
  imageUrl: text('image_url'),
  // MUX integration fields
  muxAssetId: text('mux_asset_id'), // MUX Asset ID
  muxPlaybackId: text('mux_playback_id'), // MUX Playback ID for streaming
  muxUploadId: text('mux_upload_id'), // MUX Upload ID for direct uploads
  muxStatus: varchar('mux_status', { length: 20 }), // 'preparing', 'ready', 'errored'
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

export const teacherApplications = pgTable('teacher_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Application data
  experienceLevel: varchar('experience_level', { length: 50 }).notNull(),
  trainingBackground: text('training_background').notNull(),
  offlinePractice: text('offline_practice'),
  regularStudentsCount: varchar('regular_students_count', { length: 50 }),
  revenueModel: varchar('revenue_model', { length: 50 }).notNull(),
  
  // Additional info
  motivation: text('motivation'),
  additionalInfo: text('additional_info'),
  
  // Application status
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewNotes: text('review_notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserApplication: {
    columns: [table.userId],
    name: 'unique_user_teacher_application',
  },
}));

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

// Yoga Enhancement Tables

export const breathingExercises = pgTable('breathing_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  sanskritName: varchar('sanskrit_name', { length: 100 }),
  durationPattern: varchar('duration_pattern', { length: 50 }),
  description: text('description'),
  difficulty: varchar('difficulty', { length: 20 }),
  benefits: text('benefits'),
  instructions: text('instructions'),
  contraindications: text('contraindications'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const chakras = pgTable('chakras', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  sanskritName: varchar('sanskrit_name', { length: 50 }).notNull(),
  number: integer('number').notNull(),
  color: varchar('color', { length: 20 }).notNull(),
  element: varchar('element', { length: 30 }),
  location: text('location'),
  description: text('description'),
  healingPractices: text('healing_practices'),
  mantra: varchar('mantra', { length: 20 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const yogaQuotes = pgTable('yoga_quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  text: text('text').notNull(),
  author: varchar('author', { length: 100 }),
  category: varchar('category', { length: 50 }),
  language: varchar('language', { length: 10 }).default('en'),
  source: varchar('source', { length: 200 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  preferredTime: varchar('preferred_time', { length: 20 }),
  preferredDuration: integer('preferred_duration'),
  preferredStyle: varchar('preferred_style', { length: 50 }),
  preferredIntensity: varchar('preferred_intensity', { length: 20 }),
  experienceLevel: varchar('experience_level', { length: 20 }),
  injuriesLimitations: text('injuries_limitations'),
  notificationEnabled: boolean('notification_enabled').default(true),
  notificationTime: time('notification_time'),
  theme: varchar('theme', { length: 20 }).default('light'),
  language: varchar('language', { length: 10 }).default('en'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const practiceStreaks = pgTable('practice_streaks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  startDate: date('start_date').notNull(),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastPracticeDate: date('last_practice_date'),
  totalPracticeDays: integer('total_practice_days').notNull().default(0),
  streakFrozenUntil: date('streak_frozen_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const classTags = pgTable('class_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id').references(() => classes.id).notNull(),
  tagName: varchar('tag_name', { length: 50 }).notNull(),
  tagCategory: varchar('tag_category', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const yogaStyles = pgTable('yoga_styles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  intensityLevel: varchar('intensity_level', { length: 20 }),
  benefits: text('benefits'),
  typicalDuration: integer('typical_duration'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const classEquipment = pgTable('class_equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id').references(() => classes.id).notNull(),
  equipmentName: varchar('equipment_name', { length: 50 }).notNull(),
  isRequired: boolean('is_required').default(false),
  quantity: integer('quantity').default(1),
  alternatives: text('alternatives'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userGoals = pgTable('user_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  goalType: varchar('goal_type', { length: 50 }).notNull(),
  description: text('description'),
  targetDate: date('target_date'),
  targetValue: integer('target_value'),
  currentValue: integer('current_value').default(0),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const practiceReminders = pgTable('practice_reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  reminderTime: time('reminder_time').notNull(),
  enabled: boolean('enabled').default(true),
  notificationType: varchar('notification_type', { length: 20 }).default('push'),
  message: text('message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teacherSpecializations = pgTable('teacher_specializations', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  specialization: varchar('specialization', { length: 50 }).notNull(),
  certification: text('certification'),
  yearsExperience: integer('years_experience'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const meditationSessions = pgTable('meditation_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description'),
  durationMin: integer('duration_min').notNull(),
  type: varchar('type', { length: 50 }),
  teacherId: uuid('teacher_id').references(() => users.id),
  audioUrl: text('audio_url'),
  thumbnailUrl: text('thumbnail_url'),
  focus: varchar('focus', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// RELATIONS

export const usersRelations = relations(users, ({ many, one }) => ({
    teacherProfile: one(teachers, {
        fields: [users.id],
        references: [teachers.id],
    }),
    teacherApplication: one(teacherApplications, {
        fields: [users.id],
        references: [teacherApplications.userId],
    }),
    coursesTaught: many(courses),
    progress: many(progress),
    subscriptions: many(subscriptions),
    playlists: many(playlists),
    playlistItemsAdded: many(playlistItems, { relationName: 'playlistItemsAddedBy' }),
    teamMemberships: many(teamMembers),
    invitationsSent: many(invitations),
    activityLogs: many(activityLogs),
    preferences: one(userPreferences, {
        fields: [users.id],
        references: [userPreferences.userId],
    }),
    practiceStreak: one(practiceStreaks, {
        fields: [users.id],
        references: [practiceStreaks.userId],
    }),
    goals: many(userGoals),
    reminders: many(practiceReminders),
    specializations: many(teacherSpecializations),
    meditationSessions: many(meditationSessions),
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
  tags: many(classTags),
  equipment: many(classEquipment),
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

export const teacherApplicationsRelations = relations(teacherApplications, ({ one }) => ({
  user: one(users, {
    fields: [teacherApplications.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [teacherApplications.reviewedBy],
    references: [users.id],
  }),
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

// New table relations

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const practiceStreaksRelations = relations(practiceStreaks, ({ one }) => ({
  user: one(users, {
    fields: [practiceStreaks.userId],
    references: [users.id],
  }),
}));

export const classTagsRelations = relations(classTags, ({ one }) => ({
  class: one(classes, {
    fields: [classTags.classId],
    references: [classes.id],
  }),
}));

export const classEquipmentRelations = relations(classEquipment, ({ one }) => ({
  class: one(classes, {
    fields: [classEquipment.classId],
    references: [classes.id],
  }),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, {
    fields: [userGoals.userId],
    references: [users.id],
  }),
}));

export const practiceRemindersRelations = relations(practiceReminders, ({ one }) => ({
  user: one(users, {
    fields: [practiceReminders.userId],
    references: [users.id],
  }),
}));

export const teacherSpecializationsRelations = relations(teacherSpecializations, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherSpecializations.teacherId],
    references: [users.id],
  }),
}));

export const meditationSessionsRelations = relations(meditationSessions, ({ one }) => ({
  teacher: one(users, {
    fields: [meditationSessions.teacherId],
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
export type TeacherApplication = typeof teacherApplications.$inferSelect;
export type NewTeacherApplication = typeof teacherApplications.$inferInsert;

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
