# Dzen Yoga Platform - Project Context

## 🧘‍♀️ Project Overview

**Dzen Yoga** is a comprehensive online yoga platform that connects students with certified yoga instructors through video-based classes and courses. Built on Next.js 15 with modern React patterns, the platform serves multiple user types with distinct workflows and capabilities.

### Core Value Proposition
- **For Students**: Discover teachers you'll love, customize every aspect of your practice, and connect deeper with personalized guidance
- **For Teachers**: Share your expertise, build your student community, and earn revenue through the platform
- **For Administrators**: Manage the platform, approve teacher applications, and oversee content quality

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI with shadcn/ui
- **State Management**: SWR for data fetching and caching
- **Icons**: Lucide React
- **Internationalization**: next-intl (English, Russian, Spanish)

### Backend
- **Database**: PostgreSQL (local dev) / Supabase (production)
- **ORM**: Drizzle ORM with UUID primary keys
- **Authentication**: Supabase Auth + custom session management
- **File Storage**: Supabase Storage for video/image uploads
- **Payments**: Stripe integration
- **Video Processing**: YouTube Data API for metadata

### Development Environment
- **Local Database**: PostgreSQL with serial IDs
- **Production Database**: Supabase with UUID IDs
- **File Uploads**: Supabase Storage
- **Development Tools**: Turbopack, TypeScript, ESLint

---

## 📊 Data Structure & Schema

### Core Entities

#### 🧑‍🎓 Users & Authentication
```typescript
users {
  id: uuid (primary key)
  name: varchar(100)
  email: varchar(255) unique
  avatarUrl: text
  passwordHash: text
  role: varchar(20) // 'student', 'teacher', 'admin'
  teacherApplicationStatus: varchar(20) // 'pending', 'approved', 'rejected'
}
```

#### 👩‍🏫 Teachers
```typescript
teachers {
  id: uuid (references users.id)
  bio: text
  instagramUrl: varchar(255)
  revenueShare: integer (default: 0)
}

teacherApplications {
  id: uuid
  userId: uuid
  experienceLevel: varchar(50)
  trainingBackground: text
  offlinePractice: text
  regularStudentsCount: varchar(50)
  revenueModel: varchar(50)
  motivation: text
  additionalInfo: text
  status: varchar(20) // 'pending', 'approved', 'rejected'
  submittedAt: timestamp
  reviewedAt: timestamp
  reviewedBy: uuid
  reviewNotes: text
}
```

#### 📚 Content Structure
```typescript
categories {
  id: uuid
  slug: varchar(50) unique
  title: varchar(100)
  icon: varchar(100)
}

courses {
  id: uuid
  categoryId: uuid
  teacherId: uuid
  title: varchar(150)
  description: text
  level: varchar(50)
  coverUrl: text
  imageUrl: text
  isPublished: integer
}

classes {
  id: uuid
  courseId: uuid (optional - can be standalone)
  teacherId: uuid
  title: varchar(150)
  description: text
  durationMin: integer
  videoPath: text // For uploaded videos
  videoUrl: text // For external URLs (YouTube, Vimeo)
  videoType: varchar(20) // 'upload', 'youtube', 'vimeo', 'external'
  thumbnailUrl: text
  imageUrl: text // Custom cover image
  difficulty: varchar(20)
  intensity: varchar(20)
  style: varchar(50)
  equipment: text
  orderIndex: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 🎯 Focus Areas & Categorization
```typescript
focusAreas {
  id: uuid
  name: varchar(50) unique
  icon: varchar(50)
}

lessonFocusAreas {
  id: uuid
  classId: uuid
  focusAreaId: uuid
}
```

#### 📈 Progress & Analytics
```typescript
progress {
  id: uuid
  userId: uuid
  classId: uuid
  completedAt: timestamp
}

dailyUserMetrics {
  id: uuid
  userId: uuid
  date: date
  minutesSpent: integer
  lessonsCompleted: integer
  streakDays: integer
}

dailyTeacherMetrics {
  id: uuid
  teacherId: uuid
  date: date
  uniqueUsers: integer
  minutesWatched: integer
  lessonsCompleted: integer
}
```

#### 🎵 Playlists & Favorites
```typescript
playlists {
  id: uuid
  userId: uuid
  name: varchar(100)
  description: text
  isPublic: integer
  isSystem: integer
  playlistType: varchar(20) // 'custom', 'favorites', 'recent'
  coverUrl: text
  createdAt: timestamp
  updatedAt: timestamp
}

playlistItems {
  id: uuid
  playlistId: uuid
  itemType: varchar(20) // 'lesson', 'course', 'teacher'
  itemId: uuid
  orderIndex: integer
  addedAt: timestamp
  addedBy: uuid
}
```

#### 💳 Subscriptions & Payments
```typescript
subscriptions {
  id: uuid
  userId: uuid
  stripeCustomerId: text
  status: varchar(20)
  currentPeriodEnd: timestamp
}

teams {
  id: uuid
  name: varchar(100)
  createdAt: timestamp
  updatedAt: timestamp
  stripeCustomerId: text
  stripeSubscriptionId: text
  stripeProductId: text
  planName: varchar(50)
  subscriptionStatus: varchar(20)
}
```

---

## 🔄 User Flows & Journeys

### 1. 👤 Student Journey

#### Registration & Onboarding
```
1. Landing Page ("/") 
   → View featured content, teachers, and benefits
   → "Start Free Trial" or "Browse Classes"

2. Registration ("/sign-up")
   → Email/password or Google OAuth
   → Automatic redirect to /my_practice

3. First Time Experience ("/my_practice")
   → Empty state with encouragement to explore
   → Browse recommendations
   → Access to /browse for content discovery
```

#### Content Discovery & Consumption
```
1. Browse Content ("/browse")
   → Filter by duration, style, difficulty, teacher
   → View teacher profiles ("/teacher/[id]")
   → Preview class details ("/classes/[id]")

2. Content Consumption
   → Watch videos with progress tracking
   → Add to favorites/playlists
   → Complete classes (progress saved)

3. Practice Management ("/my_practice")
   → View completed classes
   → Track stats (minutes, sessions, streaks)
   → Manage playlists and favorites
```

#### Subscription & Premium Features
```
1. Subscription Flow ("/pricing")
   → Choose plan
   → Stripe Checkout integration
   → Access to premium content

2. Premium Experience
   → Unlimited access to all content
   → Priority customer support
   → Advanced analytics
```

### 2. 👩‍🏫 Teacher Journey

#### Application & Onboarding
```
1. Teacher Application ("/my_practice" → Apply to Teach)
   → Multi-step onboarding form
   → Experience level and background
   → Training certifications
   → Teaching motivation
   → Revenue model preferences

2. Application Review (Admin-managed)
   → Admin reviews application
   → Approval/rejection with feedback
   → Status updates to applicant

3. Teacher Setup (Post-approval)
   → Profile completion ("/my_practice" teacher mode)
   → Bio, Instagram, revenue sharing setup
   → First content creation
```

#### Content Creation & Management
```
1. Class Creation ("/my_practice" → Create Class)
   → Video upload (MP4, MOV, etc.) OR YouTube/Vimeo URL
   → Automatic duration detection
   → Thumbnail generation/custom upload
   → Metadata: title, description, difficulty, style
   → Focus areas and equipment tags

2. Course Management
   → Group classes into structured courses
   → Set course order and progression
   → Course-level metadata and images

3. Content Publishing
   → Preview as student would see ("/classes/[id]")
   → Edit/update existing content
   → Manage visibility and access
```

#### Analytics & Revenue
```
1. Teacher Dashboard ("/my_practice" teacher view)
   → View student engagement metrics
   → Track earnings and revenue share
   → Monitor class performance

2. Student Interaction
   → View who's taking classes
   → Respond to feedback
   → Build community
```

### 3. 🔧 Admin Journey

#### Platform Management
```
1. Admin Dashboard ("/admin/*")
   → Teacher application reviews
   → Content moderation
   → User management
   → Platform analytics

2. Teacher Application Review ("/admin/teacher-applications")
   → Review pending applications
   → Approve/reject with notes
   → Manage teacher onboarding

3. Content Oversight
   → Monitor uploaded content
   → Quality assurance
   → Policy enforcement
```

---

## 🔄 Key Technical Workflows

### Video Upload & Processing
```
1. Teacher uploads video file
   → Client-side duration detection (HTML5 video)
   → Upload to Supabase Storage
   → Store file path in database

2. YouTube/Vimeo URL input
   → Parse video URL for platform and ID
   → Extract thumbnail using platform APIs
   → Fetch duration via YouTube Data API
   → Store external URL and metadata
```

### Authentication Flow
```
1. User Registration
   → Create auth.users record (Supabase)
   → Trigger creates public.users record
   → Set session cookie
   → Redirect to intended destination

2. OAuth Login (Google)
   → Supabase OAuth flow
   → Callback handling with redirect preservation
   → User creation if first login
   → Session establishment
```

### Progress Tracking
```
1. Class Completion
   → User watches video to completion
   → Create progress record
   → Update user statistics
   → Trigger daily metrics calculation
```

### Playlist Management
```
1. Add to Favorites
   → Check if favorites playlist exists
   → Create if needed
   → Add item to playlist
   → Handle duplicates

2. Custom Playlists
   → Create named playlist
   → Add items of different types (classes, courses, teachers)
   → Manage order and organization
```

---

## 🌐 Internationalization

### Supported Locales
- **Russian (ru)**: Primary language, default
- **English (en)**: Full translation
- **Spanish Mexican (es-MX)**: Complete localization

### Translation Strategy
- **Static Messages**: Stored in `/messages/*.json`
- **Dynamic Content**: Server-side locale detection
- **URL Structure**: Optional locale prefix (e.g., `/en/browse`)
- **Fallback**: Defaults to Russian if locale not detected

---

## 🔐 Security & Permissions

### Role-Based Access Control (RBAC)
- **Students**: Content consumption, progress tracking, playlists
- **Teachers**: Content creation, student analytics, profile management  
- **Admins**: Platform management, teacher approvals, content oversight

### Data Security
- **Row-Level Security**: Supabase RLS policies
- **Session Management**: Secure JWT cookies
- **File Uploads**: Supabase Storage with access controls
- **API Protection**: Authentication middleware on all routes

---

## 📱 Mobile & Responsive Design

### Mobile-First Approach
- **Progressive Web App**: Mobile-optimized experience
- **Touch-Friendly UI**: Large tap targets, gesture support
- **Mobile Navigation**: Bottom tab navigation
- **Video Playback**: Mobile-optimized video player

### Cross-Platform Compatibility
- **Web Browsers**: Chrome, Safari, Firefox, Edge
- **Mobile Devices**: iOS, Android responsive design
- **Tablet Optimization**: Adaptive layouts for larger screens

---

This platform represents a comprehensive yoga education ecosystem that scales from individual practitioners to a global community of students and teachers, with robust content management, analytics, and monetization capabilities. 