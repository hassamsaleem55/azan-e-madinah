import { ReactNode } from 'react';

interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * Form group container for consistent spacing between form fields
 */
export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Form section with optional title and description
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      {(title || description) && (
        <div className="space-y-1.5 mb-4">
          {title && (
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
      <FormGroup>{children}</FormGroup>
    </div>
  );
};

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Form field wrapper with label, error, and hint support
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-error-500 dark:text-error-400 mt-1.5">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{hint}</p>
      )}
    </div>
  );
};

interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Form actions container for submit/cancel buttons
 */
export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className = '',
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={`flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 ${alignClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
};

export default FormGroup;
