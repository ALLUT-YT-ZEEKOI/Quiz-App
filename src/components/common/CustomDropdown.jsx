import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Standard SaaS Custom Dropdown Component
 * Replaces unstyled native HTML <select> elements with an elegant, responsive popover.
 * Supports light & dark modes, icons, keyboard navigation, and auto-close on blur.
 */
export const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  icon: Icon,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click and Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Normalize options: supports string array or object array with { value, label, icon }
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' || typeof opt === 'number'
      ? { value: opt, label: String(opt) }
      : opt
  );

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full sm:w-auto px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs hover:border-[#20B8C7]/50 focus:outline-none focus:ring-2 focus:ring-[#20B8C7]/20 flex items-center justify-between gap-2.5 transition-all select-none active:scale-[0.98] ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0C4E5B] dark:text-[#20B8C7]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 min-w-[220px] w-full sm:w-max max-w-sm max-h-72 overflow-y-auto bg-white dark:bg-[#0A262C] rounded-2xl border border-slate-200 dark:border-[#14424D] shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
            align === 'left' ? 'left-0' : 'right-0'
          } ${menuClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                  isSelected
                    ? 'bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0C4E5B] dark:text-cyan-200 font-bold border border-[#20B8C7]/30'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0E353E] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <opt.icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#0C4E5B] dark:text-cyan-300 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
