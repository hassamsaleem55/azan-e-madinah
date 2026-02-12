import React from 'react';

interface TextareaProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  className?: string;
}

/**
 * Standard textarea component with consistent styling
 */
const Textarea: React.FC<TextareaProps> = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  rows = 4,
  disabled = false,
  error = false,
  success = false,
  className = '',
}) => {
  const baseClasses = 'w-full px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-300 resize-y shadow-sm';
  const normalClasses = 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700';
  const focusClasses = 'focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:focus:border-brand-400 focus:shadow-lg';
  const hoverClasses = 'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md';
  const disabledClasses = 'disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-gray-200 dark:disabled:border-gray-700';
  const placeholderClasses = 'placeholder:text-gray-400 dark:placeholder:text-gray-500';
  const errorClasses = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/10 hover:border-error-600' : '';
  const successClasses = success ? 'border-success-500 focus:border-success-500 focus:ring-success-500/10 hover:border-success-600' : '';

  const textareaClasses = `${baseClasses} ${normalClasses} ${!error && !success ? focusClasses : ''} ${!error && !success ? hoverClasses : ''} ${disabledClasses} ${placeholderClasses} ${errorClasses} ${successClasses} ${className}`;

  return (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      rows={rows}
      disabled={disabled}
      className={textareaClasses}
    />
  );
};

export default Textarea;
