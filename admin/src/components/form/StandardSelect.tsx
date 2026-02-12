import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

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
  menuPortalTarget?: HTMLElement;
}

/**
 * Standard select component with custom dropdown panel and consistent styling
 */
const Select: React.FC<SelectProps> = ({
  id,
  name,
  value = '',
  onChange,
  onBlur,
  options,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  success = false,
  className = '',
  menuPortalTarget,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenSelectRef = useRef<HTMLSelectElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Update dropdown position
  const updatePosition = useCallback(() => {
    if (containerRef.current && menuPortalTarget) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [menuPortalTarget]);

  // Update dropdown position when opened or on scroll/resize
  useEffect(() => {
    if (isOpen && menuPortalTarget) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, menuPortalTarget, updatePosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInContainer = containerRef.current?.contains(target);
      const isClickInDropdown = dropdownRef.current?.contains(target);
      
      if (!isClickInContainer && !isClickInDropdown) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    // Trigger the onChange event with synthetic event for backwards compatibility
    if (onChange && hiddenSelectRef.current) {
      hiddenSelectRef.current.value = optionValue;
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', { writable: false, value: hiddenSelectRef.current });
      onChange(event as any);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const baseClasses = 'h-12 w-full flex items-center justify-between appearance-none rounded-xl border-2 px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-300';
  const normalClasses = 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white';
  const hoverClasses = 'hover:border-brand-300 hover:shadow-md hover:bg-linear-to-br hover:from-white hover:to-gray-50 dark:hover:border-brand-700 dark:hover:from-gray-900 dark:hover:to-gray-800';
  const focusClasses = 'focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:shadow-lg focus:shadow-brand-500/20 dark:focus:border-brand-400';
  const disabledClasses = 'disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60';
  const errorClasses = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20 focus:shadow-error-500/20' : '';
  const successClasses = success ? 'border-success-500 focus:border-success-500 focus:ring-success-500/20 focus:shadow-success-500/20' : '';

  const buttonClasses = `${baseClasses} ${normalClasses} ${!error && !success && !disabled ? hoverClasses : ''} ${disabledClasses} ${errorClasses} ${successClasses} ${
    isOpen && !error && !success
      ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg shadow-brand-500/20 dark:border-brand-400'
      : !error && !success
      ? 'border-gray-200 dark:border-gray-700'
      : ''
  } ${disabled ? '' : 'cursor-pointer'} ${
    !value ? 'text-gray-400 dark:text-gray-400' : ''
  } ${className}`;

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden native select for form compatibility */}
      <select
        ref={hiddenSelectRef}
        id={id}
        name={name}
        value={value}
        onBlur={onBlur}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom Select Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={buttonClasses}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 ml-2 transition-all duration-300 ${
            error ? 'text-error-500' : success ? 'text-success-500' : 'text-brand-500 dark:text-brand-400'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && !menuPortalTarget && (
        <div className="absolute z-[1000] w-full mt-2 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl border-2 border-brand-200/50 dark:border-brand-700/50 shadow-2xl shadow-brand-500/20 dark:shadow-brand-500/10 animate-scaleIn origin-top overflow-hidden">
          {/* Search Input */}
          {options.length > 5 && (
            <div className="p-3 border-b-2 border-gray-100 dark:border-gray-800">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-linear-to-r from-brand-50 to-brand-100/50 text-brand-700 dark:from-brand-900/30 dark:to-brand-800/20 dark:text-brand-300 shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-linear-to-r hover:from-brand-50/50 hover:to-brand-100/30 hover:text-brand-600 dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:text-brand-400 hover:translate-x-1 hover:shadow-sm'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 flex-shrink-0 ml-2 text-brand-600 dark:text-brand-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Portal Dropdown Panel */}
      {isOpen && menuPortalTarget && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl border-2 border-brand-200/50 dark:border-brand-700/50 shadow-2xl shadow-brand-500/20 dark:shadow-brand-500/10 animate-scaleIn origin-top overflow-hidden"
          style={{
            top: `${dropdownPosition.top + 8}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            minHeight: '50px',
          }}
        >
          {/* Search Input */}
          {options.length > 5 && (
            <div className="p-3 border-b-2 border-gray-100 dark:border-gray-800">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-linear-to-r from-brand-50 to-brand-100/50 text-brand-700 dark:from-brand-900/30 dark:to-brand-800/20 dark:text-brand-300 shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-linear-to-r hover:from-brand-50/50 hover:to-brand-100/30 hover:text-brand-600 dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:text-brand-400 hover:translate-x-1 hover:shadow-sm'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 flex-shrink-0 ml-2 text-brand-600 dark:text-brand-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        menuPortalTarget
      )}
    </div>
  );
};

export default Select;
