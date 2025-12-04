import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { 
  impactTagLabels, 
  impactTagColors, 
  effortLevelLabels, 
  effortLevelIcons 
} from '@lib/types/impact-moment';
import type { RitualDefinition } from '@lib/types/ritual';
import { Check, X, Sparkles, Share2, Users, ArrowRight } from 'lucide-react';
import { calculateRitualRipples } from '@lib/utils/ripple-calculation';

interface RitualCardProps {
  ritual: RitualDefinition;
  isGlobal?: boolean;
  completed?: boolean;
  completedAt?: string;
  onCompleteAndShare?: () => void;
  onShare?: () => void;
  onShareRitual?: () => void;
  loading?: boolean;
  showJoinButton?: boolean; // Whether to show join button
  ritualScope?: 'global' | 'personalized'; // Scope for joining
}

export function RitualCard({
  ritual,
  isGlobal = false,
  completed = false,
  completedAt,
  onCompleteAndShare,
  onShare,
  onShareRitual,
  loading = false,
  showJoinButton = false,
  ritualScope
}: RitualCardProps): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [showActions, setShowActions] = useState(!completed);
  const [rippleCount, setRippleCount] = useState(ritual.rippleCount || 0);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(
    ritual.joinedByUsers?.includes(user?.id || '') || false
  );

  // Calculate ripple count on mount
  useEffect(() => {
    if (ritual.id) {
      calculateRitualRipples(ritual).then(count => {
        setRippleCount(count);
      }).catch(err => {
        console.error('Error calculating ripple count:', err);
      });
    }
  }, [ritual]);

  const handleJoinRitual = async (): Promise<void> => {
    if (!user?.id || !ritual.id) {
      toast.error('Please sign in to join rituals');
      return;
    }

    if (hasJoined) {
      toast.success('You have already joined this ritual');
      return;
    }

    setJoining(true);

    try {
      const response = await fetch('/api/rituals/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          ritualId: ritual.id,
          ritualScope: ritualScope || (isGlobal ? 'global' : 'personalized')
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join ritual');
      }

      setHasJoined(true);
      setRippleCount(prev => prev + 1);
      toast.success('You joined this ritual! 🌱');
      
      // Refresh the page to show updated state
      router.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join ritual';
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

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

      {/* Ripple Count */}
      {rippleCount > 0 && (
        <div className='mb-4'>
          <Link href={`/rituals/${ritual.id}/ripples`}>
            <a className='inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30'>
              <Users className='h-4 w-4' />
              <span>
                {rippleCount} {rippleCount === 1 ? 'ripple' : 'ripples'}
              </span>
              <ArrowRight className='h-3 w-3' />
            </a>
          </Link>
        </div>
      )}

      {/* Completion Status */}
      {completed && completedAt && (
        <div className='mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300'>
          Completed at {completedAt}
        </div>
      )}

      {/* Join Ritual Button */}
      {showJoinButton && !completed && user && !hasJoined && (
        <div className='mb-3'>
          <button
            onClick={handleJoinRitual}
            disabled={joining}
            className={cn(
              'w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white',
              'transition-colors hover:bg-purple-700',
              'flex items-center justify-center gap-2',
              joining && 'opacity-50 cursor-not-allowed'
            )}
          >
            {joining ? (
              <>
                <Sparkles className='h-4 w-4 animate-spin' />
                Joining...
              </>
            ) : (
              <>
                <Users className='h-4 w-4' />
                Join Ritual
              </>
            )}
          </button>
        </div>
      )}

      {/* Joined Indicator */}
      {hasJoined && (
        <div className='mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'>
          ✓ You joined this ritual
        </div>
      )}

      {/* Action Buttons */}
      {showActions && !completed && (
        <div className='flex gap-2'>
          {onCompleteAndShare && (
            <button
              onClick={() => {
                onCompleteAndShare();
                setShowActions(false);
              }}
              disabled={loading}
              className={cn(
                'w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white',
                'transition-colors hover:bg-purple-700',
                'flex items-center justify-center gap-2',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <Sparkles className='h-4 w-4 animate-spin' />
                  Completing...
                </>
              ) : (
                <>
                  <span>🌱</span>
                  Complete & Share
                </>
              )}
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

