import { ReactNode } from 'react';
import { Link } from 'react-router';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

/**
 * Standard page header component
 * Provides consistent header structure with title, breadcrumbs, and actions
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  breadcrumbs = [{ label: 'Home', path: '/' }],
}) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumbs - Right Aligned */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center justify-end gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">
                  {crumb.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
