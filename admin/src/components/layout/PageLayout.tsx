import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standard page layout wrapper
 * Provides consistent spacing and structure for all pages
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  );
};

export default PageLayout;
