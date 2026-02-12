import React from 'react';

interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | 'tel' | 'url' | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

/**
 * Standard input component with consistent styling
 * Used across all forms for uniformity
 */
const Input: React.FC<InputProps> = ({
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  className = '',
  min,
  max,
  step,
  disabled = false,
  readOnly = false,
  required = false,
}) => {
  const baseClasses = 'w-full h-12 px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-300';
  const normalClasses = 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700';
  const focusClasses = 'focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:focus:border-brand-400 focus:shadow-lg';
  const disabledClasses = 'disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-gray-200 dark:disabled:border-gray-700';
  const placeholderClasses = 'placeholder:text-gray-400 dark:placeholder:text-gray-500';
  const hoverClasses = 'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm';

  const inputClasses = `${baseClasses} ${normalClasses} ${focusClasses} ${disabledClasses} ${placeholderClasses} ${hoverClasses} ${className}`;

  return (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      className={inputClasses}
    />
  );
};

export default Input;
