/**
 * Pagination utilities for handling large datasets
 */

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationState;
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginationState {
  const totalPages = Math.ceil(totalItems / pageSize);
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  return {
    currentPage: validPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

/**
 * Paginate an array of items
 */
export function paginateArray<T>(
  items: T[],
  currentPage: number,
  pageSize: number
): PaginatedResult<T> {
  const pagination = calculatePagination(items.length, currentPage, pageSize);
  const startIndex = (pagination.currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    pagination,
  };
}

/**
 * Paginate with filters
 */
export function paginateFiltered<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  currentPage: number,
  pageSize: number
): PaginatedResult<T> {
  const filtered = items.filter(filterFn);
  return paginateArray(filtered, currentPage, pageSize);
}

/**
 * Paginate with sorting
 */
export function paginateSorted<T>(
  items: T[],
  sortFn: (a: T, b: T) => number,
  currentPage: number,
  pageSize: number
): PaginatedResult<T> {
  const sorted = [...items].sort(sortFn);
  return paginateArray(sorted, currentPage, pageSize);
}

/**
 * Get page range for pagination display
 * E.g., if on page 5 of 10, returns [3, 4, 5, 6, 7]
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  displayPages: number = 5
): number[] {
  const half = Math.floor(displayPages / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    end += 1 - start;
    start = 1;
  }
  if (end > totalPages) {
    start -= end - totalPages;
    end = totalPages;
  }

  start = Math.max(start, 1);
  end = Math.min(end, totalPages);

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}

/**
 * Check if pagination has previous page
 */
export function hasPreviousPage(currentPage: number): boolean {
  return currentPage > 1;
}

/**
 * Check if pagination has next page
 */
export function hasNextPage(currentPage: number, totalPages: number): boolean {
  return currentPage < totalPages;
}

/**
 * Format pagination info text
 * E.g., "Showing 1-10 of 150"
 */
export function formatPaginationInfo(
  currentPage: number,
  pageSize: number,
  totalItems: number
): string {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return `Showing ${startItem}-${endItem} of ${totalItems}`;
}

/**
 * React hook for pagination state
 * Usage:
 * const { currentPage, pageSize, setPage, setPageSize, pagination } = usePagination(items);
 */
export function usePaginationState<T>(
  items: T[],
  initialPageSize: number = 10
): {
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  paginatedItems: T[];
  pagination: PaginationState;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
} {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const result = paginateArray(items, currentPage, pageSize);
  const totalPages = result.pagination.totalPages;

  return {
    currentPage,
    pageSize,
    setPage: (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
    setPageSize,
    paginatedItems: result.items,
    pagination: result.pagination,
    goToFirstPage: () => setCurrentPage(1),
    goToLastPage: () => setCurrentPage(totalPages),
    goToNextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  };
}

// Import statement at top of file for React hook
import * as React from 'react';
