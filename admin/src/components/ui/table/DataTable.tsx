import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../button/Button';

interface Column<T> {
  key: string;
  header: string | ReactNode;
  render?: (item: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}

/**
 * Standard data table component with consistent styling
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  striped = false,
  hover = true,
  compact = false,
}: DataTableProps<T>) {
  const paddingClass = compact ? 'px-3 py-2' : 'px-4 py-3';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        {/* Header */}
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`header-${column.key}-${index}`}
                className={`${paddingClass} text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item, rowIndex)}
                onClick={() => onRowClick?.(item, rowIndex)}
                className={`
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800/30' : ''}
                  ${hover ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                  transition-colors
                `}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`${paddingClass} text-sm text-gray-900 dark:text-gray-100 ${
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {column.render
                      ? column.render(item, rowIndex)
                      : String((item as any)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Standard pagination component
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 ${className}`}
    >
      {/* Results info */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          startIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-colors ${
                  currentPage === pageNum
                    ? 'bg-brand-500 text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          endIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DataTable;
