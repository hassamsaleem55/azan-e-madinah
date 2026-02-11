import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  onClose?: () => void;
}

const variantStyles = {
  info: {
    container: 'bg-blue-light-50 border-blue-light-200 dark:bg-blue-light-900/10 dark:border-blue-light-800',
    icon: 'text-blue-light-600 dark:text-blue-light-400',
    title: 'text-blue-light-900 dark:text-blue-light-300',
    content: 'text-blue-light-700 dark:text-blue-light-400',
  },
  success: {
    container: 'bg-success-50 border-success-200 dark:bg-success-900/10 dark:border-success-800',
    icon: 'text-success-600 dark:text-success-400',
    title: 'text-success-900 dark:text-success-300',
    content: 'text-success-700 dark:text-success-400',
  },
  warning: {
    container: 'bg-warning-50 border-warning-200 dark:bg-warning-900/10 dark:border-warning-800',
    icon: 'text-warning-600 dark:text-warning-400',
    title: 'text-warning-900 dark:text-warning-300',
    content: 'text-warning-700 dark:text-warning-400',
  },
  error: {
    container: 'bg-error-50 border-error-200 dark:bg-error-900/10 dark:border-error-800',
    icon: 'text-error-600 dark:text-error-400',
    title: 'text-error-900 dark:text-error-300',
    content: 'text-error-700 dark:text-error-400',
  },
};

const defaultIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

/**
 * Standard alert component for displaying messages
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
  icon,
  onClose,
}) => {
  const styles = variantStyles[variant];
  const Icon = icon || defaultIcons[variant];

  return (
    <div
      className={`flex gap-3 p-4 border rounded-lg ${styles.container} ${className}`}
      role="alert"
    >
      {Icon && (
        <div className={`shrink-0 ${styles.icon}`}>
          {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon}
        </div>
      )}
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold mb-1 ${styles.title}`}>{title}</h4>
        )}
        <div className={`text-sm ${styles.content}`}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
