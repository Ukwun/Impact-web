# Global Search Integration Guide

## Overview

The Global Search system provides a command-palette-style search interface that allows users to quickly search across courses, events, and users. It supports keyboard shortcuts (Cmd+K / Ctrl+K), search history, fuzzy matching, and real-time results.

## Components

### 1. GlobalSearch Modal Component
**File:** `src/components/GlobalSearch.tsx`

The main search modal component that displays:
- Search input with autocomplete
- Real-time search results with fuzzy matching
- Search history
- Keyboard navigation (↑↓ to navigate, Enter to select, Esc to close)
- Category badges and metadata

### 2. SearchTrigger Button
Part of the same file as GlobalSearch, this is a visible button for opening search:

```tsx
<SearchTrigger onClick={() => setIsOpen(true)} />
```

### 3. useGlobalSearch Hook
**File:** `src/hooks/useGlobalSearch.ts`

Custom hook for managing search modal state:

```tsx
const { isOpen, open, close, toggle } = useGlobalSearch();
```

## Integration Patterns

### Pattern 1: ClientLayout Integration (Recommended)

Add global search to your main layout component:

```tsx
// src/app/layout.tsx or ClientLayout component
'use client';

import { useState } from 'react';
import { GlobalSearch, SearchTrigger } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, open, close } = useGlobalSearch();

  return (
    <>
      <header>
        <nav className="flex items-center justify-between">
          {/* Logo, nav items... */}
          <SearchTrigger onClick={open} />
        </nav>
      </header>

      <main>{children}</main>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isOpen} onClose={close} />
    </>
  );
}
```

### Pattern 2: Navbar Component Integration

Create a dedicated navbar component:

```tsx
// src/components/Navbar.tsx
'use client';

import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { SearchTrigger } from '@/components/GlobalSearch';
import { Bell, User, Settings } from 'lucide-react';

export function Navbar() {
  const { open } = useGlobalSearch();

  return (
    <nav className="border-b border-dark-600 bg-dark-800">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <h1 className="text-xl font-bold text-white">ImpactEdu</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Trigger */}
          <SearchTrigger onClick={open} />

          {/* Other Icons */}
          <button className="text-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
```

### Pattern 3: Wrapper Component for Easy Access

Create a provider-like wrapper:

```tsx
// src/components/SearchProvider.tsx
'use client';

import { ReactNode } from 'react';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

export function SearchProvider({ children }: { children: ReactNode }) {
  const { isOpen, close } = useGlobalSearch();

  return (
    <>
      {children}
      <GlobalSearch isOpen={isOpen} onClose={close} />
    </>
  );
}
```

Then wrap your app:

```tsx
// app/layout.tsx
import { SearchProvider } from '@/components/SearchProvider';

export default function RootLayout() {
  return (
    <html>
      <body>
        <SearchProvider>
          {/* Your app */}
        </SearchProvider>
      </body>
    </html>
  );
}
```

## Usage

### Basic Usage

```tsx
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { GlobalSearch, SearchTrigger } from '@/components/GlobalSearch';

export function MyComponent() {
  const { isOpen, open, close } = useGlobalSearch();

  return (
    <>
      <button onClick={open}>Open Search</button>
      <GlobalSearch isOpen={isOpen} onClose={close} />
    </>
  );
}
```

### Keyboard Shortcuts

- **Cmd+K / Ctrl+K:** Toggle search modal (automatic)
- **↑/↓:** Navigate results
- **Enter:** Select result
- **Esc:** Close modal

### Search Features

1. **Fuzzy Matching:** Search terms are matched using fuzzy matching algorithm for typo tolerance
2. **Relevance Scoring:** Results are ranked by relevance
3. **Search History:** Recent searches are saved to localStorage
4. **Category Filtering:** Results show category badges (Courses, Events, Users)

## Underlying Dependencies

The Global Search relies on utilities in `src/lib/searchUtils.ts`:

```tsx
// Key exports from searchUtils.ts
import {
  useDebouncedSearch,        // Hook with debounced search
  getSearchHistory,           // Load search history
  saveSearchHistory,          // Save search query
  clearSearchHistory,         // Clear all history
  initializeSearchIndex,      // Initialize search data
  performSearch,             // Execute search with filtering
  getSearchSuggestions,      // Get autocomplete suggestions
  type SearchResult,         // TypeScript interface
} from '@/lib/searchUtils';
```

## Customization

### Styling

The component uses Tailwind CSS with a dark theme:
- `.dark-800`, `.dark-700`, `.dark-600`: Dark background colors
- `.primary-500`: Primary accent color
- Modify color classes in `GlobalSearch.tsx` to match your theme

### Search Behavior

To customize search behavior, edit `src/lib/searchUtils.ts`:

1. **Sample Data:** Modify the course, event, and user arrays in `initializeSearchIndex()`
2. **Fuzzy Matching:** Adjust the `calculateRelevance()` function thresholds
3. **Debounce Delay:** Change from 300ms to your preferred delay in the hook
4. **Cache Duration:** Modify search history duration in `saveSearchHistory()`

### Icons

Icons are from `lucide-react`. To change icons:

```tsx
import { Search, BookOpen, Calendar, Users } from 'lucide-react';

// Customize in GlobalSearch.tsx getIcon() function
```

## Performance Considerations

1. **Debouncing:** Search results are debounced at 300ms to prevent excessive re-renders
2. **Search Index:** Initialized on component mount, cached in memory
3. **Local Storage:** History is stored in browser localStorage (5-10KB typical)
4. **Modal Performance:** Uses fixed positioning with backdrop blur for smooth scrolling

## Testing

See `TESTING_AND_VALIDATION.md` for comprehensive testing scenarios:

1. **Keyboard Shortcuts:** Verify Cmd+K / Ctrl+K toggles modal
2. **Search Functionality:** Test fuzzy matching with typos
3. **Navigation:** Verify arrow key navigation and selection
4. **History:** Confirm search history saves and clears correctly
5. **Performance:** Monitor debounce timing and result rendering
6. **Mobile:** Test touch interactions and responsive design

## Future Enhancements

1. **Real API Integration:** Replace sample data with actual API calls
2. **Advanced Filters:** Add filters for course level, date range, etc.
3. **Saved Searches:** Allow users to save frequent searches
4. **Search Analytics:** Track popular searches for insights
5. **Personalization:** Rank results based on user preferences
6. **Voice Search:** Add voice input capability
7. **Smart Suggestions:** ML-based suggestions based on browsing history

## Troubleshooting

### Search Modal Doesn't Open

- Verify `GlobalSearch` component is in your layout
- Check that `useGlobalSearch` is being used correctly
- Ensure keyboard event listeners aren't being prevented elsewhere

### Keyboard Shortcuts Not Working

- Verify no input elements have `event.preventDefault()` for Cmd+K
- Check browser console for JavaScript errors
- Confirm `is-dark` class is applied to layout for styling

### Search Results Not Showing

- Verify `initializeSearchIndex()` is called on mount
- Check that search data is properly formatted in `searchUtils.ts`
- Test with generic search terms first (e.g., "course", "event")

### Performance Issues

- Increase debounce delay in `useDebouncedSearch()` hook
- Implement pagination if search results are very large
- Consider virtualizing result list for 1000+ results

## API Integration (When Ready)

To integrate with real APIs instead of sample data:

```tsx
// In searchUtils.ts, replace initialization:
export async function initializeSearchIndexFromAPI() {
  const [courses, events, users] = await Promise.all([
    fetch('/api/courses').then(r => r.json()),
    fetch('/api/events').then(r => r.json()),
    fetch('/api/users').then(r => r.json()),
  ]);
  
  // Build index from API data
  globalSearchIndex.addCourses(courses);
  globalSearchIndex.addEvents(events);
  globalSearchIndex.addUsers(users);
}
```

Then call in component:

```tsx
useEffect(() => {
  initializeSearchIndexFromAPI();
}, []);
```

## File Structure

```
src/
├── components/
│   └── GlobalSearch.tsx           # Main search component + SearchTrigger
├── hooks/
│   └── useGlobalSearch.ts         # Search state management hook
└── lib/
    └── searchUtils.ts            # Search utilities and fuzzy matching
```

---

**Created:** Latest session
**Last Updated:** GlobalSearch integration documentation
**Status:** Ready for production integration
