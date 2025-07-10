# Drizzle + Supabase Sync Documentation

This project supports both local PostgreSQL (with serial IDs) and Supabase (with UUID IDs) databases. Here's how to work with both systems.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│  Local Dev      │    │   Production    │
│  PostgreSQL     │    │   Supabase      │
│                 │    │                 │
│  Serial IDs     │    │   UUID IDs      │
│  schema.ts      │    │   supabase-     │
│  queries.ts     │    │   schema.ts     │
└─────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
lib/db/
├── schema.ts              # Local schema (serial IDs)
├── supabase-schema.ts     # Supabase schema (UUIDs)
├── queries.ts             # Local database queries
├── supabase-queries.ts    # Supabase database queries
├── drizzle.ts            # Database connections
└── migrations/
    ├── 0001_*.sql        # Local migrations
    ├── 0005_*.sql        # Playlist tables (local)
    └── supabase-sync.sql # Supabase complete schema
```

## 🚀 Setup Instructions

### 1. Local Development Setup

For local development with PostgreSQL:

```bash
# Set up local database
npm run db:setup

# Generate and run migrations
npm run db:generate
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 2. Supabase Setup

For production with Supabase:

```bash
# Set environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run Supabase setup (creates all tables)
npm run setup:supabase -- --force
```

## 🗃️ Schema Differences

| Feature | Local Schema | Supabase Schema |
|---------|-------------|-----------------|
| **IDs** | `serial` (1, 2, 3...) | `uuid` (generated) |
| **Auth** | Custom users table | `auth.users` integration |
| **RLS** | Not enabled | Enabled by default |
| **Types** | `integer` IDs | `uuid` IDs |

### Key Tables in Both Schemas

Both schemas include the complete yoga app structure:

- **Categories** - Yoga categories (Vinyasa, Hatha, etc.)
- **Courses** - Complete yoga courses with lessons
- **Lessons** - Individual yoga sessions with metadata
- **Focus Areas** - Core, Flexibility, Strength, etc.
- **Teachers** - Instructor profiles
- **Progress** - User lesson completion tracking
- **Playlists** - User-created and system playlists
- **Playlist Items** - Polymorphic items (lessons/courses/teachers)

## 🔧 Using the Right Queries

### Local Development (Serial IDs)

```typescript
import { 
  getUserPlaylists, 
  addToFavorites, 
  createPlaylist 
} from '@/lib/db/queries';

// Use integer IDs
const playlists = await getUserPlaylists(123);
await addToFavorites(123, 'lesson', 456);
```

### Supabase Production (UUIDs)

```typescript
import { 
  getUserPlaylistsSupabase, 
  addToFavoritesSupabase, 
  createPlaylistSupabase 
} from '@/lib/db/supabase-queries';

// Use string UUIDs
const playlists = await getUserPlaylistsSupabase('uuid-string');
await addToFavoritesSupabase('user-uuid', 'lesson', 'lesson-uuid');
```

## 🔒 Supabase RLS Policies

The Supabase schema includes Row Level Security policies:

### Public Access
- **Categories** - Readable by everyone
- **Focus Areas** - Readable by everyone
- **Published Courses/Lessons** - Readable by everyone

### User-Specific Access
- **Progress** - Users can only see their own
- **Subscriptions** - Users can only see their own
- **Playlists** - Users can see their own + public ones
- **Playlist Items** - Managed through playlist ownership

### Teacher Access
- **Courses** - Teachers can manage their own courses
- **Teacher Profile** - Teachers can edit their bio/info

## 🔄 Migration Strategy

### Adding New Features

When adding new features, update both schemas:

1. **Update Local Schema** (`lib/db/schema.ts`)
2. **Generate Migration** (`npm run db:generate`)
3. **Update Supabase Schema** (`lib/db/supabase-schema.ts`)
4. **Update Supabase Migration** (`lib/db/migrations/supabase-sync.sql`)
5. **Create Corresponding Query Functions** in both files

### Example: Adding New Table

```typescript
// 1. Add to schema.ts (serial)
export const newTable = pgTable('new_table', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  // ... other fields
});

// 2. Add to supabase-schema.ts (uuid)
export const newTable = pgTable('new_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  // ... other fields
});

// 3. Update supabase-sync.sql
CREATE TABLE IF NOT EXISTS "new_table" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" uuid REFERENCES "auth"."users"("id"),
  -- ... other fields
);
```

## 🧪 Testing

### Local Testing
```bash
# Test with local PostgreSQL
npm run dev
# Uses schema.ts and queries.ts
```

### Production Testing
```bash
# Test with Supabase connection
# Set POSTGRES_URL to Supabase connection string
# Uses supabase-schema.ts and supabase-queries.ts
```

## 📝 Environment Variables

### Local Development
```env
POSTGRES_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### Supabase Production
```env
POSTGRES_URL=postgresql://[user]:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🎯 Best Practices

1. **Always update both schemas** when adding features
2. **Use the appropriate query functions** for your environment
3. **Test RLS policies** thoroughly in Supabase
4. **Keep migrations in sync** between local and Supabase
5. **Use TypeScript types** for both schema variants

## 🚨 Common Issues

### ID Type Mismatches
```typescript
// ❌ Wrong - mixing ID types
const localId: number = 123;
await addToFavoritesSupabase(localId, 'lesson', 'uuid'); // Error!

// ✅ Correct - consistent types
const supabaseId: string = 'user-uuid';
await addToFavoritesSupabase(supabaseId, 'lesson', 'lesson-uuid');
```

### Schema Drift
- **Problem**: Local and Supabase schemas get out of sync
- **Solution**: Always update both files and run migrations

### RLS Policy Conflicts
- **Problem**: Supabase queries fail due to RLS
- **Solution**: Check policies match your access patterns

## 🔄 Future Improvements

1. **Unified Query Layer** - Abstract ID types automatically
2. **Migration Sync Tool** - Automatically sync schema changes
3. **Type Generation** - Generate types from both schemas
4. **Testing Suite** - Automated tests for both environments

---

This dual-schema approach allows you to develop locally with familiar serial IDs while deploying to Supabase with proper UUID-based architecture and built-in authentication. 