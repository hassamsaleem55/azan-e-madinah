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
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-brand-600 bg-white border-gray-300 rounded focus:ring-3 focus:ring-brand-500/20 dark:bg-gray-900 dark:border-gray-700 dark:focus:ring-brand-800/20 disabled:cursor-not-allowed"
      />
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
