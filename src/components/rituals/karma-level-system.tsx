import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@lib/utils';
import { calculateLevel, getProgressToNextLevel, getKarmaRemainingForNextLevel } from '@lib/utils/level-calculation';
import { UserKarmaBadge } from '@components/user/user-karma-badge';

interface KarmaLevelSystemProps {
  karmaPoints: number;
  previousKarma?: number;
  className?: string;
  showLevelUpAnimation?: boolean;
  compact?: boolean;
}

export function KarmaLevelSystem({
  karmaPoints,
  previousKarma = 0,
  className,
  showLevelUpAnimation = false,
  compact = false
}: KarmaLevelSystemProps): JSX.Element {
  const [displayKarma, setDisplayKarma] = useState(karmaPoints);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const currentLevel = calculateLevel(karmaPoints);
  const previousLevel = calculateLevel(previousKarma);
  const progress = getProgressToNextLevel(karmaPoints);
  const karmaRemaining = getKarmaRemainingForNextLevel(karmaPoints);

  // Animate karma increase
  useEffect(() => {
    if (karmaPoints > previousKarma && showLevelUpAnimation) {
      setIsAnimating(true);
      const duration = 800;
      const steps = 30;
      const increment = (karmaPoints - previousKarma) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayKarma(karmaPoints);
          setIsAnimating(false);
          clearInterval(interval);
        } else {
          setDisplayKarma(Math.round(previousKarma + increment * currentStep));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    } else {
      setDisplayKarma(karmaPoints);
    }
  }, [karmaPoints, previousKarma, showLevelUpAnimation]);

  // Show level up animation
  useEffect(() => {
    if (currentLevel > previousLevel && previousLevel > 0) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, previousLevel]);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className='flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 dark:from-purple-900/30 dark:to-pink-900/30'>
          <Sparkles className='h-4 w-4 text-purple-600 dark:text-purple-400' />
          <span className='text-sm font-bold text-purple-700 dark:text-purple-300'>
            Level {currentLevel}
          </span>
        </div>
        <UserKarmaBadge karmaPoints={displayKarma} size='sm' animated={isAnimating} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Level Up Celebration */}
      {showLevelUp && (
        <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 p-6 text-center'>
          <div className='absolute inset-0 animate-pulse bg-white/20' />
          <div className='relative z-10'>
            <div className='mb-2 text-5xl'>🎉</div>
            <h3 className='text-2xl font-bold text-white'>Level Up!</h3>
            <p className='text-lg text-white/90'>You reached Level {currentLevel}!</p>
          </div>
        </div>
      )}

      {/* Level Display */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='mb-1 flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>Level</span>
          </div>
          <div className='flex items-baseline gap-2'>
            <span className={cn(
              'text-4xl font-bold transition-all',
              isAnimating && 'scale-110',
              'text-purple-700 dark:text-purple-300'
            )}>
              {currentLevel}
            </span>
            {currentLevel < 50 && (
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                / {currentLevel + 1}
              </span>
            )}
          </div>
        </div>
        <UserKarmaBadge karmaPoints={displayKarma} size='lg' animated={isAnimating} />
      </div>

      {/* Progress Bar */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between text-xs'>
          <span className='text-gray-600 dark:text-gray-400'>
            {karmaRemaining > 0 ? `${karmaRemaining} karma to next level` : 'Max level reached!'}
          </span>
          <span className='font-semibold text-gray-900 dark:text-white'>
            {Math.round(progress)}%
          </span>
        </div>
        <div className='relative h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className={cn(
              'h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-500',
              isAnimating && 'animate-pulse'
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          {/* Shine effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer' />
        </div>
      </div>

      {/* Karma Gained Indicator */}
      {karmaPoints > previousKarma && previousKarma > 0 && (
        <div className='flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20'>
          <TrendingUp className='h-4 w-4 text-green-600 dark:text-green-400' />
          <span className='text-sm font-medium text-green-700 dark:text-green-300'>
            +{karmaPoints - previousKarma} karma
          </span>
        </div>
      )}
    </div>
  );
}

