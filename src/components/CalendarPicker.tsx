import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth() || 7); // 0-indexed, 7 = August

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 15 }, (_, i) => 2024 + i);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const selectedDateObj = value ? new Date(value) : null;
  const isSelected = (day: number) => {
    if (!selectedDateObj) return false;
    return (
      selectedDateObj.getFullYear() === viewYear &&
      selectedDateObj.getMonth() === viewMonth &&
      selectedDateObj.getDate() === day
    );
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative space-y-1">
      {label && <label className="font-bold text-slate-300 uppercase text-xs block">{label}</label>}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono flex items-center justify-between cursor-pointer hover:border-amber-500 transition"
      >
        <span>{value || 'Select Date'}</span>
        <CalendarIcon className="h-4 w-4 text-amber-400 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-[100] w-72 bg-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-4 text-slate-200 font-sans">
          {/* Header Controls */}
          <div className="flex items-center justify-between text-xs font-bold">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-2">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2 py-1 text-xs focus:outline-none font-mono"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-slate-400 uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono">
            {paddingArray.map((_, i) => (
              <div key={`pad-${i}`} className="h-7 w-7" />
            ))}

            {daysArray.map((day) => {
              const selected = isSelected(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                    selected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-gold-glow'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
