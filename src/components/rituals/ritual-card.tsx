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
import type { RitualDefinition, RitualScope, RitualCompletion } from '@lib/types/ritual';
import { Check, X, Sparkles, Share2, Users, ArrowRight, UserPlus, Globe, Lock, Edit2, Trash2 } from 'lucide-react';
import { WeeklyTracker } from './weekly-tracker';

interface RitualCardProps {
  ritual: RitualDefinition;
  isGlobal?: boolean;
  completed?: boolean;
  completedAt?: string;
  onCompleteAndShare?: () => void;
  onShare?: () => void;
  onShareRitual?: () => void;
  onInvite?: () => void; // Callback for invite button
  loading?: boolean;
  showJoinButton?: boolean; // Whether to show join button
  ritualScope?: RitualScope; // Scope for joining
  onJoinSuccess?: () => void; // Callback when join succeeds
  onLeaveSuccess?: () => void; // Callback when leave succeeds
  karmaReward?: number; // Karma points earned on completion
  isOwnRitual?: boolean; // Whether this ritual is owned by the current user
  onVisibilityChange?: () => void; // Callback when visibility changes
  allCompletions?: RitualCompletion[]; // All user completions to filter by ritualId
  onEditRitual?: () => void; // Callback for editing ritual
  onDeleteRitual?: () => void; // Callback for deleting ritual
}

export function RitualCard({
  ritual,
  isGlobal = false,
  completed = false,
  completedAt,
  onCompleteAndShare,
  onShare,
  onShareRitual,
  onInvite,
  loading = false,
  showJoinButton = false,
  ritualScope,
  onJoinSuccess,
  onLeaveSuccess,
  karmaReward,
  isOwnRitual = false,
  onVisibilityChange,
  allCompletions = [],
  onEditRitual,
  onDeleteRitual
}: RitualCardProps): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [showActions, setShowActions] = useState(!completed);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // Creator is automatically considered as joined
  const isCreator = (ritual as any).createdBy === user?.id || (ritual as any).sourceUserId === user?.id;
  const [hasJoined, setHasJoined] = useState(
    ritual.joinedByUsers?.includes(user?.id || '') || isCreator || false
  );
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  
  // Determine if user is the creator (for showing delete button)
  const userIsCreator = (ritual as any).createdBy === user?.id || (ritual as any).sourceUserId === user?.id;

  // Filter completions for this specific ritual
  const ritualCompletions = allCompletions.filter(
    c => c.ritualId === ritual.id
  );

  // Update hasJoined when ritual or user changes
  // Creator is automatically considered as joined
  useEffect(() => {
    const isCreator = (ritual as any).createdBy === user?.id || (ritual as any).sourceUserId === user?.id;
    const isJoined = ritual.joinedByUsers?.includes(user?.id || '') || isCreator || false;
    setHasJoined(isJoined);
  }, [ritual.joinedByUsers, (ritual as any).createdBy, user?.id]);

  const handleJoinRitual = async (): Promise<void> => {
    console.log('🔵 Join Ritual Clicked:', {
      userId: user?.id,
      ritualId: ritual.id,
      ritualTitle: ritual.title,
      ritualScope: ritualScope || (isGlobal ? 'global' : 'personalized'),
      hasJoined,
      isGlobal
    });

    if (!user?.id || !ritual.id) {
      console.error('❌ Cannot join: Missing user ID or ritual ID');
      toast.error('Please sign in to join rituals');
      return;
    }

    if (hasJoined) {
      console.log('⚠️ Already joined this ritual');
      toast.success('You have already joined this ritual');
      return;
    }

    setJoining(true);
    console.log('⏳ Sending join request...');

    try {
      const requestBody = {
        userId: user.id,
        ritualId: ritual.id,
        ritualTitle: ritual.title, // Include title for fallback lookup when ID is hardcoded
        ritualScope: ritualScope || (isGlobal ? 'global' : 'personalized')
      };
      
      console.log('📤 Join Request Body:', requestBody);

      const response = await fetch('/api/rituals/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Join Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Join Failed:', errorData);
        throw new Error(errorData.error || 'Failed to join ritual');
      }

      const successData = await response.json();
      console.log('✅ Join Success:', successData);

      setHasJoined(true);
      toast.success('You joined this ritual! 🌱');
      
      // Notify parent to refetch data
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (error) {
      console.error('❌ Join Error:', error);
      const message = error instanceof Error ? error.message : 'Failed to join ritual';
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  const handleToggleVisibility = async (): Promise<void> => {
    if (!user?.id || !ritual.id || !isOwnRitual) {
      return;
    }

    setTogglingVisibility(true);
    try {
      const newScope: RitualScope = ritual.scope === 'public' ? 'personalized' : 'public';
      
      const response = await fetch(`/api/rituals/${ritual.id}/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          scope: newScope
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Ritual is now ${newScope === 'public' ? 'public' : 'private'}`);
        onVisibilityChange?.();
      } else {
        throw new Error(data.error || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update visibility');
    } finally {
      setTogglingVisibility(false);
    }
  };

  const handleLeaveRitual = async (): Promise<void> => {
    console.log('🔴 Leave Ritual Clicked:', {
      userId: user?.id,
      ritualId: ritual.id,
      ritualTitle: ritual.title,
      ritualScope: ritualScope || (isGlobal ? 'global' : 'personalized'),
      hasJoined
    });

    if (!user?.id || !ritual.id) {
      console.error('❌ Cannot leave: Missing user ID or ritual ID');
      toast.error('Please sign in to leave rituals');
      return;
    }

    if (!hasJoined) {
      console.log('⚠️ Not joined to this ritual');
      toast.error('You are not joined to this ritual');
      return;
    }

    // Confirm before leaving
    if (!window.confirm('Are you sure you want to leave this ritual? You can always join again later.')) {
      return;
    }

    setLeaving(true);
    console.log('⏳ Sending leave request...');

    try {
      const requestBody = {
        userId: user.id,
        ritualId: ritual.id,
        ritualScope: ritualScope || (isGlobal ? 'global' : 'personalized')
      };
      
      console.log('📤 Leave Request Body:', requestBody);

      const response = await fetch('/api/rituals/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Leave Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Leave Failed:', errorData);
        throw new Error(errorData.error || 'Failed to leave ritual');
      }

      const successData = await response.json();
      console.log('✅ Leave Success:', successData);

      setHasJoined(false);
      toast.success('You left this ritual');
      
      // Notify parent to refetch data
      if (onLeaveSuccess) {
        onLeaveSuccess();
      }
    } catch (error) {
      console.error('❌ Leave Error:', error);
      const message = error instanceof Error ? error.message : 'Failed to leave ritual';
      toast.error(message);
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className={cn(
      'rounded-lg border-2 p-3 transition-all md:rounded-xl md:p-4 lg:p-5',
      isGlobal 
        ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
      completed && 'opacity-75'
    )}>
      {/* Badge and Info */}
      <div className='mb-2 flex items-center justify-between md:mb-3'>
        <div className='flex items-center gap-2'>
          {/* Only show badge if not joined, or if it's a global ritual */}
          {(!hasJoined || isGlobal) && (
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold md:px-3 md:py-1',
              isGlobal
                ? 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            )}>
              {isGlobal ? 'Global Ritual of the Day' : 'Recommended for You'}
            </span>
          )}
          {/* Joined indicator */}
          {hasJoined && (
            <span className='flex items-center gap-1 text-[10px] font-medium text-green-700 dark:text-green-300 md:text-xs'>
              <Check className='h-3 w-3' />
              You joined
            </span>
          )}
          {/* Karma reward */}
          {karmaReward !== undefined && karmaReward > 0 && (
            <span className='flex items-center gap-1 text-[10px] font-medium text-purple-700 dark:text-purple-300 md:text-xs'>
              <Sparkles className='h-3 w-3' />
              {completed ? 'Earned' : 'Earn'} {karmaReward} karma
            </span>
          )}
        </div>
        <div className='flex items-center gap-1'>
          {hasJoined && user && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleLeaveRitual();
              }}
              disabled={leaving}
              className={cn(
                'rounded-full border border-red-300 bg-white px-1.5 py-1 text-[10px] font-medium text-red-600',
                'transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20',
                'flex items-center justify-center',
                leaving && 'opacity-50 cursor-not-allowed'
              )}
              title='Leave ritual'
            >
              {leaving ? (
                <Sparkles className='h-2.5 w-2.5 animate-spin' />
              ) : (
                <X className='h-2.5 w-2.5' />
              )}
            </button>
          )}
          {userIsCreator && onEditRitual && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditRitual();
              }}
              className='rounded-full p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
              aria-label='Edit ritual'
              title='Edit ritual'
            >
              <Edit2 className='h-3.5 w-3.5' />
            </button>
          )}
          {userIsCreator && onDeleteRitual && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRitual();
              }}
              className='rounded-full p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
              aria-label='Delete ritual'
              title='Delete ritual'
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          )}
          {isOwnRitual && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleToggleVisibility();
              }}
              disabled={togglingVisibility}
              className='rounded-full p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
              aria-label={ritual.scope === 'public' ? 'Make private' : 'Make public'}
              title={ritual.scope === 'public' ? 'Make private' : 'Make public'}
            >
              {ritual.scope === 'public' ? (
                <Globe className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
              ) : (
                <Lock className='h-3.5 w-3.5' />
              )}
            </button>
          )}
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
              <Share2 className='h-3.5 w-3.5' />
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
      <div className='mb-2 flex items-start gap-2 md:mb-3 md:gap-3'>
        <div className='text-2xl md:text-3xl'>{ritual.icon || '🌱'}</div>
        <div className='flex-1'>
          <h3 className='mb-1 text-base font-bold text-gray-900 dark:text-white md:mb-2 md:text-lg'>
            {ritual.title}
          </h3>
          <p className='text-xs text-gray-600 dark:text-gray-400 md:text-sm'>
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
              'rounded-full px-2 py-0.5 text-xs font-medium md:px-2.5 md:py-1',
              impactTagColors[tag]
            )}
          >
            {impactTagLabels[tag]}
          </span>
        ))}
      </div>

      {/* Effort Level and Duration */}
      <div className='mb-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 md:mb-3 md:text-sm'>
        <div className='flex items-center gap-1.5 md:gap-2'>
          <span className='text-base md:text-lg'>{effortLevelIcons[ritual.effortLevel]}</span>
          <span>{effortLevelLabels[ritual.effortLevel]} Effort</span>
        </div>
        <span>{ritual.durationEstimate}</span>
      </div>

      {/* Weekly Tracker - Completion Status */}
      {hasJoined && (
        <div className='mb-2 md:mb-3'>
          <WeeklyTracker 
            completions={ritualCompletions} 
            onDateClick={onCompleteAndShare && !completed ? onCompleteAndShare : undefined}
          />
        </div>
      )}


      {/* Joined Count */}
      {(ritual.joinedByUsers?.length || 0) > 0 && (
        <div className='mb-2 md:mb-3'>
          <Link href={`/rituals/${ritual.id}/participants`}>
            <a className='inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30 md:gap-2 md:px-3 md:py-2 md:text-sm'>
              <Users className='h-3 w-3 md:h-4 md:w-4' />
              <span>
                {ritual.joinedByUsers?.length || 0} {ritual.joinedByUsers?.length === 1 ? 'person has' : 'people have'} joined
              </span>
              <ArrowRight className='h-3 w-3' />
            </a>
          </Link>
        </div>
      )}

      {/* Invite Friends Button */}
      {onInvite && hasJoined && !completed && (
        <div className='mb-2 md:mb-3'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInvite();
            }}
            className={cn(
              'w-full rounded-lg border-2 border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold',
              'text-purple-700 transition-colors hover:bg-purple-50',
              'dark:border-purple-700 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-purple-900/20',
              'flex items-center justify-center gap-1.5 md:gap-2 md:px-4 md:py-2 md:text-sm'
            )}
          >
            <UserPlus className='h-3 w-3 md:h-4 md:w-4' />
            Invite Friends
          </button>
        </div>
      )}

      {/* Completion Status */}
      {completed && completedAt && (
        <div className='mb-2 rounded-lg bg-green-50 p-2 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-300 md:mb-3 md:p-3 md:text-sm'>
          Completed at {completedAt}
        </div>
      )}

      {/* Join Ritual Button */}
      {showJoinButton && !completed && user && !hasJoined && (
        <div className='mb-2 md:mb-3'>
          <button
            onClick={handleJoinRitual}
            disabled={joining}
            className={cn(
              'w-full rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white',
              'transition-colors hover:bg-purple-700',
              'flex items-center justify-center gap-1.5',
              'md:px-4 md:py-2.5 md:text-sm md:gap-2',
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


      {/* Action Buttons */}
      {showActions && !completed && (
        <div className='flex gap-1.5 md:gap-2'>
          {onCompleteAndShare && (
            <button
              onClick={() => {
                onCompleteAndShare();
                setShowActions(false);
              }}
              disabled={loading}
              className={cn(
                'w-full rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white',
                'transition-colors hover:bg-purple-700',
                'flex items-center justify-center gap-1.5',
                'md:px-4 md:py-2 md:text-sm md:gap-2',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <Sparkles className='h-3 w-3 animate-spin md:h-4 md:w-4' />
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
            'w-full rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-xs font-semibold',
            'text-purple-700 transition-colors hover:bg-purple-100',
            'dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30',
            'md:px-4 md:py-2 md:text-sm'
          )}
        >
          Share This Moment
        </button>
      )}
    </div>
  );
}

