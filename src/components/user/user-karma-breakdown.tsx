/**
 * KarmaBreakdown Component
 * Visual breakdown of karma by category with progress bars
 */

import { Heart, Flame, MessageCircle, Link2, Trophy } from 'lucide-react';
import { cn } from '@lib/utils';
import type { KarmaBreakdown } from '@lib/types/karma';

interface UserKarmaBreakdownProps {
  breakdown: KarmaBreakdown;
  totalKarma: number;
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

const categoryConfig = {
  impactMoments: {
    label: 'Impact Moments',
    icon: Heart,
    color: 'bg-pink-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    textColor: 'text-pink-700 dark:text-pink-300'
  },
  rituals: {
    label: 'Rituals',
    icon: Flame,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-300'
  },
  engagement: {
    label: 'Engagement',
    icon: MessageCircle,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300'
  },
  chains: {
    label: 'Chains',
    icon: Link2,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300'
  },
  milestones: {
    label: 'Milestones',
    icon: Trophy,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-300'
  }
} as const;

export function UserKarmaBreakdown({
  breakdown,
  totalKarma,
  className,
  showLabels = true,
  compact = false
}: UserKarmaBreakdownProps): JSX.Element {
  const categories = Object.entries(breakdown) as Array<
    [keyof KarmaBreakdown, number]
  >;

  const getPercentage = (value: number): number => {
    if (totalKarma === 0) return 0;
    return Math.round((value / totalKarma) * 100);
  };

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {categories.map(([key, value]) => {
          const config = categoryConfig[key];
          const Icon = config.icon;
          if (value === 0) return null;

          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs',
                config.bgColor,
                config.textColor
              )}
            >
              <Icon className='h-3 w-3' />
              <span className='font-medium'>{value}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {showLabels && (
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Karma Breakdown
        </h3>
      )}
      <div className='space-y-3'>
        {categories.map(([key, value]) => {
          const config = categoryConfig[key];
          const Icon = config.icon;
          const percentage = getPercentage(value);

          return (
            <div key={key} className='space-y-1'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Icon
                    className={cn('h-4 w-4', config.textColor)}
                  />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {config.label}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                    {value.toLocaleString()}
                  </span>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    config.color
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

