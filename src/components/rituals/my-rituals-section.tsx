import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { RitualCard } from './ritual-card';
import { Loading } from '@components/ui/loading';
import { Plus, Edit2, Users, Sparkles, Trash2 } from 'lucide-react';
import type { RitualDefinition, RitualCompletion } from '@lib/types/ritual';
import { filterAndSortRituals } from '@lib/utils/ritual-filtering';
import type { SortOption } from '@components/rituals/rituals-sort';
import { toast } from 'react-hot-toast';

interface MyRitualsSectionProps {
  onCreateRitual: () => void;
  onEditRitual: (ritual: RitualDefinition) => void;
  onDeleteRitual?: (ritual: RitualDefinition) => void;
  onCompleteAndShare: (ritual: RitualDefinition) => void;
  onShareRitual: (ritual: RitualDefinition) => void;
  todayRituals?: {
    globalRitual?: RitualDefinition | null;
    personalizedRituals?: RitualDefinition[];
  } | null;
  onRefetch?: () => void;
  showOnlyAvailable?: boolean; // Show only available rituals (for Available tab)
  onCountsUpdate?: (counts: {
    myRituals: number;
    available: number;
    joined: number;
    created: number;
  }) => void;
  filterType?: 'created'; // Filter to apply to this section (only 'created' now)
  searchQuery?: string; // Search query for filtering rituals
  sortBy?: SortOption; // Sort option
  allCompletions?: RitualCompletion[]; // All user completions for weekly tracker
}

export function MyRitualsSection({
  onCreateRitual,
  onEditRitual,
  onDeleteRitual,
  onCompleteAndShare,
  onShareRitual,
  todayRituals,
  onRefetch,
  showOnlyAvailable = false,
  onCountsUpdate,
  filterType = 'created',
  searchQuery = '',
  sortBy = 'popularity',
  allCompletions = []
}: MyRitualsSectionProps): JSX.Element {
  const { user } = useAuth();
  const [createdRituals, setCreatedRituals] = useState<RitualDefinition[]>([]);
  const [joinedRituals, setJoinedRituals] = useState<RitualDefinition[]>([]);
  const [availableRituals, setAvailableRituals] = useState<RitualDefinition[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  console.log('🟢 MyRitualsSection rendered:', {
    userId: user?.id,
    loading,
    createdCount: createdRituals.length,
    joinedCount: joinedRituals.length,
    availableCount: availableRituals.length
  });

  const fetchMyRituals = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔵 Fetching My Rituals for userId:', user.id);
      setLoading(true);
      const response = await fetch(`/api/rituals/my-rituals?userId=${user.id}`);
      console.log('📥 My Rituals Response Status:', response.status);

      const data = (await response.json()) as {
        createdRituals?: RitualDefinition[];
        joinedRituals?: RitualDefinition[];
        availableRituals?: RitualDefinition[];
        error?: string;
      };
      console.log('📦 My Rituals Data:', {
        createdCount: data.createdRituals?.length || 0,
        joinedCount: data.joinedRituals?.length || 0,
        availableCount: data.availableRituals?.length || 0,
        createdRituals: data.createdRituals?.map((r: RitualDefinition) => ({
          id: r.id,
          title: r.title
        })),
        joinedRituals: data.joinedRituals?.map((r: RitualDefinition) => ({
          id: r.id,
          title: r.title
        })),
        availableRituals: data.availableRituals?.length || 0,
        error: data.error
      });

      if (response.ok) {
        // Get IDs of rituals that are in today's rituals (to filter duplicates)
        const todayRitualIds = new Set<string>();
        if (todayRituals) {
          if (todayRituals.globalRitual?.id) {
            todayRitualIds.add(todayRituals.globalRitual.id);
          }
          if (todayRituals.personalizedRituals) {
            todayRituals.personalizedRituals.forEach((r) => {
              if (r.id) todayRitualIds.add(r.id);
            });
          }
        }

        console.log(
          '📋 Today Ritual IDs to exclude:',
          Array.from(todayRitualIds)
        );

        // Show ALL created rituals (don't filter out those in "Today's Rituals")
        // Users should see all their created rituals in the Created tab
        const allCreatedRituals = data.createdRituals || [];
        setCreatedRituals(allCreatedRituals);

        // Store ALL joined rituals (we'll filter them in the render based on todayRituals)
        // This ensures we have the full list even if todayRituals changes
        const allJoinedRituals = data.joinedRituals || [];
        console.log(
          '👥 All Joined Rituals:',
          allJoinedRituals.map((r: RitualDefinition) => ({
            id: r.id,
            title: r.title,
            joinedByUsers: r.joinedByUsers
          }))
        );
        setJoinedRituals(allJoinedRituals);

        console.log('✅ Created Rituals:', {
          total: allCreatedRituals.length,
          ritualIds: allCreatedRituals.map((r) => r.id),
          ritualTitles: allCreatedRituals.map((r) => r.title)
        });

        // Filter out rituals that are already in today's rituals OR already joined from available rituals
        let filteredAvailable = data.availableRituals || [];
        const joinedRitualIds = new Set(
          allJoinedRituals
            .map((r: RitualDefinition) => r.id)
            .filter((id: string | undefined): id is string => Boolean(id))
        );

        filteredAvailable = filteredAvailable.filter(
          (ritual: RitualDefinition) => {
            // Exclude if in today's rituals
            if (todayRitualIds.has(ritual.id || '')) {
              return false;
            }
            // Exclude if already joined
            if (joinedRitualIds.has(ritual.id || '')) {
              return false;
            }
            return true;
          }
        );

        console.log('🔍 Filtered available rituals:', {
          total: data.availableRituals?.length || 0,
          filtered: filteredAvailable.length,
          todayRitualIds: Array.from(todayRitualIds),
          joinedRitualIds: Array.from(joinedRitualIds)
        });

        setAvailableRituals(filteredAvailable);

        // Calculate joined rituals not in today (for counts)
        const joinedRitualsNotInToday = allJoinedRituals.filter(
          (ritual: RitualDefinition) => !todayRitualIds.has(ritual.id || '')
        );

        console.log('✅ My Rituals loaded successfully', {
          totalCreated: allCreatedRituals.length,
          totalJoined: allJoinedRituals.length,
          joinedInToday:
            allJoinedRituals.length - joinedRitualsNotInToday.length,
          todayRitualIds: Array.from(todayRitualIds)
        });

        // Update parent with counts
        if (onCountsUpdate) {
          const availableCount = filteredAvailable.length;
          onCountsUpdate({
            myRituals: 0, // No longer used
            available: availableCount,
            joined: allJoinedRituals.length, // Total joined count
            created: allCreatedRituals.length // Total created count (not filtered)
          });
        }
      } else {
        console.error('❌ Failed to fetch my rituals:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching my rituals:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, todayRituals, onCountsUpdate]);

  useEffect(() => {
    void fetchMyRituals();
  }, [fetchMyRituals]);

  // Get IDs of rituals in today's rituals to avoid duplication
  const todayRitualIds = useMemo(() => {
    const ids = new Set<string>();
    if (todayRituals) {
      if (todayRituals.globalRitual?.id) {
        ids.add(todayRituals.globalRitual.id);
      }
      if (todayRituals.personalizedRituals) {
        todayRituals.personalizedRituals.forEach((r) => {
          if (r.id) ids.add(r.id);
        });
      }
    }
    return ids;
  }, [todayRituals]);

  // Note: joinedRituals is still fetched for filtering available rituals
  // but is no longer displayed here (handled by JoinedRitualsSection)

  // Apply filterType to determine what to show
  // Now only handles 'created' filter (for Created tab) or showOnlyAvailable (for Available tab)
  const displayCreatedRituals = useMemo(() => {
    if (filterType === 'created') {
      return createdRituals;
    }
    return [];
  }, [filterType, createdRituals]);

  const displayAvailableRituals = useMemo(() => {
    if (showOnlyAvailable) {
      return availableRituals;
    }
    return [];
  }, [showOnlyAvailable, availableRituals]);

  // Apply search and sort filtering
  const filteredAndSortedCreated = useMemo(
    () => filterAndSortRituals(displayCreatedRituals, searchQuery, sortBy),
    [displayCreatedRituals, searchQuery, sortBy]
  );

  const filteredAndSortedAvailable = useMemo(
    () => filterAndSortRituals(displayAvailableRituals, searchQuery, sortBy),
    [displayAvailableRituals, searchQuery, sortBy]
  );

  if (loading) {
    return (
      <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <Loading className='mt-5' />
      </div>
    );
  }

  const hasRituals = showOnlyAvailable
    ? availableRituals.length > 0
    : filterType === 'created'
    ? createdRituals.length > 0
    : false;

  // If showing only available, skip created and joined sections
  if (showOnlyAvailable) {
    return (
      <div className='space-y-3 md:space-y-4'>
        {availableRituals.length > 0 ? (
          <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4 lg:p-6'>
            <div className='mb-3 flex items-center justify-between md:mb-4'>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-blue-600 dark:text-blue-400 md:h-5 md:w-5' />
                <h3 className='text-base font-semibold text-gray-900 dark:text-white md:text-lg'>
                  Available Rituals
                </h3>
                <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                  {availableRituals.length}
                </span>
              </div>
            </div>
            <p className='mb-3 text-xs text-gray-600 dark:text-gray-400 md:mb-4 md:text-sm'>
              Discover new rituals you can join and make part of your daily
              practice.
            </p>
            <div className='space-y-2 md:space-y-3'>
              {filteredAndSortedAvailable.map((ritual) => {
                const userHasJoined =
                  ritual.joinedByUsers?.includes(user?.id || '') || false;

                return (
                  <RitualCard
                    key={ritual.id}
                    ritual={ritual}
                    isGlobal={ritual.scope === 'global'}
                    completed={false}
                    onCompleteAndShare={() => onCompleteAndShare(ritual)}
                    onShareRitual={() => onShareRitual(ritual)}
                    loading={false}
                    showJoinButton={!userHasJoined}
                    ritualScope={ritual.scope || 'personalized'}
                    onJoinSuccess={fetchMyRituals}
                    allCompletions={allCompletions}
                    onEditRitual={
                      onEditRitual ? () => onEditRitual(ritual) : undefined
                    }
                    onDeleteRitual={
                      onDeleteRitual ? () => onDeleteRitual(ritual) : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className='rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800 md:p-12'>
            <div className='mx-auto max-w-md'>
              <div className='mb-4 text-4xl md:text-6xl'>🌱</div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white md:text-xl'>
                No New Rituals Available
              </h3>
              <p className='mb-6 text-sm text-gray-600 dark:text-gray-400 md:text-base'>
                Create your own ritual or check back later for new rituals to
                join!
              </p>
              <button
                onClick={onCreateRitual}
                className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 md:px-6 md:py-3'
              >
                <Plus className='h-4 w-4 md:h-5 md:w-5' />
                Create Your First Ritual
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Don't show sections if they're filtered out
  if (filterType === 'created' && createdRituals.length === 0) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800 md:p-12'>
        <div className='mx-auto max-w-md'>
          <div className='mb-4 text-4xl md:text-6xl'>📝</div>
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white md:text-xl'>
            No Created Rituals
          </h3>
          <p className='mb-6 text-sm text-gray-600 dark:text-gray-400 md:text-base'>
            Create your first ritual to get started!
          </p>
          <button
            onClick={onCreateRitual}
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 md:px-6 md:py-3'
          >
            <Plus className='h-4 w-4 md:h-5 md:w-5' />
            Create Your First Ritual
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3 md:space-y-4 lg:space-y-6'>
      {/* Created Rituals Section - Always show when filter is 'created' */}
      {/* (Created rituals scheduled for today appear in "Today's Rituals" section above) */}
      {filterType === 'created' && (
        <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4 lg:p-6'>
          <div className='mb-3 flex items-center justify-between md:mb-4'>
            <div className='flex items-center gap-2'>
              <Plus className='h-4 w-4 text-purple-600 dark:text-purple-400 md:h-5 md:w-5' />
              <h3 className='text-base font-semibold text-gray-900 dark:text-white md:text-lg'>
                My Created Rituals
              </h3>
              {filteredAndSortedCreated.length > 0 && (
                <span className='rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
                  {filteredAndSortedCreated.length}
                </span>
              )}
            </div>
            <button
              onClick={onCreateRitual}
              className='flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 md:gap-2 md:px-4 md:py-2 md:text-sm'
            >
              <Plus className='h-3 w-3 md:h-4 md:w-4' />
              <span className='hidden sm:inline'>New Ritual</span>
            </button>
          </div>
          {filteredAndSortedCreated.length > 0 ? (
            <div className='space-y-2 md:space-y-3 lg:space-y-4'>
              {filteredAndSortedCreated.map((ritual) => (
                <RitualCard
                  key={ritual.id}
                  ritual={ritual}
                  isGlobal={false}
                  completed={false}
                  onCompleteAndShare={() => onCompleteAndShare(ritual)}
                  onShareRitual={() => onShareRitual(ritual)}
                  loading={false}
                  showJoinButton={false}
                  isOwnRitual={true}
                  onVisibilityChange={fetchMyRituals}
                  allCompletions={allCompletions}
                  onEditRitual={() => onEditRitual(ritual)}
                  onDeleteRitual={
                    onDeleteRitual ? () => onDeleteRitual(ritual) : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className='rounded-lg border-2 border-dashed border-purple-200 bg-purple-50 p-6 text-center dark:border-purple-800 dark:bg-purple-900/20 md:p-8'>
              <div className='mx-auto max-w-md'>
                <div className='mb-3 text-4xl md:mb-4 md:text-5xl'>✨</div>
                <h4 className='mb-2 text-base font-semibold text-gray-900 dark:text-white md:text-lg'>
                  Create Your Own Ritual
                </h4>
                <p className='mb-4 text-sm text-gray-600 dark:text-gray-400 md:text-base'>
                  Design a personalized ritual that reflects your values and
                  goals. Share it with others and build a community around
                  positive habits!
                </p>
                <button
                  onClick={onCreateRitual}
                  className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 md:px-6 md:py-3'
                >
                  <Plus className='h-4 w-4 md:h-5 md:w-5' />
                  Create Your First Ritual
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasRituals && (
        <div className='rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800 md:p-12'>
          <div className='mx-auto max-w-md'>
            <div className='mb-4 text-4xl md:text-6xl'>🌱</div>
            <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white md:text-xl'>
              No Rituals Yet
            </h3>
            <p className='mb-6 text-sm text-gray-600 dark:text-gray-400 md:text-base'>
              Create your first ritual or join one from today's suggestions to
              get started!
            </p>
            <button
              onClick={onCreateRitual}
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 md:px-6 md:py-3'
            >
              <Plus className='h-4 w-4 md:h-5 md:w-5' />
              Create Your First Ritual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
