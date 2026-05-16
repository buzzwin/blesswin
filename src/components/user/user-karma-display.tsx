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
        'rounded-xl border border-gray-200 bg-[#faf8f4] p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]',
        className
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-[#6b5744] dark:text-[#9E8B76]'>
            Karma Points
          </h3>
          <UserKarmaBadge
            karmaPoints={karmaPoints}
            size='lg'
            animated={shouldAnimate}
            className='mt-2'
          />
          {showEncouragement && (
            <p className='mt-2 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
              {getEncouragementMessage()}
            </p>
          )}
          {nextMilestone && showEncouragement && (
            <div className='mt-3'>
              <div className='mb-1 flex items-center justify-between text-xs'>
                <span className='text-[#6b5744] dark:text-[#9E8B76]'>
                  Next milestone: {nextMilestone.toLocaleString()}
                </span>
                <span className='font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>
                  {Math.round(progressToNext)}%
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-[#231a10]'>
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
            className='ml-4 rounded-lg p-2 text-[#9E8B76] transition-colors hover:bg-[rgba(201,169,110,0.08)] dark:text-[#9E8B76] dark:hover:bg-[#231a10]'
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
        <div className='mt-4 border-t border-[#e8d8c4] pt-4 dark:border-[#2a1d10]'>
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
            <a className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#C97D60] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B56540]'>
              <Sparkles className='h-4 w-4' />
              Share Impact Moment
            </a>
          </Link>
          <Link href='/rituals'>
            <a className='flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#C9A96E] transition-colors hover:bg-[rgba(201,169,110,0.06)] dark:text-[#C9A96E] dark:hover:bg-[rgba(201,169,110,0.06)]'>
              Complete Ritual
              <ArrowRight className='h-4 w-4' />
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}

