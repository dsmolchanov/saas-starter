# i18n Implementation Documentation

## Overview
The Dzen Yoga platform supports multiple languages using a custom internationalization system with React Context and JSON message files.

## Current Status

### ✅ Completed Pages with i18n
- **Courses Page** (`/courses`) - Full translation support
- **Classes Page** (`/classes`) - Full translation support  
- **Teachers Page** (`/teachers`) - Full translation support

### 🔄 Pages Requiring i18n
- Home page (`/home`)
- Browse page (`/browse`)
- Course detail page (`/course/[courseId]`)
- Lesson/Class detail page (`/lesson/[lessonId]`)
- Teacher profile page (`/teacher/[teacherId]`)
- Dashboard pages (`/dashboard/*`)
- My Practice page (`/my_practice`)
- More content page (`/more`)
- Community page (`/community`)
- Pricing page (`/pricing`)

## Architecture

### 1. Translation Provider
**Location:** `/components/providers/simple-intl-provider.tsx`

```typescript
- SimpleIntlProvider: Context provider for translations
- useIntl(): Hook to access locale and messages
- useTranslations(namespace): Hook to get translations for a specific namespace
```

### 2. Message Files
**Location:** `/messages/`
- `en.json` - English translations
- `ru.json` - Russian translations  
- `es.json` - Spanish translations

### 3. Language Switcher
**Location:** `/components/language-switcher.tsx`
- Dropdown component for switching languages
- Saves preference to localStorage
- Updates document language attribute

## Implementation Pattern

### Server Component to Client Component Migration

1. **Create Client Component:**
```tsx
'use client';
import { useTranslations } from '@/components/providers/simple-intl-provider';

export function PageContent({ data }) {
  const t = useTranslations('namespace');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

2. **Update Server Component:**
```tsx
export default async function Page() {
  const data = await fetchData();
  return <PageContent data={data} />;
}
```

3. **Add Translations:**
```json
{
  "namespace": {
    "title": "Page Title",
    "description": "Page description",
    "searchPlaceholder": "Search...",
    "noResults": "No results found"
  }
}
```

## Translation Key Conventions

### Namespaces
- `common` - Shared translations (buttons, labels)
- `navigation` - Navigation menu items
- `auth` - Authentication related
- `[pageName]` - Page-specific translations

### Key Naming
- Use camelCase for keys: `searchPlaceholder`
- Use descriptive names: `noCoursesFound` vs `noResults`
- Group related keys: `teacher.bio`, `teacher.experience`

## Dynamic Content with Parameters

For dynamic content, use template strings:
```json
"noResultsForSearch": "No results for \"{{query}}\". Try a different search term."
```

In component:
```tsx
t('noResultsForSearch').replace('{{query}}', searchQuery)
```

## Best Practices

1. **Always provide fallbacks** - Return the key if translation is missing
2. **Keep translations flat** - Avoid deep nesting beyond 2 levels
3. **Consistent naming** - Use the same key names across languages
4. **Complete all languages** - Add translations to all language files simultaneously
5. **Use namespaces** - Organize translations by feature/page

## Adding a New Language

1. Create new message file: `/messages/[locale].json`
2. Add to messagesMap in `simple-intl-provider.tsx`
3. Update Locale type definition
4. Add language option to LanguageSwitcher component

## Testing i18n

1. **Manual Testing:**
   - Switch languages using the language switcher
   - Verify all text updates correctly
   - Check for missing translations in console

2. **Build Testing:**
   ```bash
   pnpm run build
   ```
   Ensures no TypeScript errors with translation keys

## Common Issues & Solutions

### Issue: Translation key not found
**Solution:** Check that the key exists in all language files and matches the namespace

### Issue: Hydration mismatch
**Solution:** Use mounted state to ensure consistent rendering during SSR

### Issue: Language doesn't persist
**Solution:** Verify localStorage is being set and read correctly

## Future Improvements

1. **Lazy loading** - Load language files on demand
2. **Pluralization** - Support for plural forms
3. **Date/Time formatting** - Locale-specific formatting
4. **RTL support** - For Arabic, Hebrew, etc.
5. **Translation management** - Integration with translation services
6. **Type safety** - Generate TypeScript types from message files