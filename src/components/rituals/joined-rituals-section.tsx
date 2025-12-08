import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { RitualCard } from './ritual-card';
import { Loading } from '@components/ui/loading';
import { Users } from 'lucide-react';
import type { RitualDefinition, RitualCompletion } from '@lib/types/ritual';
import { filterAndSortRituals } from '@lib/utils/ritual-filtering';
import type { SortOption } from '@components/rituals/rituals-sort';

interface JoinedRitualsSectionProps {
  onCompleteAndShare: (ritual: RitualDefinition) => void;
  onShareRitual: (ritual: RitualDefinition) => void;
  completingRitualId?: string | null;
  todayRituals?: {
    globalRitual?: RitualDefinition | null;
    personalizedRituals?: RitualDefinition[];
  } | null;
  onRefetch?: () => void;
  searchQuery?: string;
  sortBy?: SortOption;
  onCountsUpdate?: (count: number) => void;
  allCompletions?: RitualCompletion[];
  onEditRitual?: (ritual: RitualDefinition) => void;
  onDeleteRitual?: (ritual: RitualDefinition) => void;
}

export function JoinedRitualsSection({
  onCompleteAndShare,
  onShareRitual,
  completingRitualId,
  todayRituals,
  onRefetch,
  searchQuery = '',
  sortBy = 'popularity',
  onCountsUpdate,
  allCompletions = [],
  onEditRitual,
  onDeleteRitual
}: JoinedRitualsSectionProps): JSX.Element {
  const { user } = useAuth();
  const [joinedRituals, setJoinedRituals] = useState<RitualDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  // Get completion status from today's rituals
  const completedRitualIds = useMemo(() => {
    const ids = new Set<string>();
    if (todayRituals?.globalRitual?.completed && todayRituals.globalRitual.id) {
      ids.add(todayRituals.globalRitual.id);
    }
    if (todayRituals?.personalizedRituals) {
      todayRituals.personalizedRituals.forEach(r => {
        if (r.completed && r.id) {
          ids.add(r.id);
        }
      });
    }
    return ids;
  }, [todayRituals]);

  const fetchJoinedRituals = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/rituals/my-rituals?userId=${user.id}`);
      const data = await response.json();

      console.log('[JOINED-RITUALS] Fetched data:', {
        joinedRitualsCount: data.joinedRituals?.length || 0,
        joinedRitualIds: data.joinedRituals?.map((r: RitualDefinition) => r.id),
        joinedRitualTitles: data.joinedRituals?.map((r: RitualDefinition) => r.title)
      });

      if (response.ok && data.joinedRituals) {
        // Mark completion status for each ritual
        const ritualsWithCompletion = data.joinedRituals.map((ritual: RitualDefinition) => ({
          ...ritual,
          completed: completedRitualIds.has(ritual.id || '')
        }));
        setJoinedRituals(ritualsWithCompletion);
        // Update counts
        if (onCountsUpdate) {
          onCountsUpdate(ritualsWithCompletion.length);
        }
      }
    } catch (error) {
      console.error('Error fetching joined rituals:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, completedRitualIds, onCountsUpdate]);

  useEffect(() => {
    void fetchJoinedRituals();
  }, [fetchJoinedRituals]);

  // Sort joined rituals: incomplete first, then apply user's sort
  const sortedJoinedRituals = useMemo(() => {
    // First apply search filter
    const filtered = filterAndSortRituals(joinedRituals, searchQuery, sortBy);
    
    // Then sort by completion status: incomplete first
    return filtered.sort((a, b) => {
      const aCompleted = a.completed || false;
      const bCompleted = b.completed || false;
      
      // Incomplete rituals first
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }
      
      // If both have same completion status, maintain the existing sort order
      return 0;
    });
  }, [joinedRituals, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <Loading className='mt-5' />
      </div>
    );
  }

  if (sortedJoinedRituals.length === 0) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800 md:p-12'>
        <div className='mx-auto max-w-md'>
          <div className='mb-4 text-4xl md:text-6xl'>👥</div>
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white md:text-xl'>
            No Joined Rituals Yet
          </h3>
          <p className='mb-6 text-sm text-gray-600 dark:text-gray-400 md:text-base'>
            Explore available rituals and join ones that resonate with you. Joining rituals helps you stay committed to your daily practice!
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Tip: Check the "Available" tab to discover rituals you can join.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3 md:space-y-4'>
      <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4 lg:p-6'>
        <div className='mb-3 flex items-center justify-between md:mb-4'>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-green-600 dark:text-green-400 md:h-5 md:w-5' />
            <h3 className='text-base font-semibold text-gray-900 dark:text-white md:text-lg'>
              Joined Rituals
            </h3>
            <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
              {sortedJoinedRituals.length}
            </span>
          </div>
        </div>
        <p className='mb-3 text-xs text-gray-600 dark:text-gray-400 md:mb-4 md:text-sm'>
          Rituals you've joined are sorted with incomplete ones first. Complete them to earn karma!
        </p>
        <div className='space-y-2 md:space-y-3 lg:space-y-4'>
          {sortedJoinedRituals.map((ritual) => (
            <RitualCard
              key={ritual.id}
              ritual={ritual}
              isGlobal={ritual.scope === 'global'}
              completed={ritual.completed || false}
              onCompleteAndShare={() => onCompleteAndShare(ritual)}
              onShareRitual={() => onShareRitual(ritual)}
              loading={completingRitualId === ritual.id}
              showJoinButton={false}
              ritualScope={ritual.scope}
              onLeaveSuccess={fetchJoinedRituals}
              karmaReward={10}
              allCompletions={allCompletions}
              onEditRitual={onEditRitual ? () => onEditRitual(ritual) : undefined}
              onDeleteRitual={onDeleteRitual ? () => onDeleteRitual(ritual) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

