import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  uuid,
  boolean,
  decimal,
  jsonb,
  time,
  date,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, classes } from './schema';

// ============================================
// ENUMS
// ============================================

export const contentTypeEnum = pgEnum('content_type', [
  'class',
  'course',
  'asana',
  'breathing',
  'meditation',
  'quick_sequence',
  'challenge',
  'live_class',
  'workshop',
  'article',
  'program',
]);

export const contentStatusEnum = pgEnum('content_status', [
  'draft',
  'published',
  'scheduled',
  'archived',
]);

export const contentVisibilityEnum = pgEnum('content_visibility', [
  'public',
  'members',
  'premium',
  'private',
]);

// ============================================
// BASE CONTENT TABLE
// ============================================

export const contentItems = pgTable('content_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  teacherId: uuid('teacher_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentType: contentTypeEnum('content_type').notNull(),
  
  // Common fields
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 200 }).unique(),
  
  // Media
  thumbnailUrl: text('thumbnail_url'),
  coverUrl: text('cover_url'),
  previewUrl: text('preview_url'),
  
  // Status and visibility
  status: contentStatusEnum('status').default('draft'),
  visibility: contentVisibilityEnum('visibility').default('public'),
  publishedAt: timestamp('published_at'),
  scheduledFor: timestamp('scheduled_for'),
  
  // Categorization
  tags: text('tags').array(),
  categories: text('categories').array(),
  difficulty: varchar('difficulty', { length: 20 }),
  durationMin: integer('duration_min'),
  
  // Metadata
  metadata: jsonb('metadata').default({}),
  
  // SEO
  seoTitle: varchar('seo_title', { length: 200 }),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords').array(),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  teacherIdx: index('idx_content_teacher').on(table.teacherId),
  typeIdx: index('idx_content_type').on(table.contentType),
  statusIdx: index('idx_content_status').on(table.status),
  publishedIdx: index('idx_content_published').on(table.publishedAt),
}));

// ============================================
// ASANA LIBRARY
// ============================================

export const asanas = pgTable('asanas', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id').references(() => contentItems.id, { onDelete: 'cascade' }),
  
  // Names
  sanskritName: varchar('sanskrit_name', { length: 100 }).notNull(),
  englishName: varchar('english_name', { length: 100 }).notNull(),
  
  // Classification
  category: varchar('category', { length: 50 }),
  poseType: varchar('pose_type', { length: 50 }),
  
  // Details
  benefits: text('benefits').array(),
  contraindications: text('contraindications').array(),
  alignmentCues: text('alignment_cues').array(),
  commonMistakes: text('common_mistakes').array(),
  
  // Related poses
  preparatoryPoses: uuid('preparatory_poses').array(),
  followUpPoses: uuid('follow_up_poses').array(),
  variations: jsonb('variations'),
  
  // Practice details
  holdDurationSeconds: integer('hold_duration_seconds'),
  breathPattern: varchar('breath_pattern', { length: 100 }),
  drishti: varchar('drishti', { length: 50 }),
  
  // Media
  coverUrls: text('cover_urls').array(),
  videoUrl: text('video_url'),
  anatomyUrl: text('anatomy_url'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index('idx_asanas_category').on(table.category),
}));

// ============================================
// BREATHING EXERCISES
// ============================================

export const breathingExercises = pgTable('breathing_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id').references(() => contentItems.id, { onDelete: 'cascade' }),
  
  // Pattern
  patternType: varchar('pattern_type', { length: 50 }),
  inhaleCount: integer('inhale_count'),
  holdInCount: integer('hold_in_count'),
  exhaleCount: integer('exhale_count'),
  holdOutCount: integer('hold_out_count'),
  
  // Practice details
  rounds: integer('rounds'),
  roundDurationSeconds: integer('round_duration_seconds'),
  totalDurationMin: integer('total_duration_min'),
  
  // Guidance
  audioGuidanceUrl: text('audio_guidance_url'),
  visualPatternData: jsonb('visual_pattern_data'),
  instructions: text('instructions'),
  
  // Health
  benefits: text('benefits').array(),
  contraindications: text('contraindications').array(),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  patternIdx: index('idx_breathing_pattern').on(table.patternType),
}));

// ============================================
// QUICK SEQUENCES
// ============================================

export const quickSequences = pgTable('quick_sequences', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id').references(() => contentItems.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').references(() => classes.id),
  
  // Type
  sequenceType: varchar('sequence_type', { length: 50 }),
  targetArea: varchar('target_area', { length: 50 }),
  
  // Sequence
  poseSequence: jsonb('pose_sequence'),
  
  // Time recommendation
  recommendedTime: varchar('recommended_time', { length: 20 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// CHALLENGES
// ============================================

export const challenges = pgTable('challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id').references(() => contentItems.id, { onDelete: 'cascade' }),
  teacherId: uuid('teacher_id').references(() => users.id),
  
  // Duration
  durationDays: integer('duration_days').notNull(),
  challengeType: varchar('challenge_type', { length: 50 }),
  
  // Details
  difficultyProgression: varchar('difficulty_progression', { length: 50 }),
  restDays: integer('rest_days').array(),
  
  // Engagement
  dailyNotificationTime: time('daily_notification_time'),
  completionBadgeUrl: text('completion_badge_url'),
  certificateTemplate: text('certificate_template'),
  
  // Stats
  totalParticipants: integer('total_participants').default(0),
  completionRate: decimal('completion_rate', { precision: 5, scale: 2 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  durationIdx: index('idx_challenges_duration').on(table.durationDays),
}));

export const challengeDays = pgTable('challenge_days', {
  id: uuid('id').defaultRandom().primaryKey(),
  challengeId: uuid('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  
  dayNumber: integer('day_number').notNull(),
  title: varchar('title', { length: 200 }),
  description: text('description'),
  
  // Content reference
  contentType: contentTypeEnum('content_type'),
  contentId: uuid('content_id'),
  
  // Day specifics
  isRestDay: boolean('is_rest_day').default(false),
  isOptional: boolean('is_optional').default(false),
  unlockAfterDays: integer('unlock_after_days'),
  
  // Motivation
  dailyTip: text('daily_tip'),
  motivationQuote: text('motivation_quote'),
  
  sortOrder: integer('sort_order'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueDayNumber: uniqueIndex('unique_challenge_day').on(table.challengeId, table.dayNumber),
}));

// ============================================
// LIVE CLASSES
// ============================================

export const liveClasses = pgTable('live_classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id').references(() => contentItems.id, { onDelete: 'cascade' }),
  teacherId: uuid('teacher_id').references(() => users.id),
  
  // Scheduling
  scheduledStart: timestamp('scheduled_start').notNull(),
  scheduledEnd: timestamp('scheduled_end').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  
  // LiveKit integration
  livekitRoomId: varchar('livekit_room_id', { length: 100 }),
  livekitRoomToken: text('livekit_room_token'),
  
  // Settings
  maxParticipants: integer('max_participants'),
  registrationRequired: boolean('registration_required').default(false),
  recordingEnabled: boolean('recording_enabled').default(true),
  chatEnabled: boolean('chat_enabled').default(true),
  
  // Recurring
  isRecurring: boolean('is_recurring').default(false),
  recurrencePattern: jsonb('recurrence_pattern'),
  parentSeriesId: uuid('parent_series_id'),
  
  // Post-class
  recordingUrl: text('recording_url'),
  recordingAvailableUntil: timestamp('recording_available_until'),
  
  // Stats
  registeredCount: integer('registered_count').default(0),
  attendedCount: integer('attended_count').default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  scheduledIdx: index('idx_live_classes_scheduled').on(table.scheduledStart),
}));

export const liveClassRegistrations = pgTable('live_class_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  liveClassId: uuid('live_class_id').notNull().references(() => liveClasses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
  attended: boolean('attended').default(false),
  attendedDurationMin: integer('attended_duration_min'),
}, (table) => ({
  uniqueRegistration: uniqueIndex('unique_live_registration').on(table.liveClassId, table.userId),
}));

// ============================================
// WORKSHOPS
// ============================================

export const workshops = pgTable('workshops', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id').references(() => contentItems.id, { onDelete: 'cascade' }),
  teacherId: uuid('teacher_id').references(() => users.id),
  
  // Format
  format: varchar('format', { length: 50 }),
  location: text('location'),
  venueDetails: jsonb('venue_details'),
  
  // Scheduling
  startDatetime: timestamp('start_datetime'),
  endDatetime: timestamp('end_datetime'),
  
  // Content
  segments: jsonb('segments'),
  materialsUrl: text('materials_url'),
  
  // Capacity
  minParticipants: integer('min_participants'),
  maxParticipants: integer('max_participants'),
  
  // Pricing
  price: decimal('price', { precision: 10, scale: 2 }),
  earlyBirdPrice: decimal('early_bird_price', { precision: 10, scale: 2 }),
  earlyBirdUntil: date('early_bird_until'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// PROGRAMS
// ============================================

export const programs = pgTable('programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id').references(() => contentItems.id, { onDelete: 'cascade' }),
  teacherId: uuid('teacher_id').references(() => users.id),
  
  // Structure
  totalWeeks: integer('total_weeks').notNull(),
  sessionsPerWeek: integer('sessions_per_week'),
  
  // Prerequisites
  prerequisites: text('prerequisites').array(),
  requiredProps: text('required_props').array(),
  
  // Completion
  completionRequirements: jsonb('completion_requirements'),
  certificateTemplate: text('certificate_template'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const programModules = pgTable('program_modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  
  weekNumber: integer('week_number').notNull(),
  moduleTitle: varchar('module_title', { length: 200 }),
  moduleDescription: text('module_description'),
  
  // Content references
  contentItems: uuid('content_items').array(),
  
  // Assessment
  hasAssessment: boolean('has_assessment').default(false),
  assessmentData: jsonb('assessment_data'),
  
  sortOrder: integer('sort_order'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// PROGRESS TRACKING
// ============================================

export const contentProgress = pgTable('content_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentItemId: uuid('content_item_id').notNull().references(() => contentItems.id, { onDelete: 'cascade' }),
  
  // Progress
  startedAt: timestamp('started_at').notNull().defaultNow(),
  lastAccessedAt: timestamp('last_accessed_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  
  // Tracking
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 }).default('0'),
  lastPosition: integer('last_position'),
  
  // User data
  userNotes: text('user_notes'),
  userRating: integer('user_rating'),
  favorited: boolean('favorited').default(false),
}, (table) => ({
  uniqueUserContent: uniqueIndex('unique_user_content_progress').on(table.userId, table.contentItemId),
  userIdx: index('idx_progress_user').on(table.userId),
  contentIdx: index('idx_progress_content').on(table.contentItemId),
  completedIdx: index('idx_content_progress_completed').on(table.completedAt),
}));

// ============================================
// ANALYTICS
// ============================================

export const contentAnalytics = pgTable('content_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentItemId: uuid('content_item_id').notNull().references(() => contentItems.id, { onDelete: 'cascade' }),
  
  // Metrics
  totalViews: integer('total_views').default(0),
  uniqueViewers: integer('unique_viewers').default(0),
  totalCompletions: integer('total_completions').default(0),
  avgCompletionRate: decimal('avg_completion_rate', { precision: 5, scale: 2 }),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }),
  
  // Engagement
  totalFavorites: integer('total_favorites').default(0),
  totalShares: integer('total_shares').default(0),
  totalComments: integer('total_comments').default(0),
  
  // Time-based
  peakHour: integer('peak_hour'),
  peakDayOfWeek: integer('peak_day_of_week'),
  
  lastCalculatedAt: timestamp('last_calculated_at').notNull().defaultNow(),
}, (table) => ({
  contentIdx: index('idx_analytics_content').on(table.contentItemId),
}));

// ============================================
// TYPES
// ============================================

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;
export type Asana = typeof asanas.$inferSelect;
export type NewAsana = typeof asanas.$inferInsert;
export type BreathingExercise = typeof breathingExercises.$inferSelect;
export type NewBreathingExercise = typeof breathingExercises.$inferInsert;
export type QuickSequence = typeof quickSequences.$inferSelect;
export type NewQuickSequence = typeof quickSequences.$inferInsert;
export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
export type ChallengeDay = typeof challengeDays.$inferSelect;
export type NewChallengeDay = typeof challengeDays.$inferInsert;
export type LiveClass = typeof liveClasses.$inferSelect;
export type NewLiveClass = typeof liveClasses.$inferInsert;
export type Workshop = typeof workshops.$inferSelect;
export type NewWorkshop = typeof workshops.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;