import React from 'react';

interface CheckboxProps {
  id?: string;
  name?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/**
 * Standard checkbox component with consistent styling
 */
const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-5 h-5 text-brand-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-500/10 dark:bg-gray-900 dark:border-gray-600 dark:focus:ring-brand-400/10 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 checked:scale-105 shadow-sm hover:shadow-md"
      />
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
