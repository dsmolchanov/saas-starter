# Auto-Translation Setup Guide

## Overview
The yoga app now includes an automatic translation system that detects the source language of content and translates it to the other supported languages (English, Russian, Spanish).

## Setting up the Translation System

### 1. Environment Variables

You need to set the Gemini API key in your Supabase project:

```bash
# Set the API key for the edge function
# Option 1: Via CLI (requires admin access)
npx supabase secrets set GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Option 2: Via Supabase Dashboard
# 1. Go to https://supabase.com/dashboard/project/omjpulmrztamqyfcntlq/settings/vault
# 2. Click "New secret"
# 3. Name: GOOGLE_GEMINI_API_KEY
# 4. Value: your_gemini_api_key
# 5. Click "Save"
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### 2. Database Setup

Run the migration scripts in order:

```bash
# 1. Create the i18n system
psql -h your_host -U postgres -d postgres -f migrations/create-i18n-system.sql

# 2. Migrate existing translations
psql -h your_host -U postgres -d postgres -f migrations/migrate-existing-translations.sql

# 3. Set up translation queue
psql -h your_host -U postgres -d postgres -f migrations/create-translation-queue.sql
```

### 3. Edge Function Deployment

The edge function has already been deployed. To redeploy with updates:

```bash
npx supabase functions deploy auto-translate --no-verify-jwt
```

## Usage

### Automatic Translation on Content Creation

When new content is created, the system will:
1. Detect the source language based on which locale has content
2. Automatically translate to the other two supported languages
3. Mark translations as auto-generated with confidence scores

### Manual Translation Trigger

```typescript
import { triggerAutoTranslation } from '@/lib/translation/auto-translate';

// Translate a specific entity
const result = await triggerAutoTranslation('chakra', chakraId);

// Translate with specific target languages
const result = await triggerAutoTranslation('moon_phase', moonPhaseId, {
  targetLocales: ['es', 'ru']
});
```

### Processing Translation Queue

```typescript
import { processTranslationQueue } from '@/lib/translation/auto-translate';

// Process up to 10 queued translations
const { processed, failed } = await processTranslationQueue();
```

### Finding Content Needing Translation

```typescript
import { getEntitiesNeedingTranslation } from '@/lib/translation/auto-translate';

// Get entities that are missing translations
const entities = await getEntitiesNeedingTranslation(10);
```

## Translation Quality

The system uses Google's Gemini Pro model with yoga-specific context to ensure:
- Accurate spiritual and philosophical terminology
- Proper Sanskrit term handling
- Consistent technical instruction translation
- Natural-sounding translations in each language

Each translation includes a confidence score (0-1) indicating the model's confidence in the translation quality.

## Monitoring

View translation queue status:

```sql
SELECT * FROM v_translation_queue_status;
```

Check translation statistics:

```sql
SELECT * FROM get_translation_stats();
```

Find missing translations:

```sql
SELECT * FROM find_missing_translations('ru');
```

## Best Practices

1. **Content Creation**: Always create content in one complete language first, then let the system auto-translate
2. **Review**: Auto-translated content should be reviewed by native speakers when possible
3. **Confidence Threshold**: Translations with confidence < 0.7 should be manually reviewed
4. **Batch Processing**: Use the queue system for bulk translations to avoid rate limits

## Troubleshooting

### Edge Function Errors
Check the function logs:
```bash
npx supabase functions logs auto-translate
```

### Translation Not Triggering
1. Verify the Gemini API key is set correctly
2. Check if the entity has source content in at least one language
3. Look for errors in the translation queue table

### Rate Limiting
The system processes translations in batches of 5 fields at a time to avoid API rate limits. If you encounter rate limit errors, reduce the batch size in the edge function.