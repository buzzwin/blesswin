/**
 * RRULE (iCalendar RFC 5545) helper functions
 * For parsing and generating recurrence rules
 */

export interface ParsedRRULE {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  byday?: string[]; // e.g., ['MO', 'WE', 'FR'] or ['2FR'] for 2nd Friday
  bymonthday?: number[]; // e.g., [1, 15] for 1st and 15th of month
  until?: string; // YYYYMMDDTHHMMSSZ format
  count?: number;
}

/**
 * Parse an RRULE string into components
 */
export function parseRRULE(rrule: string): ParsedRRULE | null {
  if (!rrule || !rrule.startsWith('FREQ=')) {
    return null;
  }

  const parts = rrule.split(';');
  const parsed: ParsedRRULE = {
    freq: 'DAILY'
  };

  for (const part of parts) {
    const [key, value] = part.split('=');
    
    switch (key) {
      case 'FREQ':
        if (['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(value)) {
          parsed.freq = value as ParsedRRULE['freq'];
        }
        break;
      case 'INTERVAL':
        parsed.interval = parseInt(value, 10) || 1;
        break;
      case 'BYDAY':
        parsed.byday = value.split(',');
        break;
      case 'BYMONTHDAY':
        parsed.bymonthday = value.split(',').map(v => parseInt(v, 10)).filter(n => !isNaN(n));
        break;
      case 'UNTIL':
        parsed.until = value;
        break;
      case 'COUNT':
        parsed.count = parseInt(value, 10);
        break;
    }
  }

  return parsed;
}

/**
 * Generate RRULE string from components
 */
export function generateRRULE(params: {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval?: number;
  byday?: string[];
  bymonthday?: number[];
  until?: string;
  count?: number;
}): string {
  const parts: string[] = [`FREQ=${params.freq}`];
  
  if (params.interval && params.interval > 1) {
    parts.push(`INTERVAL=${params.interval}`);
  }
  
  if (params.byday && params.byday.length > 0) {
    parts.push(`BYDAY=${params.byday.join(',')}`);
  }
  
  if (params.bymonthday && params.bymonthday.length > 0) {
    parts.push(`BYMONTHDAY=${params.bymonthday.join(',')}`);
  }
  
  if (params.until) {
    parts.push(`UNTIL=${params.until}`);
  }
  
  if (params.count) {
    parts.push(`COUNT=${params.count}`);
  }
  
  return parts.join(';');
}

/**
 * Convert day of week number (0-6, Sunday=0) to iCalendar day abbreviation
 */
export function dayOfWeekToICal(day: number): string {
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return days[day] || 'SU';
}

/**
 * Convert iCalendar day abbreviation to day of week number (0-6, Sunday=0)
 */
export function iCalToDayOfWeek(day: string): number {
  const days: Record<string, number> = {
    'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
  };
  return days[day.toUpperCase()] ?? 0;
}

/**
 * Check if a date matches an RRULE
 */
export function isDateMatchingRRULE(rrule: string, date: Date, lastCompletionDate: Date | null = null): boolean {
  const parsed = parseRRULE(rrule);
  if (!parsed) {
    return false;
  }

  // Check if already completed today
  if (lastCompletionDate) {
    const lastCompletionDay = new Date(lastCompletionDate);
    const isCompletedToday = 
      lastCompletionDay.getDate() === date.getDate() &&
      lastCompletionDay.getMonth() === date.getMonth() &&
      lastCompletionDay.getFullYear() === date.getFullYear();
    
    if (isCompletedToday) {
      return false; // Already completed today
    }
  }

  // Check UNTIL date
  if (parsed.until) {
    const untilDate = parseICalDate(parsed.until);
    if (untilDate && date > untilDate) {
      return false; // Past the UNTIL date
    }
  }

  // Check based on frequency
  switch (parsed.freq) {
    case 'DAILY':
      // Check interval
      if (parsed.interval && parsed.interval > 1) {
        // For interval > 1, we'd need to track start date
        // For now, treat as daily if no interval or interval = 1
        return parsed.interval === 1 || !parsed.interval;
      }
      return true;
    
    case 'WEEKLY':
      if (parsed.byday && parsed.byday.length > 0) {
        const todayDayOfWeek = date.getDay();
        // Check if today matches any of the BYDAY values
        for (const day of parsed.byday) {
          // Handle ordinal days like "2FR" (2nd Friday)
          const match = day.match(/^(-?\d+)?([A-Z]{2})$/);
          if (match) {
            const ordinal = match[1] ? parseInt(match[1], 10) : null;
            const dayAbbr = match[2];
            const dayNum = iCalToDayOfWeek(dayAbbr);
            
            if (dayNum === todayDayOfWeek) {
              if (ordinal) {
                // Check if this is the Nth occurrence of this day in the month
                const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
                if (ordinal > 0 && weekOfMonth === ordinal) {
                  return true;
                } else if (ordinal < 0) {
                  // Negative ordinal means last occurrence (e.g., -1FR = last Friday)
                  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  const lastOccurrence = getLastOccurrenceOfDayInMonth(date.getFullYear(), date.getMonth(), dayNum);
                  if (lastOccurrence && lastOccurrence.getDate() === date.getDate()) {
                    return true;
                  }
                }
              } else {
                // No ordinal, just check day of week
                return true;
              }
            }
          }
        }
        return false;
      }
      // No BYDAY specified, check if interval matches
      return true;
    
    case 'MONTHLY':
      if (parsed.bymonthday && parsed.bymonthday.length > 0) {
        // Check if today's date matches any BYMONTHDAY
        const todayDate = date.getDate();
        return parsed.bymonthday.includes(todayDate);
      }
      if (parsed.byday && parsed.byday.length > 0) {
        // Check if today matches BYDAY (e.g., "2FR" = 2nd Friday)
        const todayDayOfWeek = date.getDay();
        for (const day of parsed.byday) {
          const match = day.match(/^(-?\d+)?([A-Z]{2})$/);
          if (match) {
            const ordinal = match[1] ? parseInt(match[1], 10) : null;
            const dayAbbr = match[2];
            const dayNum = iCalToDayOfWeek(dayAbbr);
            
            if (dayNum === todayDayOfWeek) {
              if (ordinal) {
                const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
                if (ordinal > 0 && weekOfMonth === ordinal) {
                  return true;
                } else if (ordinal < 0) {
                  const lastOccurrence = getLastOccurrenceOfDayInMonth(date.getFullYear(), date.getMonth(), dayNum);
                  if (lastOccurrence && lastOccurrence.getDate() === date.getDate()) {
                    return true;
                  }
                }
              }
            }
          }
        }
        return false;
      }
      return true;
    
    default:
      return false;
  }
}

/**
 * Parse iCalendar date format (YYYYMMDDTHHMMSSZ or YYYYMMDD)
 */
function parseICalDate(dateStr: string): Date | null {
  try {
    // Handle YYYYMMDDTHHMMSSZ format
    if (dateStr.includes('T')) {
      const datePart = dateStr.substring(0, 8);
      const timePart = dateStr.substring(9, 15);
      const year = parseInt(datePart.substring(0, 4), 10);
      const month = parseInt(datePart.substring(4, 6), 10) - 1;
      const day = parseInt(datePart.substring(6, 8), 10);
      const hour = parseInt(timePart.substring(0, 2), 10);
      const minute = parseInt(timePart.substring(2, 4), 10);
      const second = parseInt(timePart.substring(4, 6), 10);
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      // Handle YYYYMMDD format
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1;
      const day = parseInt(dateStr.substring(6, 8), 10);
      return new Date(year, month, day);
    }
  } catch {
    return null;
  }
}

/**
 * Get the last occurrence of a day of week in a month
 */
function getLastOccurrenceOfDayInMonth(year: number, month: number, dayOfWeek: number): Date | null {
  const lastDay = new Date(year, month + 1, 0); // Last day of month
  const lastDayOfWeek = lastDay.getDay();
  
  let daysToSubtract = (lastDayOfWeek - dayOfWeek + 7) % 7;
  if (daysToSubtract === 0) {
    daysToSubtract = 7; // If it's the same day, go back a week
  }
  
  const lastOccurrence = new Date(year, month, lastDay.getDate() - daysToSubtract + 7);
  if (lastOccurrence.getMonth() === month) {
    return lastOccurrence;
  }
  
  // If we went into next month, go back another week
  return new Date(year, month, lastDay.getDate() - daysToSubtract);
}

