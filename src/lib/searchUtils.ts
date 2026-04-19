/**
 * Global Search Utilities
 * Provides unified search across courses, events, users
 */

export type SearchCategory = 'courses' | 'events' | 'users' | 'all';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: SearchCategory;
  url: string;
  icon?: string;
  metadata?: Record<string, any>;
  relevanceScore?: number;
}

export interface SearchQuery {
  query: string;
  category?: SearchCategory;
  limit?: number;
}

/**
 * In-memory search index for demo purposes
 * In production, use Elasticsearch, Meilisearch, or similar
 */
class SearchIndex {
  private index: Map<string, SearchResult> = new Map();

  /**
   * Add item to search index
   */
  add(item: SearchResult): void {
    this.index.set(`${item.category}:${item.id}`, item);
  }

  /**
   * Remove item from index
   */
  remove(category: SearchCategory, id: string): void {
    this.index.delete(`${category}:${id}`);
  }

  /**
   * Search index with fuzzy matching
   */
  search(query: SearchQuery): SearchResult[] {
    const { query: searchTerm, category, limit = 10 } = query;
    const lowerQuery = searchTerm.toLowerCase();

    let results = Array.from(this.index.values());

    // Filter by category if specified
    if (category && category !== 'all') {
      results = results.filter((r) => r.category === category);
    }

    // Fuzzy score matching
    results = results
      .map((result) => ({
        ...result,
        relevanceScore: calculateRelevance(lowerQuery, result),
      }))
      .filter((r) => r.relevanceScore && r.relevanceScore > 0)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, limit);

    return results;
  }

  /**
   * Get all items
   */
  getAll(): SearchResult[] {
    return Array.from(this.index.values());
  }

  /**
   * Clear index
   */
  clear(): void {
    this.index.clear();
  }
}

/**
 * Calculate relevance score for search result
 * Higher score = better match
 */
function calculateRelevance(query: string, result: SearchResult): number {
  const titleLower = result.title.toLowerCase();
  const descLower = result.description?.toLowerCase() || '';

  let score = 0;

  // Exact match in title
  if (titleLower === query) score += 100;

  // Title starts with query
  if (titleLower.startsWith(query)) score += 50;

  // Title contains query
  if (titleLower.includes(query)) score += 25;

  // Description contains query
  if (descLower.includes(query)) score += 10;

  // Partial word match
  const queryWords = query.split(' ');
  const titleWords = titleLower.split(' ');
  const matches = queryWords.filter((w) => titleWords.some((tw) => tw.includes(w)));
  score += matches.length * 5;

  return score;
}

// Global search index instance
export const globalSearchIndex = new SearchIndex();

/**
 * Initialize search index with default data
 */
export function initializeSearchIndex(): void {
  // Add sample courses
  const courses: SearchResult[] = [
    {
      id: 'fin-101',
      title: 'Financial Literacy 101',
      description: 'Learn the fundamentals of personal finance and investing',
      category: 'courses',
      url: '/dashboard/learn?courseId=fin-101',
      icon: 'BookOpen',
      metadata: { level: 'beginner', students: 142 },
    },
    {
      id: 'ent-101',
      title: 'Entrepreneurship Basics',
      description: 'Start your entrepreneurial journey with proven strategies',
      category: 'courses',
      url: '/dashboard/learn?courseId=ent-101',
      icon: 'Lightbulb',
      metadata: { level: 'intermediate', students: 98 },
    },
    {
      id: 'lead-101',
      title: 'Leadership Skills',
      description: 'Develop essential leadership competencies',
      category: 'courses',
      url: '/dashboard/learn?courseId=lead-101',
      icon: 'Users',
      metadata: { level: 'intermediate', students: 87 },
    },
    {
      id: 'data-101',
      title: 'Data Science for Business',
      description: 'Apply data analytics to business problems',
      category: 'courses',
      url: '/dashboard/learn?courseId=data-101',
      icon: 'BarChart3',
      metadata: { level: 'advanced', students: 65 },
    },
  ];

  // Add sample events
  const events: SearchResult[] = [
    {
      id: 'webinar-001',
      title: 'Financial Freedom Workshop',
      description: 'Live webinar on building wealth and financial independence',
      category: 'events',
      url: '/dashboard/events/webinar-001',
      icon: 'Calendar',
      metadata: { date: '2026-04-25', attendees: 245 },
    },
    {
      id: 'summit-001',
      title: 'Annual Impact Summit 2026',
      description: 'Network with leaders and explore latest educational trends',
      category: 'events',
      url: '/dashboard/events/summit-001',
      icon: 'Zap',
      metadata: { date: '2026-05-10', attendees: 1200 },
    },
    {
      id: 'cohort-001',
      title: 'Entrepreneur Cohort Launch',
      description: '12-week intensive program for aspiring entrepreneurs',
      category: 'events',
      url: '/dashboard/events/cohort-001',
      icon: 'Users',
      metadata: { date: '2026-05-15', spots: 30 },
    },
  ];

  // Add sample users (instructors/facilitators)
  const users: SearchResult[] = [
    {
      id: 'user-001',
      title: 'Sarah Johnson',
      description: 'Lead Instructor - Financial Literacy & Investing',
      category: 'users',
      url: '/profile/user-001',
      icon: 'User',
      metadata: { role: 'facilitator', courses: 3 },
    },
    {
      id: 'user-002',
      title: 'Michael Chen',
      description: 'Entrepreneur & Business Developer',
      category: 'users',
      url: '/profile/user-002',
      icon: 'User',
      metadata: { role: 'facilitator', courses: 2 },
    },
    {
      id: 'user-003',
      title: 'Dr. Emily Watson',
      description: 'Lead Instructor - Data Science & Analytics',
      category: 'users',
      url: '/profile/user-003',
      icon: 'User',
      metadata: { role: 'facilitator', courses: 4 },
    },
  ];

  courses.forEach((c) => globalSearchIndex.add(c));
  events.forEach((e) => globalSearchIndex.add(e));
  users.forEach((u) => globalSearchIndex.add(u));
}

/**
 * Perform search query
 */
export function performSearch(query: SearchQuery): SearchResult[] {
  return globalSearchIndex.search(query);
}

/**
 * Get search suggestions (for autocomplete)
 */
export function getSearchSuggestions(query: string, limit: number = 5): string[] {
  const results = performSearch({ query, limit: limit * 3 });
  const suggestions = new Set<string>();

  results.forEach((r) => {
    suggestions.add(r.title);
    if (r.description) {
      const words = r.description.split(' ');
      words.slice(0, 3).forEach((w) => suggestions.add(w));
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Debounce hook for search
 */
import * as React from 'react';

export function useDebouncedSearch(
  initialQuery: string = '',
  delay: number = 300
): {
  query: string;
  setQuery: (q: string) => void;
  isSearching: boolean;
  results: SearchResult[];
} {
  const [query, setQueryState] = React.useState(initialQuery);
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const setQuery = React.useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setIsSearching(true);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (newQuery.trim()) {
        const searchResults = performSearch({
          query: newQuery,
          limit: 20,
        });
        setResults(searchResults);
      } else {
        setResults([]);
      }
      setIsSearching(false);
    }, delay);
  }, [delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { query, setQuery, isSearching, results };
}

/**
 * Search history management
 */
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export function saveSearchHistory(query: string, resultCount: number): void {
  if (!query.trim()) return;

  const history = getSearchHistory();

  // Remove duplicate if exists
  const filtered = history.filter((h) => h.query !== query);

  // Add new search to beginning
  const newHistory: SearchHistoryItem[] = [
    {
      query,
      timestamp: Date.now(),
      resultCount,
    },
    ...filtered,
  ].slice(0, MAX_HISTORY_ITEMS);

  if (typeof window !== 'undefined') {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  }
}

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearSearchHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }
}
