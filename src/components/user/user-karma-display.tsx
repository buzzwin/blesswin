/**
 * UserKarmaDisplay Component
 * Main component for displaying user karma prominently
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserKarmaBadge } from './user-karma-badge';
import { UserKarmaBreakdown } from './user-karma-breakdown';
import { ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@lib/utils';
import type { KarmaBreakdown } from '@lib/types/karma';

interface UserKarmaDisplayProps {
  karmaPoints: number;
  karmaBreakdown: KarmaBreakdown;
  userId: string;
  className?: string;
  showBreakdown?: boolean;
  compact?: boolean;
  showEncouragement?: boolean;
}

export function UserKarmaDisplay({
  karmaPoints,
  karmaBreakdown,
  userId,
  className,
  showBreakdown = true,
  compact = false,
  showEncouragement = true
}: UserKarmaDisplayProps): JSX.Element {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [previousKarma, setPreviousKarma] = useState(karmaPoints);

  useEffect(() => {
    if (karmaPoints > previousKarma) {
      setPreviousKarma(karmaPoints);
    }
  }, [karmaPoints, previousKarma]);

  const shouldAnimate = karmaPoints > previousKarma;

  // Get encouraging message based on karma level
  const getEncouragementMessage = (): string => {
    if (karmaPoints === 0) {
      return 'Start your journey! Share impact moments to earn karma 🌱';
    } else if (karmaPoints < 50) {
      return 'Great start! Keep going to unlock more rewards ✨';
    } else if (karmaPoints < 100) {
      return 'You\'re building momentum! Keep sharing positive impact 🚀';
    } else if (karmaPoints < 250) {
      return 'Amazing progress! You\'re making a real difference 💫';
    } else if (karmaPoints < 500) {
      return 'Incredible! You\'re a karma champion! 🏆';
    } else {
      return 'Legendary! Your impact is inspiring others 🌟';
    }
  };

  // Calculate next milestone
  const getNextMilestone = (): number | null => {
    const milestones = [50, 100, 250, 500, 1000, 2500, 5000];
    return milestones.find(m => m > karmaPoints) || null;
  };

  const nextMilestone = getNextMilestone();
  const progressToNext = nextMilestone ? (karmaPoints / nextMilestone) * 100 : 100;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <UserKarmaBadge
          karmaPoints={karmaPoints}
          size='sm'
          animated={shouldAnimate}
        />
        {showBreakdown && (
          <UserKarmaBreakdown
            breakdown={karmaBreakdown}
            totalKarma={karmaPoints}
            compact
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
            Karma Points
          </h3>
          <UserKarmaBadge
            karmaPoints={karmaPoints}
            size='lg'
            animated={shouldAnimate}
            className='mt-2'
          />
          {showEncouragement && (
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              {getEncouragementMessage()}
            </p>
          )}
          {nextMilestone && showEncouragement && (
            <div className='mt-3'>
              <div className='mb-1 flex items-center justify-between text-xs'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Next milestone: {nextMilestone.toLocaleString()}
                </span>
                <span className='font-semibold text-gray-900 dark:text-white'>
                  {Math.round(progressToNext)}%
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className='h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500'
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {showBreakdown && (
          <button
            onClick={() => setBreakdownOpen(!breakdownOpen)}
            className='ml-4 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            aria-label='Toggle breakdown'
          >
            {breakdownOpen ? (
              <ChevronUp className='h-5 w-5' />
            ) : (
              <ChevronDown className='h-5 w-5' />
            )}
          </button>
        )}
      </div>

      {showBreakdown && breakdownOpen && (
        <div className='mt-4 border-t border-gray-200 pt-4 dark:border-gray-700'>
          <UserKarmaBreakdown
            breakdown={karmaBreakdown}
            totalKarma={karmaPoints}
            showLabels={false}
          />
        </div>
      )}

      {showEncouragement && karmaPoints < 100 && (
        <div className='mt-4 flex gap-2'>
          <Link href='/home'>
            <a className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700'>
              <Sparkles className='h-4 w-4' />
              Share Impact Moment
            </a>
          </Link>
          <Link href='/rituals'>
            <a className='flex flex-1 items-center justify-center gap-2 rounded-lg border border-purple-600 px-4 py-2 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20'>
              Complete Ritual
              <ArrowRight className='h-4 w-4' />
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}

