import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AccessibleDropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const AccessibleDropdown: React.FC<AccessibleDropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  label,
  error,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      focusedElement?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(-1);
      setSearchTerm('');
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    setSearchTerm('');
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          const option = filteredOptions[focusedIndex];
          if (option && !option.disabled) {
            handleSelect(option.value);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm('');
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        }
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(0);
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(filteredOptions.length - 1);
        }
        break;
      default:
        // Type-ahead search
        if (e.key.length === 1 && isOpen) {
          setSearchTerm(prev => prev + e.key);
          
          // Clear search term after 1 second
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          searchTimeoutRef.current = setTimeout(() => {
            setSearchTerm('');
          }, 1000);

          // Find first matching option
          const matchIndex = filteredOptions.findIndex(option =>
            option.label.toLowerCase().startsWith((searchTerm + e.key).toLowerCase())
          );
          if (matchIndex >= 0) {
            setFocusedIndex(matchIndex);
          }
        }
        break;
    }
  };

  const dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${dropdownId}-error` : undefined;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      <label
        htmlFor={dropdownId}
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      {/* Button */}
      <button
        ref={buttonRef}
        id={dropdownId}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-3 text-left bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold transition-colors ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-600 focus:border-gold hover:border-gray-500'
        } ${isOpen ? 'ring-2 ring-gold' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-describedby={errorId}
        aria-invalid={!!error}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-labelledby={dropdownId}
        >
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-2 text-gray-400">No options found</li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={`px-4 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                  option.disabled
                    ? 'text-gray-500 cursor-not-allowed'
                    : focusedIndex === index
                    ? 'bg-gold text-black'
                    : option.value === value
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => !option.disabled && handleSelect(option.value)}
                onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4" aria-hidden="true" />
                )}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Error message */}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {/* Screen reader instructions */}
      <div className="sr-only">
        Use arrow keys to navigate options, Enter or Space to select, Escape to close.
        Type to search options.
      </div>
    </div>
  );
};

export default AccessibleDropdown;