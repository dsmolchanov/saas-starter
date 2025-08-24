# 🌍 Internationalization (i18n) Implementation Guide

## Overview
This application supports three languages with Russian as the default:
- **Russian (ru)** - Default language
- **Spanish (es)** 
- **English (en)**

## Architecture

### 1. URL Structure
```
/ru/... - Russian (default, can be omitted)
/es/... - Spanish
/en/... - English
```

### 2. Translation Strategy

#### Static UI Text
- Stored in `/messages/{locale}.json` files
- Managed via `next-intl` library
- Categories: common, navigation, teacher, content, errors, success

#### Dynamic Content (Database)
**Hybrid Approach:**
1. **Source Content**: Stored in main tables with `source_language` field
2. **Translations**: Stored in `translations` table with references
3. **API Response**: Includes requested language or fallback to source

### 3. Database Schema

```sql
translations table:
- entity_type (content_item, asana, course, etc.)
- entity_id (UUID reference)
- language (ru/es/en)
- field_name (title, description, etc.)
- translated_text
```

### 4. Content Creation Flow

1. **Teacher creates content** in their preferred language
2. **Source language** is stored with the content
3. **Translations** can be added later via:
   - Manual translation forms
   - Auto-translation API (future)
   - Professional translation service (future)

## Implementation Steps

### Phase 1: Core Setup ✅
- [x] Install next-intl
- [x] Create i18n configuration
- [x] Set up translation files
- [x] Create database migration

### Phase 2: UI Components (Current)
- [ ] Language switcher component
- [ ] Locale detection middleware
- [ ] Update navigation components
- [ ] Add translation hooks

### Phase 3: Content Management
- [ ] Translation forms for teachers
- [ ] Language selector in content creation
- [ ] Translation status indicators
- [ ] Bulk translation tools

### Phase 4: User Experience
- [ ] User language preference
- [ ] Browser language detection
- [ ] Language-specific URLs
- [ ] SEO meta tags per language

## Component Usage

### Using Translations in Components

```tsx
// Client Component
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('save')}</button>;
}

// Server Component
import { getTranslations } from 'next-intl/server';

export async function ServerComponent() {
  const t = await getTranslations('common');
  return <h1>{t('appName')}</h1>;
}
```

### Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/ui/language-switcher';

// Place in header/navigation
<LanguageSwitcher />
```

## API Endpoints

### Getting Translated Content

```typescript
// Request with language header
GET /api/content/asanas
Headers: { 'Accept-Language': 'es' }

// Response includes translations
{
  "asanas": [{
    "id": "...",
    "title": "Postura de la Montaña", // Translated
    "title_source": "Тадасана", // Original
    "source_language": "ru"
  }]
}
```

### Adding Translations

```typescript
POST /api/translations
{
  "entity_type": "asana",
  "entity_id": "uuid",
  "language": "es",
  "translations": {
    "title": "Postura de la Montaña",
    "description": "..."
  }
}
```

## Content Language Strategy

### Teacher Content
1. Teachers create in their preferred language
2. Platform suggests translation for wider reach
3. Auto-translate option for basic translation
4. Professional translation marketplace (future)

### System Content
1. All UI text in 3 languages
2. Email templates per language
3. Error messages localized
4. Success messages localized

### User-Generated Content
1. Comments/reviews in user's language
2. Language indicator on content
3. Auto-translate option for readers

## SEO Considerations

### URL Structure
```
/ru/kursy/yoga-dlya-nachinayushchikh
/es/cursos/yoga-para-principiantes
/en/courses/yoga-for-beginners
```

### Meta Tags
```html
<html lang="ru">
<meta property="og:locale" content="ru_RU" />
<link rel="alternate" hreflang="es" href="/es/..." />
<link rel="alternate" hreflang="en" href="/en/..." />
```

## Performance Optimization

1. **Translation Caching**
   - Cache translations in Redis
   - Invalidate on update
   - Preload common translations

2. **Lazy Loading**
   - Load language files on demand
   - Split translations by route
   - Minimize initial bundle

3. **Database Queries**
   - Join translations in single query
   - Use materialized views for common queries
   - Index on (entity_type, entity_id, language)

## Testing Strategy

1. **Unit Tests**
   - Translation key existence
   - Fallback behavior
   - Language detection

2. **E2E Tests**
   - Language switching
   - URL routing
   - Content display

3. **Visual Regression**
   - UI layout in different languages
   - RTL support (future)
   - Text overflow handling

## Future Enhancements

1. **Machine Translation**
   - Google Translate API integration
   - DeepL API for quality
   - Review workflow

2. **Community Translation**
   - Crowdsourced translations
   - Translation voting
   - Contributor rewards

3. **Advanced Features**
   - Voice-over translations
   - Subtitle generation
   - RTL language support

## Migration Plan

### Week 1: Foundation
- Set up i18n infrastructure
- Migrate navigation and common UI
- Test language switching

### Week 2: Content
- Add translation tables
- Update content APIs
- Create translation forms

### Week 3: User Experience
- User preferences
- Language detection
- SEO implementation

### Week 4: Polish
- Complete all translations
- Performance optimization
- Testing and QA

## Developer Guidelines

1. **Always use translation keys** - Never hardcode text
2. **Organize keys logically** - Group by feature/page
3. **Provide context** - Add comments for translators
4. **Test all languages** - Check layout and overflow
5. **Handle missing translations** - Graceful fallbacks

## Translation File Structure

```
messages/
├── ru.json (default)
├── es.json
├── en.json
└── components/
    ├── teacher/
    │   ├── ru.json
    │   ├── es.json
    │   └── en.json
    └── student/
        ├── ru.json
        ├── es.json
        └── en.json
```

## Monitoring

- Track language usage analytics
- Monitor translation coverage
- Alert on missing translations
- User language preference trends