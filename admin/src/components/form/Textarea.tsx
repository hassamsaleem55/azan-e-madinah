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
  const baseClasses = 'w-full px-4 py-2.5 text-sm rounded-lg border transition-colors resize-y';
  const normalClasses = 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700';
  const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400';
  const disabledClasses = 'disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60';
  const placeholderClasses = 'placeholder:text-gray-400 dark:placeholder:text-gray-500';
  const errorClasses = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : '';
  const successClasses = success ? 'border-success-500 focus:border-success-500 focus:ring-success-500/20' : '';

  const textareaClasses = `${baseClasses} ${normalClasses} ${!error && !success ? focusClasses : ''} ${disabledClasses} ${placeholderClasses} ${errorClasses} ${successClasses} ${className}`;

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
