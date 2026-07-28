import { useState, useRef, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, setHours, setMinutes, startOfDay, startOfMonth, isBefore, addDays, addMonths, subMonths, addMinutes } from 'date-fns';
import { ar, enCA, fr } from 'date-fns/locale';
import { Calendar, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import './DateTimePicker.css';
import { useI18n } from '../i18n/I18nContext';

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  minDate?: Date;
  locale?: string;
  bookedSlots?: Array<{ start: string; end: string }>;
  availabilityLoading?: boolean;
  availabilityError?: string | null;
  showTimeSelect?: boolean;
}

const DateTimePicker = ({
  selected,
  onChange,
  placeholder,
  isClearable = false,
  minDate = new Date(),
  bookedSlots = [],
  availabilityLoading = false,
  availabilityError = null,
  showTimeSelect = true,
}: DateTimePickerProps) => {
  const { locale, messages } = useI18n();
  const dateLocale = locale === 'ar' ? ar : locale === 'en' ? enCA : fr;
  const resolvedPlaceholder = placeholder ?? messages.dateTime.defaultPlaceholder;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selected || undefined);
  const [selectedTime, setSelectedTime] = useState<string>(
    selected ? format(selected, 'HH:mm') : '09:00'
  );
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const minDay = startOfDay(minDate);
  const tomorrow = startOfDay(addDays(new Date(), 1));

  // Generate time slots (8:00 to 17:30, every 30 minutes) - Memoized for performance
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  const bookedRanges = useMemo(() => {
    return bookedSlots
      .map((slot) => ({
        start: new Date(slot.start),
        end: new Date(slot.end)
      }))
      .filter((slot) => !Number.isNaN(slot.start.getTime()) && !Number.isNaN(slot.end.getTime()))
      .map((slot) => ({
        startMs: slot.start.getTime(),
        endMs: slot.end.getTime()
      }));
  }, [bookedSlots]);

  const isSlotBlockedForDay = (day: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotStart = setMinutes(setHours(day, hours), minutes);
    const slotEnd = addMinutes(slotStart, 30);
    const startMs = slotStart.getTime();
    const endMs = slotEnd.getTime();
    
    // Count how many bookings overlap with this slot
    const overlappingCount = bookedRanges.filter((range) => 
      startMs < range.endMs && endMs > range.startMs
    ).length;
    
    // Block only if 6 or more patients are booked in this slot
    return overlappingCount >= 6;
  };

  const isSlotBlocked = (time: string) => {
    if (!selectedDate) return false;
    return isSlotBlockedForDay(selectedDate, time);
  };

  const isDayFullyBooked = (day: Date) => {
    if (availabilityLoading || bookedRanges.length === 0) return false;
    return timeSlots.every((time) => isSlotBlockedForDay(day, time));
  };

  useEffect(() => {
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDaySelect = (day: Date | undefined) => {
    if (day && !isBefore(day, minDay)) {
      setSelectedDate(day);
      // If showTimeSelect is false, immediately confirm and close
      if (!showTimeSelect) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const newDate = setMinutes(setHours(day, hours), minutes);
        onChange(newDate);
        setIsOpen(false);
      }
      // Otherwise, let user select time
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = setMinutes(setHours(selectedDate, hours), minutes);
      onChange(newDate);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
    setSelectedTime('09:00');
    onChange(null);
  };

  const handlePrevMonth = () => {
    const prevMonth = subMonths(displayMonth, 1);
    const currentMonthStart = startOfMonth(new Date());
    // Don't allow navigation to months before the current month
    if (!isBefore(startOfMonth(prevMonth), currentMonthStart)) {
      setDisplayMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    setDisplayMonth(addMonths(displayMonth, 1));
  };

  const isPrevMonthDisabled = () => {
    const prevMonth = subMonths(displayMonth, 1);
    const currentMonthStart = startOfMonth(new Date());
    return isBefore(startOfMonth(prevMonth), currentMonthStart);
  };

  const formatDisplayValue = () => {
    if (!selected) return resolvedPlaceholder;
    if (!showTimeSelect) {
      return format(selected, 'EEEE d MMMM yyyy', { locale: dateLocale });
    }
    return format(selected, 'EEEE d MMMM yyyy HH:mm', { locale: dateLocale });
  };

  return (
    <>
      <div className="datetime-picker">
        <div className="datetime-input" onClick={() => setIsOpen(!isOpen)}>
          <Calendar className="input-icon" size={18} />
          <span className={selected ? 'input-value' : 'input-placeholder'}>
            {formatDisplayValue()}
          </span>
          {isClearable && selected && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label={messages.dateTime.clear}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="datetime-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div 
            className="datetime-modal" 
            onClick={(e) => e.stopPropagation()}
            ref={containerRef}
          >
            <div className="datetime-content">
              <div className="calendar-section">
                <div className="month-navigation">
                  <button 
                    type="button"
                    className="month-nav-button" 
                    onClick={handlePrevMonth}
                    disabled={isPrevMonthDisabled()}
                    aria-label={messages.dateTime.previousMonth}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="month-year-display">
                    {selectedDate && `${format(selectedDate, 'd')} `}
                    {format(displayMonth, 'MMMM yyyy', { locale: dateLocale })}
                  </h2>
                  <button 
                    type="button"
                    className="month-nav-button" 
                    onClick={handleNextMonth}
                    aria-label={messages.dateTime.nextMonth}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDaySelect}
                  disabled={(day) => isBefore(day, tomorrow) || isDayFullyBooked(day)}
                  fromDate={tomorrow}
                  month={displayMonth}
                  onMonthChange={setDisplayMonth}
                  modifiers={{
                    past: { before: tomorrow },
                  }}
                  modifiersClassNames={{
                    selected: 'selected-day',
                    today: 'today-day',
                    disabled: 'disabled-day',
                    past: 'past-day',
                  }}
                  locale={dateLocale}
                  showOutsideDays={false}
                  className="custom-day-picker"
                />
              </div>

              {showTimeSelect && (
                <div className="time-section">
                  <div className="time-header">
                    <Clock size={16} />
                    <span>{messages.dateTime.time}</span>
                  </div>
                  {(availabilityLoading || availabilityError) && (
                    <div className={`availability-status ${availabilityError ? 'error' : ''}`}>
                      {availabilityLoading ? messages.dateTime.loading : availabilityError}
                    </div>
                  )}
                  <div className="time-list">
                    {timeSlots.map((time) => {
                      const blocked = isSlotBlocked(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot ${selectedTime === time ? 'selected' : ''} ${blocked ? 'blocked' : ''}`}
                          onClick={() => {
                            if (!blocked) {
                              handleTimeSelect(time);
                            }
                          }}
                          disabled={!selectedDate || availabilityLoading || blocked}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DateTimePicker;
