import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { RitualCard } from './ritual-card';
import { Loading } from '@components/ui/loading';
import { Plus, Edit2, Users, Sparkles } from 'lucide-react';
import type { RitualDefinition } from '@lib/types/ritual';

interface MyRitualsSectionProps {
  onCreateRitual: () => void;
  onEditRitual: (ritual: RitualDefinition) => void;
  onCompleteAndShare: (ritual: RitualDefinition) => void;
  onShareRitual: (ritual: RitualDefinition) => void;
  completingRitualId?: string | null;
  todayRituals?: {
    globalRitual?: RitualDefinition | null;
    personalizedRituals?: RitualDefinition[];
  } | null;
  onRefetch?: () => void; // Expose refetch function to parent
}

export function MyRitualsSection({
  onCreateRitual,
  onEditRitual,
  onCompleteAndShare,
  onShareRitual,
  completingRitualId,
  todayRituals,
  onRefetch
}: MyRitualsSectionProps): JSX.Element {
  const { user } = useAuth();
  const [createdRituals, setCreatedRituals] = useState<RitualDefinition[]>([]);
  const [joinedRituals, setJoinedRituals] = useState<RitualDefinition[]>([]);
  const [availableRituals, setAvailableRituals] = useState<RitualDefinition[]>([]);
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
      
      const data = await response.json();
      console.log('📦 My Rituals Data:', {
        createdCount: data.createdRituals?.length || 0,
        joinedCount: data.joinedRituals?.length || 0,
        availableCount: data.availableRituals?.length || 0,
        createdRituals: data.createdRituals,
        joinedRituals: data.joinedRituals,
        availableRituals: data.availableRituals,
        error: data.error
      });

      if (response.ok) {
        setCreatedRituals(data.createdRituals || []);
        setJoinedRituals(data.joinedRituals || []);
        
        // Filter out rituals that are already in today's rituals
        let filteredAvailable = data.availableRituals || [];
        if (todayRituals) {
          const todayRitualIds = new Set<string>();
          if (todayRituals.globalRitual?.id) {
            todayRitualIds.add(todayRituals.globalRitual.id);
          }
          if (todayRituals.personalizedRituals) {
            todayRituals.personalizedRituals.forEach(r => {
              if (r.id) todayRitualIds.add(r.id);
            });
          }
          
          filteredAvailable = filteredAvailable.filter(
            ritual => !todayRitualIds.has(ritual.id || '')
          );
          
          console.log('🔍 Filtered available rituals:', {
            total: data.availableRituals?.length || 0,
            filtered: filteredAvailable.length,
            todayRitualIds: Array.from(todayRitualIds)
          });
        }
        
        setAvailableRituals(filteredAvailable);
        console.log('✅ My Rituals loaded successfully');
      } else {
        console.error('❌ Failed to fetch my rituals:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching my rituals:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, todayRituals]);

  useEffect(() => {
    void fetchMyRituals();
  }, [fetchMyRituals]);

  if (loading) {
    return (
      <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <Loading className='mt-5' />
      </div>
    );
  }

  const hasRituals = createdRituals.length > 0 || joinedRituals.length > 0 || availableRituals.length > 0;

  return (
    <div className='space-y-6'>
      {/* Created Rituals Section */}
      {createdRituals.length > 0 && (
        <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Plus className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                My Created Rituals
              </h3>
              <span className='rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
                {createdRituals.length}
              </span>
            </div>
            <button
              onClick={onCreateRitual}
              className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700'
            >
              <Plus className='h-4 w-4' />
              New Ritual
            </button>
          </div>
          <div className='space-y-4'>
            {createdRituals.map((ritual) => (
              <div key={ritual.id} className='relative'>
                <RitualCard
                  ritual={ritual}
                  isGlobal={false}
                  completed={false}
                  onCompleteAndShare={() => onCompleteAndShare(ritual)}
                  onShareRitual={() => onShareRitual(ritual)}
                  loading={completingRitualId === ritual.id}
                  showJoinButton={false}
                />
                <button
                  onClick={() => onEditRitual(ritual)}
                  className='absolute right-4 top-4 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                  aria-label='Edit ritual'
                >
                  <Edit2 className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Joined Rituals Section */}
      {joinedRituals.length > 0 && (
        <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-green-600 dark:text-green-400' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Rituals I've Joined
              </h3>
              <span className='rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                {joinedRituals.length}
              </span>
            </div>
          </div>
          <div className='space-y-4'>
            {joinedRituals.map((ritual) => (
              <RitualCard
                key={ritual.id}
                ritual={ritual}
                isGlobal={ritual.scope === 'global'}
                completed={false}
                onCompleteAndShare={() => onCompleteAndShare(ritual)}
                onShareRitual={() => onShareRitual(ritual)}
                loading={completingRitualId === ritual.id}
                showJoinButton={false}
                ritualScope={ritual.scope}
                onLeaveSuccess={fetchMyRituals}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Rituals Section */}
      {availableRituals.length > 0 && (
        <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Available Rituals
              </h3>
              <span className='rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                {availableRituals.length}
              </span>
            </div>
          </div>
          <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
            Discover new rituals you can join and make part of your daily practice.
          </p>
          <div className='space-y-4'>
            {availableRituals.map((ritual) => {
              // Check if user has already joined this ritual
              const userHasJoined = ritual.joinedByUsers?.includes(user?.id || '') || false;
              
              return (
                <RitualCard
                  key={ritual.id}
                  ritual={ritual}
                  isGlobal={ritual.scope === 'global'}
                  completed={false}
                  onCompleteAndShare={() => onCompleteAndShare(ritual)}
                  onShareRitual={() => onShareRitual(ritual)}
                  loading={completingRitualId === ritual.id}
                  showJoinButton={!userHasJoined}
                  ritualScope={ritual.scope || 'personalized'}
                  onJoinSuccess={fetchMyRituals}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasRituals && (
        <div className='rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800'>
          <div className='mx-auto max-w-md'>
            <div className='mb-4 text-6xl'>🌱</div>
            <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
              No Rituals Yet
            </h3>
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              Create your first ritual or join one from today's suggestions to get started!
            </p>
            <button
              onClick={onCreateRitual}
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700'
            >
              <Plus className='h-5 w-5' />
              Create Your First Ritual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

