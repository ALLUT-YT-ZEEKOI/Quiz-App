import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * Enterprise SaaS Custom Dropdown Component
 * Modern, theme-aware replacement for native HTML <select> elements.
 * Features:
 * - Search filter for long option lists (auto-enabled when >= 7 items or searchable prop)
 * - Full width support for form fields
 * - Light and dark mode support with CohesionTech palette
 * - Badges, sub-labels, and custom leading icons
 * - Keyboard accessibility (Escape, Enter, Arrow navigation) & outside click detection
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
  align = 'left',
  fullWidth = false,
  searchable,
  disabled = false,
  size = 'md' // 'sm' | 'md' | 'lg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options: handles string/number arrays or object arrays { value, label, icon, badge, description }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: opt, label: String(opt) };
      }
      return opt;
    });
  }, [options]);

  // Determine if search input should appear (explicitly searchable, or auto if >= 7 options)
  const isSearchEnabled = searchable !== undefined ? searchable : normalizedOptions.length >= 7;

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label?.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        String(opt.value).toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close on outside click and Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input when opened
      if (isSearchEnabled) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    } else {
      setSearchQuery('');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSearchEnabled]);

  // Size styling classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-2',
    md: 'px-3.5 py-2.5 text-xs sm:text-sm rounded-xl gap-2.5',
    lg: 'px-4 py-3 text-sm rounded-2xl gap-3'
  }[size] || 'px-3.5 py-2.5 text-xs sm:text-sm rounded-xl gap-2.5';

  return (
    <div
      ref={dropdownRef}
      className={`relative ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full font-semibold bg-white dark:bg-[#0A262C] border text-slate-800 dark:text-slate-100 shadow-xs flex items-center justify-between select-none active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-[#087F8C] ring-2 ring-[#14B8A6]/20 dark:border-[#14B8A6]'
            : 'border-slate-200 dark:border-[#14424D] hover:border-[#087F8C]/60 dark:hover:border-[#14B8A6]/60'
        } ${sizeClasses} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {Icon && (
            <Icon className="w-4 h-4 text-teal-600 dark:text-[#2DD4BF] shrink-0" />
          )}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-slate-500 shrink-0" />
          )}
          <span
            className={`truncate ${
              !selectedOption ? 'text-slate-400 dark:text-slate-500 font-normal' : ''
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedOption?.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-[#087F8C] dark:text-teal-300">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-[#087F8C] dark:text-[#2DD4BF]' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 ${
            fullWidth ? 'w-full' : 'min-w-[220px] w-full sm:w-max max-w-md'
          } max-h-72 overflow-y-auto bg-white dark:bg-[#071F26] rounded-2xl border border-slate-200 dark:border-[#145663] shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          {/* Search Box if list is long */}
          {isSearchEnabled && (
            <div className="p-1 border-b border-slate-100 dark:border-slate-800/80 mb-1 sticky top-0 bg-white/95 dark:bg-[#071F26]/95 backdrop-blur-xs z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#0A2E35] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#087F8C]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List of Options */}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
              No matching options found
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : isSelected
                      ? 'bg-teal-50 text-[#087F8C] dark:bg-[#0B3B44] dark:text-[#2DD4BF] font-bold border border-teal-200 dark:border-teal-700/50 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-[#0E353E] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {opt.icon && <opt.icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                    <div className="truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && (
                        <p className="text-[10px] font-normal text-slate-400 truncate">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#087F8C] dark:text-[#2DD4BF] shrink-0 stroke-[2.5]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
