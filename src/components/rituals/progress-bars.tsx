import { CheckCircle, Target, Calendar } from 'lucide-react';
import { cn } from '@lib/utils';

interface ProgressBarsProps {
  dailyCompleted: number;
  dailyGoal: number;
  weeklyCompleted: number;
  weeklyGoal: number;
  className?: string;
}

export function ProgressBars({
  dailyCompleted,
  dailyGoal,
  weeklyCompleted,
  weeklyGoal,
  className
}: ProgressBarsProps): JSX.Element {
  const dailyProgress = Math.min(100, (dailyCompleted / dailyGoal) * 100);
  const weeklyProgress = Math.min(100, (weeklyCompleted / weeklyGoal) * 100);
  const dailyComplete = dailyCompleted >= dailyGoal;
  const weeklyComplete = weeklyCompleted >= weeklyGoal;

  return (
    <div className={cn('space-y-3 md:space-y-4', className)}>
      {/* Daily Progress */}
      <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4'>
        <div className='mb-2 flex items-center justify-between md:mb-3'>
          <div className='flex items-center gap-1.5 md:gap-2'>
            <Calendar className='h-4 w-4 text-blue-600 dark:text-blue-400 md:h-5 md:w-5' />
            <h3 className='text-xs font-semibold text-gray-900 dark:text-white md:text-sm'>
              Daily Goal
            </h3>
          </div>
          {dailyComplete && (
            <div className='flex items-center gap-1 text-green-600 dark:text-green-400'>
              <CheckCircle className='h-3 w-3 md:h-4 md:w-4' />
              <span className='text-xs font-medium'>Complete!</span>
            </div>
          )}
        </div>
        <div className='mb-1.5 flex items-center justify-between text-xs md:mb-2'>
          <span className='text-gray-600 dark:text-gray-400'>
            {dailyCompleted} / {dailyGoal} rituals
          </span>
          <span className='font-semibold text-gray-900 dark:text-white'>
            {Math.round(dailyProgress)}%
          </span>
        </div>
        <div className='relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 md:h-2.5'>
          <div
            className={cn(
              'h-full transition-all duration-500',
              dailyComplete
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            )}
            style={{ width: `${dailyProgress}%` }}
          />
          {dailyComplete && (
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer' />
          )}
        </div>
      </div>

      {/* Weekly Progress */}
      <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4'>
        <div className='mb-2 flex items-center justify-between md:mb-3'>
          <div className='flex items-center gap-1.5 md:gap-2'>
            <Target className='h-4 w-4 text-purple-600 dark:text-purple-400 md:h-5 md:w-5' />
            <h3 className='text-xs font-semibold text-gray-900 dark:text-white md:text-sm'>
              Weekly Goal
            </h3>
          </div>
          {weeklyComplete && (
            <div className='flex items-center gap-1 text-green-600 dark:text-green-400'>
              <CheckCircle className='h-3 w-3 md:h-4 md:w-4' />
              <span className='text-xs font-medium'>Complete!</span>
            </div>
          )}
        </div>
        <div className='mb-1.5 flex items-center justify-between text-xs md:mb-2'>
          <span className='text-gray-600 dark:text-gray-400'>
            {weeklyCompleted} / {weeklyGoal} rituals
          </span>
          <span className='font-semibold text-gray-900 dark:text-white'>
            {Math.round(weeklyProgress)}%
          </span>
        </div>
        <div className='relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 md:h-2.5'>
          <div
            className={cn(
              'h-full transition-all duration-500',
              weeklyComplete
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-gradient-to-r from-purple-400 to-pink-400'
            )}
            style={{ width: `${weeklyProgress}%` }}
          />
          {weeklyComplete && (
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer' />
          )}
        </div>
      </div>

      {/* Encouragement Message */}
      {dailyComplete && weeklyComplete && (
        <div className='rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 text-center dark:from-green-900/20 dark:to-emerald-900/20 md:p-4'>
          <p className='text-xs font-semibold text-green-800 dark:text-green-300 md:text-sm'>
            🎉 Amazing! You've completed all your goals this week!
          </p>
        </div>
      )}
    </div>
  );
}

