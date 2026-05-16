import Link from 'next/link';
import { Flame, Calendar, Settings, TrendingUp } from 'lucide-react';
import type { RitualStats } from '@lib/types/ritual';

interface RitualStatsWidgetProps {
  stats: RitualStats | null;
  loading?: boolean;
  onSettingsClick?: () => void;
}

export function RitualStatsWidget({
  stats,
  loading = false,
  onSettingsClick
}: RitualStatsWidgetProps): JSX.Element {
  if (loading) {
    return (
      <div className='rounded-xl border border-gray-200 bg-[#faf8f4] p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
        <div className='animate-pulse'>
          <div className='h-4 w-32 bg-gray-200 rounded dark:bg-[#231a10] mb-3'></div>
          <div className='h-8 w-24 bg-gray-200 rounded dark:bg-[#231a10]'></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-[#2a1d10] dark:from-purple-900/20 dark:to-pink-900/20'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-1'>
              Daily Rituals
            </h3>
            <p className='text-xs text-gray-600 dark:text-[#9E8B76]'>
              Start your wellness journey
            </p>
          </div>
          <Link
            href='/rituals'
            className='rounded-full bg-[#C97D60] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B56540] transition-colors'
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-[#faf8f4] p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-5 w-5 text-[#C9A96E] dark:text-[#C9A96E]' />
          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
            Your Ritual Progress
          </h3>
        </div>
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className='rounded-full p-1.5 text-gray-600 hover:bg-gray-100 dark:text-[#9E8B76] dark:hover:bg-[#231a10] transition-colors'
            aria-label='Settings'
          >
            <Settings className='h-4 w-4' />
          </button>
        )}
      </div>

      <div className='grid grid-cols-3 gap-3'>
        {/* Current Streak */}
        <div className='text-center'>
          <div className='flex items-center justify-center gap-1 mb-1'>
            <Flame className='h-4 w-4 text-orange-500' />
            <span className='text-lg font-bold text-gray-900 dark:text-white'>
              {stats.currentStreak}
            </span>
          </div>
          <p className='text-xs text-gray-600 dark:text-[#9E8B76]'>
            Day Streak
          </p>
        </div>

        {/* Total Completed */}
        <div className='text-center'>
          <div className='text-lg font-bold text-gray-900 dark:text-white mb-1'>
            {stats.totalCompleted}
          </div>
          <p className='text-xs text-gray-600 dark:text-[#9E8B76]'>
            Completed
          </p>
        </div>

        {/* Completion Rate */}
        <div className='text-center'>
          <div className='flex items-center justify-center gap-1 mb-1'>
            <TrendingUp className='h-4 w-4 text-green-500' />
            <span className='text-lg font-bold text-gray-900 dark:text-white'>
              {Math.round(stats.completionRate || 0)}%
            </span>
          </div>
          <p className='text-xs text-gray-600 dark:text-[#9E8B76]'>
            Rate
          </p>
        </div>
      </div>

      {/* View All Link */}
      <Link
        href='/rituals'
        className='mt-3 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-[#C4B5A0] dark:hover:bg-[#231a10] transition-colors'
      >
        View All Rituals →
      </Link>
    </div>
  );
}

