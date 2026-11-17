import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check
} from 'lucide-react';

/**
 * Enterprise Custom Date Picker Component
 * Replaces unstyled native HTML <input type="date"> with a theme-aware, modern SaaS calendar.
 * Supports light & dark modes, keyboard accessibility, month/year navigation, and presets.
 */
export const CustomDatePicker = ({
  value, // String in 'YYYY-MM-DD' format (e.g. '2026-11-20')
  onChange, // Callback with new 'YYYY-MM-DD' string
  minDate,
  maxDate,
  placeholder = 'Select date...',
  className = '',
  buttonClassName = '',
  disabled = false,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial selected date
  const selectedDateObj = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }, [value]);

  // Current view month & year state
  const [viewYear, setViewYear] = useState(() => {
    return selectedDateObj ? selectedDateObj.getFullYear() : new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    return selectedDateObj ? selectedDateObj.getMonth() : new Date().getMonth();
  });

  // Keep view year & month in sync when selected date changes externally
  useEffect(() => {
    if (selectedDateObj) {
      setViewYear(selectedDateObj.getFullYear());
      setViewMonth(selectedDateObj.getMonth());
    }
  }, [selectedDateObj]);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calendar Days calculation
  const calendarDays = useMemo(() => {
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: viewMonth - 1,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true
      });
    }

    // Next month leading days to complete grid (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: viewMonth + 1,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        isCurrentMonth: false
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Handle Day Selection
  const handleSelectDay = (cell) => {
    const y = cell.year;
    const m = (cell.month + 1).toString().padStart(2, '0');
    const d = cell.day.toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    onChange(dateStr);
    setIsOpen(false);
  };

  // Quick Action: Today
  const handleSelectToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    setViewYear(y);
    setViewMonth(now.getMonth());
    onChange(todayStr);
    setIsOpen(false);
  };

  // Format display text
  const displayLabel = useMemo(() => {
    if (!selectedDateObj) return placeholder;
    const d = selectedDateObj.getDate();
    const m = monthNames[selectedDateObj.getMonth()].slice(0, 3);
    const y = selectedDateObj.getFullYear();
    return `${d} ${m} ${y}`;
  }, [selectedDateObj, placeholder]);

  const today = new Date();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 flex items-center justify-between gap-3 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-teal-600 dark:text-[#2DD4BF] shrink-0" />
          <span className={`truncate ${!value ? 'text-slate-400 font-normal' : 'font-mono font-bold'}`}>
            {displayLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-teal-600 dark:text-[#2DD4BF]' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-72 sm:w-80 bg-white dark:bg-[#0A262C] rounded-2xl border border-slate-200 dark:border-[#145663] shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Calendar Header: Month, Year, and Navigation Arrows */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {monthNames[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isSelected =
                selectedDateObj &&
                selectedDateObj.getFullYear() === cell.year &&
                selectedDateObj.getMonth() === cell.month &&
                selectedDateObj.getDate() === cell.day;

              const isCurrentDay =
                today.getFullYear() === cell.year &&
                today.getMonth() === cell.month &&
                today.getDate() === cell.day;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell)}
                  className={`h-8 sm:h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all relative ${
                    isSelected
                      ? 'bg-[#087F8C] text-white font-extrabold shadow-md ring-2 ring-[#14B8A6]/40 scale-105 z-10'
                      : cell.isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-[#087F8C]'
                      : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cell.day}</span>
                  {isCurrentDay && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Footer Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
