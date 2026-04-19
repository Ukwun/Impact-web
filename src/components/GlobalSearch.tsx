'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  Trash2,
  BookOpen,
  Calendar,
  Users,
  BarChart3,
  User,
  Lightbulb,
  Zap,
} from 'lucide-react';
import {
  useDebouncedSearch,
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  initializeSearchIndex,
  type SearchResult,
} from '@/lib/searchUtils';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const { query, setQuery, isSearching, results } = useDebouncedSearch('');
  const [history, setHistory] = useState<typeof getSearchHistory extends () => infer R ? R : []>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Initialize search index on mount
  useEffect(() => {
    initializeSearchIndex();
  }, []);

  // Load search history
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const displayResults = query.trim() ? results : history;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, displayResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (displayResults[selectedIndex]) {
            handleSelectResult(displayResults[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, history, selectedIndex, query]);

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : triggerOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const triggerOpen = useCallback(() => {
    // This would be called by the trigger button
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    saveSearchHistory(query || result.title, 1);
    router.push(result.url);
    onClose();
    setQuery('');
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const displayResults = query.trim() ? results : history;
  const isHistoryView = !query.trim();

  const getIcon = (iconName?: string, category?: string) => {
    const iconProps = { className: 'w-4 h-4' };

    switch (iconName) {
      case 'BookOpen':
        return <BookOpen {...iconProps} />;
      case 'Calendar':
        return <Calendar {...iconProps} />;
      case 'Lightbulb':
        return <Lightbulb {...iconProps} />;
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'BarChart3':
        return <BarChart3 {...iconProps} />;
      case 'User':
        return <User {...iconProps} />;
      default:
        switch (category) {
          case 'courses':
            return <BookOpen {...iconProps} />;
          case 'events':
            return <Calendar {...iconProps} />;
          case 'users':
            return <User {...iconProps} />;
          default:
            return <Search {...iconProps} />;
        }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Dialog */}
      <div className="fixed left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2">
        <div className="mx-4 overflow-hidden rounded-lg bg-dark-800 shadow-2xl border border-dark-600">
          {/* Search Input */}
          <div className="relative flex items-center border-b border-dark-600 px-4 py-3">
            <Search className="w-5 h-5 text-gray-400 absolute left-4" />
            <input
              autoFocus
              type="text"
              placeholder="Search courses, events, people... (Ctrl+K)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full bg-transparent pl-10 pr-4 py-2 text-white placeholder-gray-500 outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching && query ? (
              <div className="p-4 text-center text-gray-400">
                <div className="inline-block animate-spin">
                  <Search className="w-4 h-4" />
                </div>
                <p className="mt-2 text-sm">Searching...</p>
              </div>
            ) : displayResults.length > 0 ? (
              <div className="divide-y divide-dark-600">
                {isHistoryView && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-dark-700">
                    Recent Searches
                  </div>
                )}

                {displayResults.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const isHistoryResult = 'timestamp' in item;

                  return (
                    <div
                      key={isHistoryResult ? `history-${item.query}` : `${item.category}-${item.id}`}
                      className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-500/20 border-l-2 border-primary-500'
                          : 'hover:bg-dark-700'
                      }`}
                      onClick={() =>
                        isHistoryResult
                          ? setQuery(item.query)
                          : handleSelectResult(item as SearchResult)
                      }
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="mt-1 text-gray-400">
                        {isHistoryResult ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          getIcon(
                            (item as SearchResult).icon,
                            (item as SearchResult).category
                          )
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {isHistoryResult ? (item as any).query : (item as SearchResult).title}
                        </p>
                        {!isHistoryResult && (item as SearchResult).description && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {(item as SearchResult).description}
                          </p>
                        )}
                        {(item as SearchResult).metadata && (
                          <div className="flex gap-2 mt-1">
                            {(item as SearchResult).metadata?.level && (
                              <span className="text-xs px-2 py-0.5 bg-dark-600 text-gray-300 rounded">
                                {(item as SearchResult).metadata.level}
                              </span>
                            )}
                            {(item as SearchResult).metadata?.students && (
                              <span className="text-xs text-gray-400">
                                {(item as SearchResult).metadata.students} students
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!isHistoryResult && (
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {(item as SearchResult).category}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : query ? (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                <p className="text-gray-400">No results found for "{query}"</p>
                <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 mb-3">Begin typing to search</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded bg-dark-700 hover:bg-dark-600 transition">
                    <BookOpen className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                    <p className="text-xs text-gray-400">Courses</p>
                  </div>
                  <div className="p-2 rounded bg-dark-700 hover:bg-dark-600 transition">
                    <Calendar className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                    <p className="text-xs text-gray-400">Events</p>
                  </div>
                  <div className="p-2 rounded bg-dark-700 hover:bg-dark-600 transition">
                    <User className="w-5 h-5 mx-auto text-green-400 mb-1" />
                    <p className="text-xs text-gray-400">People</p>
                  </div>
                  <div className="p-2 rounded bg-dark-700 hover:bg-dark-600 transition">
                    <BarChart3 className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                    <p className="text-xs text-gray-400">Data</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-dark-600 bg-dark-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex gap-4">
              <div>
                <span className="font-semibold">↑↓</span> Navigate
              </div>
              <div>
                <span className="font-semibold">↵</span> Select
              </div>
              <div>
                <span className="font-semibold">ESC</span> Close
              </div>
            </div>

            {isHistoryView && history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-gray-400 hover:text-gray-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Command Palette Trigger Button
 * Place this in your navbar/header
 */
interface SearchTriggerProps {
  onClick: () => void;
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-600 border border-dark-500 text-gray-400 text-sm hover:bg-dark-500 transition"
    >
      <Search className="w-4 h-4" />
      <span>Search...</span>
      <kbd className="ml-auto text-xs px-2 py-1 rounded bg-dark-700">⌘K</kbd>
    </button>
  );
}
