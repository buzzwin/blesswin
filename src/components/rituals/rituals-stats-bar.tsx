import { TrendingUp, Sparkles, Calendar } from 'lucide-react';
import { cn } from '@lib/utils';

export type RitualTab = 'joined' | 'available' | 'created' | 'progress' | 'achievements' | 'leaderboard';

interface RitualsStatsBarProps {
  dailyProgress: number;
  weeklyProgress: number;
  karmaPoints: number;
  ritualsCount: number;
  onNavigateToTab: (tab: RitualTab) => void;
  className?: string;
}

export function RitualsStatsBar({
  dailyProgress,
  weeklyProgress,
  karmaPoints,
  ritualsCount,
  onNavigateToTab,
  className
}: RitualsStatsBarProps): JSX.Element {
  const overallProgress = Math.round((dailyProgress + weeklyProgress) / 2);

  return (
    <div
      className={cn(
        'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        'py-2 px-3 md:py-3 md:px-4',
        className
      )}
    >
      <div className='mx-auto flex max-w-6xl items-center justify-between gap-3 md:gap-6'>
        {/* Progress Stat */}
        <button
          onClick={() => onNavigateToTab('progress')}
          className='flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 md:gap-3 md:px-3'
        >
          <TrendingUp className='h-4 w-4 text-blue-600 dark:text-blue-400 md:h-5 md:w-5' />
          <div className='flex-1 text-left'>
            <div className='text-xs text-gray-500 dark:text-gray-400 md:text-sm'>Progress</div>
            <div className='text-sm font-semibold text-gray-900 dark:text-white md:text-base'>
              {overallProgress}%
            </div>
          </div>
        </button>

        {/* Karma Points Stat */}
        <button
          onClick={() => onNavigateToTab('progress')}
          className='flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 md:gap-3 md:px-3'
        >
          <Sparkles className='h-4 w-4 text-yellow-600 dark:text-yellow-400 md:h-5 md:w-5' />
          <div className='flex-1 text-left'>
            <div className='text-xs text-gray-500 dark:text-gray-400 md:text-sm'>Karma</div>
            <div className='text-sm font-semibold text-gray-900 dark:text-white md:text-base'>
              {karmaPoints.toLocaleString()}
            </div>
          </div>
        </button>

        {/* Rituals Count Stat */}
        <button
          onClick={() => onNavigateToTab('joined')}
          className='flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 md:gap-3 md:px-3'
        >
          <Calendar className='h-4 w-4 text-purple-600 dark:text-purple-400 md:h-5 md:w-5' />
          <div className='flex-1 text-left'>
            <div className='text-xs text-gray-500 dark:text-gray-400 md:text-sm'>Rituals</div>
            <div className='text-sm font-semibold text-gray-900 dark:text-white md:text-base'>
              {ritualsCount}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

