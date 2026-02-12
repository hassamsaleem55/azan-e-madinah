import { ReactNode, useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

/**
 * Standard filter bar component
 * Provides consistent filter, search, and action button layout
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  showFilters = false,
  onToggleFilters,
}) => {
  return (
    <div className="space-y-4">
      {/* Search and Actions Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {onSearchChange && (
          <div className="flex-1 min-w-60 max-w-md relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Filter Toggle */}
        {filters && onToggleFilters && (
          <Button
            variant="outline"
            onClick={onToggleFilters}
            startIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            Filters
          </Button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {actions}
        </div>
      </div>

      {/* Collapsible Filters */}
      {filters && showFilters && (
        <div className="p-6 bg-linear-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/30 border-2 border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 backdrop-blur-sm animate-slideIn">
          {filters}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
