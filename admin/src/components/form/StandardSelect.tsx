import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  className?: string;
}

/**
 * Standard select component with consistent styling
 */
const Select: React.FC<SelectProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  success = false,
  className = '',
}) => {
  const baseClasses = 'w-full h-11 px-4 py-2.5 pr-10 text-sm rounded-lg border appearance-none transition-colors';
  const normalClasses = 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700';
  const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400';
  const disabledClasses = 'disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60';
  const errorClasses = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : '';
  const successClasses = success ? 'border-success-500 focus:border-success-500 focus:ring-success-500/20' : '';

  const selectClasses = `${baseClasses} ${normalClasses} ${!error && !success ? focusClasses : ''} ${disabledClasses} ${errorClasses} ${successClasses} ${className}`;

  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={selectClasses}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
        <ChevronDown className="w-5 h-5" />
      </div>
    </div>
  );
};

export default Select;
