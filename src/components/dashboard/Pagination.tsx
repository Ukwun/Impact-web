import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPaginationRange(currentPage, totalPages);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Page Size Selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm bg-dark-600 border border-dark-500 rounded text-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}

      {/* Pagination Info */}
      {totalItems && (
        <div className="text-sm text-gray-400">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}

      {/* Page Numbers */}
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Page Numbers */}
        {pages[0] > 1 && (
          <>
            <PageButton
              page={1}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
            {pages[0] > 2 && <span className="text-gray-400">...</span>}
          </>
        )}

        {pages.map((page) => (
          <PageButton
            key={page}
            page={page}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="text-gray-400">...</span>
            )}
            <PageButton
              page={totalPages}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          </>
        )}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface PageButtonProps {
  page: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

function PageButton({ page, currentPage, onPageChange }: PageButtonProps) {
  const isActive = page === currentPage;

  return (
    <Button
      variant={isActive ? "primary" : "outline"}
      size="sm"
      onClick={() => onPageChange(page)}
      className={isActive ? "min-w-[40px]" : ""}
    >
      {page}
    </Button>
  );
}

/**
 * Get page range for pagination display
 * Shows current page ± 2 pages
 */
function getPaginationRange(currentPage: number, totalPages: number): number[] {
  const displayPages = 5;
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
