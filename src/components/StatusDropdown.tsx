import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './StatusDropdown.css';

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: StatusOption[];
  className?: string;
}

const StatusDropdown = ({ value, onChange, options, className = '' }: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`status-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="status-dropdown-trigger"
        style={{ backgroundColor: selectedOption?.color }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="status-dropdown-label">{selectedOption?.label}</span>
        <ChevronDown 
          size={18} 
          className={`status-dropdown-icon ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="status-dropdown-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`status-dropdown-option ${option.value === value ? 'selected' : ''}`}
              style={{ backgroundColor: option.color }}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {option.value === value && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
