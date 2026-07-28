import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './StatusDropdown.css';

export interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly DropdownOption[];
  className?: string;
  ariaLabel?: string;
}

const StatusDropdown = ({
  value,
  onChange,
  options,
  className = '',
  ariaLabel,
}: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(() =>
    Math.max(0, options.findIndex(option => option.value === value))
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(Math.max(0, options.findIndex(option => option.value === value)));
        return;
      }
      setFocusedIndex(index => (index + direction + options.length) % options.length);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && isOpen) {
      event.preventDefault();
      const option = options[focusedIndex];
      if (option) selectOption(option.value);
    }
  };

  return (
    <div className={`status-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="status-dropdown-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
        onKeyDown={handleKeyDown}
      >
        <span className="status-dropdown-selection">
          {selectedOption?.color && (
            <span className="status-dropdown-dot" style={{ backgroundColor: selectedOption.color }} />
          )}
          <span className="status-dropdown-label">{selectedOption?.label}</span>
        </span>
        <ChevronDown size={16} className={`status-dropdown-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="status-dropdown-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={`status-dropdown-option ${selected ? 'selected' : ''} ${focusedIndex === index ? 'focused' : ''}`}
                onMouseEnter={() => setFocusedIndex(index)}
                onClick={() => selectOption(option.value)}
              >
                <span className="status-dropdown-option-label">
                  {option.color && (
                    <span className="status-dropdown-dot" style={{ backgroundColor: option.color }} />
                  )}
                  {option.label}
                </span>
                {selected && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
