import { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standard page content wrapper
 * Provides consistent padding and background for page content
 */
export const PageContent: React.FC<PageContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

interface PageContentSectionProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Content section within PageContent
 */
export const PageContentSection: React.FC<PageContentSectionProps> = ({ 
  children, 
  className = '',
  noPadding = false 
}) => {
  return (
    <div className={`${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};

export default PageContent;
