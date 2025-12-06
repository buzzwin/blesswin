import { cn } from '@lib/utils';
import { Flame } from 'lucide-react';
import type { RitualCompletion } from '@lib/types/ritual';

interface StreakVisualizationProps {
  currentStreak: number;
  longestStreak: number;
  completions: RitualCompletion[];
  className?: string;
}

/**
 * Get date string for N days ago
 */
function getDateStringDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date string
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get all dates in the last 30 days
 */
function getLast30Days(): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 30; i++) {
    dates.push(getDateStringDaysAgo(i));
  }
  return dates.reverse(); // Oldest first
}

export function StreakVisualization({
  currentStreak,
  longestStreak,
  completions,
  className
}: StreakVisualizationProps): JSX.Element {
  const last30Days = getLast30Days();
  const completedDates = new Set(completions.map(c => c.date));
  const today = getTodayDateString();

  return (
    <div className={cn('space-y-3 md:space-y-4', className)}>
      {/* Streak Counter */}
      <div className='flex items-center justify-center gap-3 md:gap-4'>
        <div className='text-center'>
          <div className='mb-0.5 flex items-center justify-center gap-1.5 md:mb-1 md:gap-2'>
            {currentStreak > 0 && (
              <Flame className='h-4 w-4 text-orange-500 md:h-5 md:w-5' />
            )}
            <span className='text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
              {currentStreak}
            </span>
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400 md:text-sm'>
            day {currentStreak === 1 ? 'streak' : 'streak'}
          </div>
        </div>
        {longestStreak > currentStreak && (
          <>
            <div className='h-10 w-px bg-gray-300 dark:bg-gray-700 md:h-12' />
            <div className='text-center'>
              <div className='mb-0.5 text-xl font-bold text-gray-600 dark:text-gray-400 md:mb-1 md:text-2xl'>
                {longestStreak}
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                longest streak
              </div>
            </div>
          </>
        )}
      </div>

      {/* Calendar View */}
      <div>
        <h3 className='mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300 md:mb-3 md:text-sm'>
          Last 30 Days
        </h3>
        <div className='grid grid-cols-7 gap-0.5 md:gap-1'>
          {last30Days.map((date, index) => {
            const isCompleted = completedDates.has(date);
            const isToday = date === today;
            const isFuture = date > today;

            return (
              <div
                key={date}
                className={cn(
                  'aspect-square rounded text-xs',
                  isFuture && 'opacity-30',
                  isCompleted
                    ? 'bg-green-500 dark:bg-green-600'
                    : isToday
                    ? 'border-2 border-purple-500 bg-purple-100 dark:bg-purple-900/20'
                    : 'bg-gray-200 dark:bg-gray-700',
                  'flex items-center justify-center'
                )}
                title={date}
              >
                {isToday && !isCompleted && (
                  <span className='text-purple-600 dark:text-purple-400'>•</span>
                )}
              </div>
            );
          })}
        </div>
        <div className='mt-2 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400'>
          <div className='flex items-center gap-1'>
            <div className='h-3 w-3 rounded bg-green-500 dark:bg-green-600' />
            <span>Completed</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='h-3 w-3 rounded border-2 border-purple-500 bg-purple-100 dark:bg-purple-900/20' />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

