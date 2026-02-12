import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`h-12 w-full flex items-center justify-between appearance-none rounded-xl border-2 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-semibold shadow-sm hover:border-brand-300 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:border-brand-700 dark:hover:from-gray-900 dark:hover:to-gray-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:shadow-lg focus:shadow-brand-500/20 dark:text-white/90 transition-all duration-300 ${
          isOpen
            ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg shadow-brand-500/20 dark:border-brand-400'
            : 'border-gray-200 dark:border-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          !value ? 'text-gray-400 dark:text-gray-400' : 'text-gray-900 dark:text-white/90'
        }`}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
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
                        ? 'bg-gradient-to-r from-brand-50 to-brand-100/50 text-brand-700 dark:from-brand-900/30 dark:to-brand-800/20 dark:text-brand-300 shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-brand-100/30 hover:text-brand-600 dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:text-brand-400 hover:translate-x-1 hover:shadow-sm'
                    }`}
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
    </div>
  );
};

export default CustomSelect;
