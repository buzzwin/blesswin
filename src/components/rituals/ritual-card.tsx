import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@lib/utils';
import { 
  impactTagLabels, 
  impactTagColors, 
  effortLevelLabels, 
  effortLevelIcons 
} from '@lib/types/impact-moment';
import type { RitualDefinition } from '@lib/types/ritual';
import { Check, X, Sparkles, Share2 } from 'lucide-react';

interface RitualCardProps {
  ritual: RitualDefinition;
  isGlobal?: boolean;
  completed?: boolean;
  completedAt?: string;
  onCompleteQuietly?: () => void;
  onCompleteAndShare?: () => void;
  onShare?: () => void;
  onShareRitual?: () => void;
  loading?: boolean;
}

export function RitualCard({
  ritual,
  isGlobal = false,
  completed = false,
  completedAt,
  onCompleteQuietly,
  onCompleteAndShare,
  onShare,
  onShareRitual,
  loading = false
}: RitualCardProps): JSX.Element {
  const [showActions, setShowActions] = useState(!completed);

  return (
    <div className={cn(
      'rounded-xl border-2 p-5 transition-all',
      isGlobal 
        ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
      completed && 'opacity-75'
    )}>
      {/* Badge */}
      <div className='mb-3 flex items-center justify-between'>
        <span className={cn(
          'rounded-full px-3 py-1 text-xs font-semibold',
          isGlobal
            ? 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        )}>
          {isGlobal ? 'Global Ritual of the Day' : 'Recommended for You'}
        </span>
        <div className='flex items-center gap-2'>
          {onShareRitual && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShareRitual();
              }}
              className='rounded-full p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
              aria-label='Share ritual'
              title='Share ritual'
            >
              <Share2 className='h-4 w-4' />
            </button>
          )}
          {completed && (
            <div className='flex items-center gap-1 text-sm text-green-600 dark:text-green-400'>
              <Check className='h-4 w-4' />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Icon and Title */}
      <div className='mb-3 flex items-start gap-3'>
        <div className='text-3xl'>{ritual.icon || '🌱'}</div>
        <div className='flex-1'>
          <h3 className='mb-2 text-lg font-bold text-gray-900 dark:text-white'>
            {ritual.title}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {ritual.description}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className='mb-3 flex flex-wrap gap-2'>
        {ritual.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              impactTagColors[tag]
            )}
          >
            {impactTagLabels[tag]}
          </span>
        ))}
      </div>

      {/* Effort Level and Duration */}
      <div className='mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>{effortLevelIcons[ritual.effortLevel]}</span>
          <span>{effortLevelLabels[ritual.effortLevel]} Effort</span>
        </div>
        <span>{ritual.durationEstimate}</span>
      </div>

      {/* Completion Status */}
      {completed && completedAt && (
        <div className='mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300'>
          Completed at {completedAt}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && !completed && (
        <div className='flex gap-2'>
          {onCompleteQuietly && (
            <button
              onClick={() => {
                onCompleteQuietly();
                setShowActions(false);
              }}
              disabled={loading}
              className={cn(
                'flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold',
                'text-gray-700 transition-colors hover:bg-gray-50',
                'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? 'Completing...' : 'Complete Quietly'}
            </button>
          )}
          {onCompleteAndShare && (
            <button
              onClick={() => {
                onCompleteAndShare();
                setShowActions(false);
              }}
              disabled={loading}
              className={cn(
                'flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white',
                'transition-colors hover:bg-purple-700',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? 'Completing...' : 'Complete & Share'}
            </button>
          )}
        </div>
      )}

      {/* Share Button (if completed quietly) */}
      {completed && !completedAt && onShare && (
        <button
          onClick={onShare}
          className={cn(
            'w-full rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold',
            'text-purple-700 transition-colors hover:bg-purple-100',
            'dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30'
          )}
        >
          Share This Moment
        </button>
      )}
    </div>
  );
}

