import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock } from 'react-icons/fa';

const DateTimeDisplay = ({ showDate = false }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [timezoneOffset, setTimezoneOffset] = useState('');

  useEffect(() => {
    // Calculate timezone offset relative to UTC
    const getTimezoneOffset = (date) => {
      const offsetMinutes = date.getTimezoneOffset();
      const offsetHours = Math.abs(offsetMinutes / 60);
      const isAhead = offsetMinutes < 0;
      
      // Format: "Xh ahead" or "Xh behind"
      if (offsetHours === 0) {
        return 'UTC';
      }
      // Handle half-hour offsets (like IST which is 5.5 hours)
      if (offsetMinutes % 60 === 30) {
        return `${Math.floor(offsetHours)}.5h ${isAhead ? 'ahead' : 'behind'}`;
      }
      return `${offsetHours}h ${isAhead ? 'ahead' : 'behind'}`;
    };

    // Initial calculation
    const now = new Date();
    setCurrentDateTime(now);
    setTimezoneOffset(getTimezoneOffset(now));

    // Update every second
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now);
      setTimezoneOffset(getTimezoneOffset(now));
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, []);

  // Format time: HH:MM (24-hour format)
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Get day of month
  const getDayOfMonth = (date) => {
    return date.getDate();
  };

  // Get month name (short)
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Get year
  const getYear = (date) => {
    return date.getFullYear();
  };

  if (showDate) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
          <FaCalendar className="text-zinc-600 dark:text-zinc-300 text-xs" />
        </div>
        <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
          {getDayOfMonth(currentDateTime)} {getMonthName(currentDateTime)} {getYear(currentDateTime)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
        <FaClock className="text-zinc-600 dark:text-zinc-300 text-xs" />
      </div>
      <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
        {formatTime(currentDateTime)} // {timezoneOffset}
      </span>
    </div>
  );
};

export default DateTimeDisplay;

