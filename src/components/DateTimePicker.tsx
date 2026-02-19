import { useState, useRef, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, setHours, setMinutes, startOfDay, isBefore, addDays, addMonths, subMonths, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import './DateTimePicker.css';

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
}

const DateTimePicker = ({
  selected,
  onChange,
  placeholder = 'Sélectionner une date et heure',
  isClearable = false,
  minDate = new Date(),
  bookedSlots = [],
  availabilityLoading = false,
  availabilityError = null,
}: DateTimePickerProps) => {
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
    return bookedRanges.some((range) => startMs < range.endMs && endMs > range.startMs);
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
      // Don't auto-close, let user select time
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
    setDisplayMonth(subMonths(displayMonth, 1));
  };

  const handleNextMonth = () => {
    setDisplayMonth(addMonths(displayMonth, 1));
  };

  const formatDisplayValue = () => {
    if (!selected) return placeholder;
    return format(selected, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
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
              aria-label="Clear date"
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
            <div className="modal-header">
              <span className="modal-title">Choisir une date</span>
              <button 
                className="modal-close-button" 
                onClick={() => setIsOpen(false)}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="datetime-content">
              <div className="calendar-section">
                <div className="month-navigation">
                  <button 
                    type="button"
                    className="month-nav-button" 
                    onClick={handlePrevMonth}
                    aria-label="Mois précédent"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="month-year-display">
                    {selectedDate && <span className="selected-day-text">{format(selectedDate, 'd')}</span>}
                    {format(displayMonth, 'MMMM yyyy', { locale: fr })}
                  </h2>
                  <button 
                    type="button"
                    className="month-nav-button" 
                    onClick={handleNextMonth}
                    aria-label="Mois suivant"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDaySelect}
                  disabled={(day) => isBefore(day, minDay) || isDayFullyBooked(day)}
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
                  locale={fr}
                  showOutsideDays={false}
                  className="custom-day-picker"
                />
              </div>

              <div className="time-section">
                <div className="time-header">
                  <Clock size={16} />
                  <span>Heure</span>
                </div>
                {(availabilityLoading || availabilityError) && (
                  <div className={`availability-status ${availabilityError ? 'error' : ''}`}>
                    {availabilityLoading ? 'Chargement des disponibilites...' : availabilityError}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DateTimePicker;
