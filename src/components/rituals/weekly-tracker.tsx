import { cn } from '@lib/utils';
import type { RitualCompletion } from '@lib/types/ritual';

interface WeeklyTrackerProps {
  completions: RitualCompletion[];
  className?: string;
  onDateClick?: () => void;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get all dates in the current week (Sunday to Saturday)
 */
function getCurrentWeekDates(): Array<{ date: string; dayName: string; dayNumber: number }> {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDay);
  
  const weekDates: Array<{ date: string; dayName: string; dayNumber: number }> = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    const dayNumber = date.getDate();
    weekDates.push({
      date: dateString,
      dayName: dayNames[i],
      dayNumber
    });
  }
  
  return weekDates;
}

export function WeeklyTracker({
  completions,
  className,
  onDateClick
}: WeeklyTrackerProps): JSX.Element {
  const weekDates = getCurrentWeekDates();
  const completedDates = new Set(completions.map(c => c.date));
  const today = getTodayDateString();

  const handleDateClick = (date: string, isCompleted: boolean, isFuture: boolean, isToday: boolean): void => {
    // Only allow clicking on today's date if not completed
    if (onDateClick && !isCompleted && !isFuture && isToday) {
      onDateClick();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Day names row - compact for mobile */}
      <div className='mb-1 grid grid-cols-7 gap-0.5 md:mb-1.5 md:gap-1'>
        {weekDates.map(({ dayName }) => (
          <div
            key={dayName}
            className='text-center text-[10px] font-medium text-gray-600 dark:text-gray-400 md:text-xs'
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid - very compact for mobile */}
      <div className='grid grid-cols-7 gap-0.5 md:gap-1'>
        {weekDates.map(({ date, dayNumber }) => {
          const isCompleted = completedDates.has(date);
          const isToday = date === today;
          const isFuture = date > today;
          const isClickable = !isCompleted && !isFuture && isToday && onDateClick;

          return (
            <div
              key={date}
              onClick={() => handleDateClick(date, isCompleted, isFuture, isToday)}
              className={cn(
                'rounded flex items-center justify-center',
                // Mobile: very small fixed height, desktop: slightly larger
                'h-8 w-full md:h-10',
                isFuture && 'opacity-40',
                isCompleted
                  ? 'bg-green-500 dark:bg-green-600'
                  : isToday
                  ? 'border-2 border-purple-500 bg-purple-100 dark:bg-purple-900/20'
                  : 'bg-gray-200 dark:bg-gray-700',
                isClickable && 'cursor-pointer transition-all hover:scale-105 hover:shadow-md hover:bg-purple-200 dark:hover:bg-purple-800/30'
              )}
              title={date}
            >
              <span
                className={cn(
                  'text-[10px] font-semibold leading-none md:text-xs',
                  isCompleted
                    ? 'text-white'
                    : isToday
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {dayNumber}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend - compact for mobile */}
      <div className='mt-1.5 flex items-center justify-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 md:mt-2 md:gap-4 md:text-xs'>
        <div className='flex items-center gap-1'>
          <div className='h-2 w-2 rounded bg-green-500 dark:bg-green-600 md:h-2.5 md:w-2.5' />
          <span>Done</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='h-2 w-2 rounded border border-purple-500 bg-purple-100 dark:bg-purple-900/20 md:h-2.5 md:w-2.5' />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

