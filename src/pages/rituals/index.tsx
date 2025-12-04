import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { RitualCard } from '@components/rituals/ritual-card';
import { RitualsOnboarding } from '@components/rituals/rituals-onboarding';
import { RitualCompleteModal } from '@components/rituals/ritual-complete-modal';
import { RitualSettings } from '@components/rituals/ritual-settings';
import { RitualFormModal } from '@components/rituals/ritual-form-modal';
import { RitualShareModal } from '@components/rituals/ritual-share-modal';
import { StreakVisualization } from '@components/rituals/streak-visualization';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { useModal } from '@lib/hooks/useModal';
import { toast } from 'react-hot-toast';
import { Flame, Settings, Calendar, Plus, Edit2 } from 'lucide-react';
import Link from 'next/link';
import type { RitualDefinition, TodayRituals, RitualStats, RitualCompletion } from '@lib/types/ritual';
import type { ImpactTag } from '@lib/types/impact-moment';
import type { ReactElement, ReactNode } from 'react';

export default function RitualsPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  // Redirect to login if not authenticated
  useRequireAuth('/login');
  const [todayRituals, setTodayRituals] = useState<TodayRituals | null>(null);
  const [stats, setStats] = useState<RitualStats | null>(null);
  const [completions, setCompletions] = useState<RitualCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingRitualId, setCompletingRitualId] = useState<string | null>(null);
  const { open: completeModalOpen, openModal: openCompleteModal, closeModal: closeCompleteModal } = useModal();
  const { open: settingsModalOpen, openModal: openSettingsModal, closeModal: closeSettingsModal } = useModal();
  const { open: ritualFormModalOpen, openModal: openRitualFormModal, closeModal: closeRitualFormModal } = useModal();
  const { open: shareModalOpen, openModal: openShareModal, closeModal: closeShareModal } = useModal();
  const [selectedRitual, setSelectedRitual] = useState<RitualDefinition | null>(null);
  const [editingRitual, setEditingRitual] = useState<RitualDefinition | null>(null);
  const [sharingRitual, setSharingRitual] = useState<RitualDefinition | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [ritualsEnabled, setRitualsEnabled] = useState(false);

  // Fetch today's rituals
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchTodayRituals = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/rituals/today?userId=${user.id}`);
        const data = await response.json();
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Rituals API Response:', {
            status: response.status,
            data,
            hasGlobalRitual: !!data.rituals?.globalRitual,
            personalizedCount: data.rituals?.personalizedRituals?.length || 0,
            error: data.error
          });
        }
        
        // If rituals not enabled, check if we should auto-enable
        if (data.error === 'Rituals not enabled for this user') {
          setRitualsEnabled(false);
          // Auto-enable rituals with default preferences
          try {
            const initResponse = await fetch('/api/rituals/init', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: user.id,
                preferences: {
                  selectedTags: ['mind', 'body'],
                  notifications: {
                    morning: false,
                    evening: false,
                    milestones: true
                  }
                }
              })
            });

            if (initResponse.ok) {
              setOnboardingCompleted(true);
              setRitualsEnabled(true);
              // Fetch rituals again after initialization
              const retryResponse = await fetch(`/api/rituals/today?userId=${user.id}`);
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                if (process.env.NODE_ENV === 'development') {
                  console.log('After init - Rituals:', retryData);
                }
                setTodayRituals(retryData.rituals);
              }
            } else {
              const initError = await initResponse.json();
              console.error('Failed to initialize rituals:', initError);
            }
          } catch (initError) {
            console.error('Error auto-initializing rituals:', initError);
          }
        } else {
          setRitualsEnabled(true);
          setTodayRituals(data.rituals);
        }
      } catch (error) {
        console.error('Error fetching today\'s rituals:', error);
        toast.error('Failed to load rituals');
      } finally {
        setLoading(false);
      }
    };

    void fetchTodayRituals();
  }, [user?.id]);

  // Fetch stats
  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/rituals/stats?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data.stats);
        
        // Set completions if available
        if (data.completions) {
          setCompletions(data.completions);
        }

        // Log enhanced stats for debugging (development only)
        if (process.env.NODE_ENV === 'development') {
          console.log('Enhanced Stats:', {
            currentStreak: data.stats.currentStreak,
            longestStreak: data.stats.longestStreak,
            averageCompletionsPerDay: data.stats.averageCompletionsPerDay,
            completionRate: data.stats.completionRate,
            bestDay: data.stats.bestDay,
            completionTrend: data.stats.completionTrend,
            streakMilestones: data.stats.streakMilestones?.length || 0,
            completionMilestones: data.stats.completionMilestones?.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    void fetchStats();
  }, [user?.id]);

  const handleCompleteQuietly = async (ritualId: string): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in');
      return;
    }

    try {
      setCompletingRitualId(ritualId);
      const response = await fetch('/api/rituals/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          ritualId,
          completedQuietly: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete ritual');
      }

      toast.success('Ritual completed! ✨');
      
      // Refresh data
      const todayResponse = await fetch(`/api/rituals/today?userId=${user.id}`);
      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        setTodayRituals(todayData.rituals);
      }

      const statsResponse = await fetch(`/api/rituals/stats?userId=${user.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete ritual';
      toast.error(message);
    } finally {
      setCompletingRitualId(null);
    }
  };

  const handleCompleteAndShare = (ritual: RitualDefinition): void => {
    setSelectedRitual(ritual);
    openCompleteModal();
  };

  const handleShareRitual = (ritual: RitualDefinition): void => {
    setSharingRitual(ritual);
    openShareModal();
  };

  const handleShareComplete = async (momentId?: string): Promise<void> => {
    if (!user?.id || !selectedRitual) return;

    try {
      // Complete the ritual with shared moment ID
      const response = await fetch('/api/rituals/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          ritualId: selectedRitual.id,
          completedQuietly: false,
          sharedAsMomentId: momentId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete ritual');
      }

      toast.success('Ritual completed and shared! 🌱');
      
      // Refresh data
      await Promise.all([
        fetch(`/api/rituals/today?userId=${user.id}`).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setTodayRituals(data.rituals);
          }
        }),
        fetch(`/api/rituals/stats?userId=${user.id}`).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setStats(data.stats);
            if (data.completions) {
              setCompletions(data.completions);
            }
          }
        })
      ]);
    } catch (error) {
      console.error('Error completing ritual:', error);
    }
  };

  const handleOnboardingComplete = async (preferences: {
    selectedTags: ImpactTag[];
    notifications: {
      morning: boolean;
      evening: boolean;
      milestones: boolean;
      morningTime?: string;
      eveningTime?: string;
    };
  }): Promise<void> => {
    if (!user?.id) return;

    try {
      // Initialize user ritual state with preferences
      const response = await fetch('/api/rituals/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          preferences: {
            selectedTags: preferences.selectedTags,
            notifications: preferences.notifications
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize rituals');
      }

      setOnboardingCompleted(true);
      toast.success('Welcome to Daily Rituals! 🌱');
      
      // Refresh rituals
      const todayResponse = await fetch(`/api/rituals/today?userId=${user.id}`);
      if (todayResponse.ok) {
        const data = await todayResponse.json();
        setTodayRituals(data.rituals);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to initialize rituals');
    }
  };

  // Show loading while checking auth or redirecting
  if (authLoading || !user) {
    return (
      <MainContainer>
        <MainHeader title='Daily Rituals' useMobileSidebar />
        <Loading className='mt-5' />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO 
        title='Daily Rituals - Small Actions, Big Impact / Buzzwin'
        description='Build positive habits with daily rituals. Small actions that create big impact.'
      />
      <MainHeader title='Daily Rituals' useMobileSidebar />
      
      {/* Onboarding */}
      {!onboardingCompleted && !ritualsEnabled && (
        <RitualsOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={() => {
            setOnboardingCompleted(true);
            // Auto-enable with defaults when skipped
            if (user?.id) {
              fetch('/api/rituals/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  preferences: {
                    selectedTags: ['mind', 'body'],
                    notifications: { morning: false, evening: false, milestones: true }
                  }
                })
              }).then(() => {
                setRitualsEnabled(true);
                fetch(`/api/rituals/today?userId=${user.id}`)
                  .then(res => res.json())
                  .then(data => setTodayRituals(data.rituals));
              });
            }
          }}
        />
      )}

      {/* Header with Streak */}
      <div className='border-b border-gray-200 px-4 py-4 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Daily Rituals
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
              Small actions, big impact
            </p>
          </div>
          <div className='flex items-center gap-3'>
            {stats && stats.currentStreak > 0 && (
              <div className='flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 dark:bg-orange-900/20'>
                <Flame className='h-5 w-5 text-orange-500' />
                <div>
                  <div className='text-lg font-bold text-orange-700 dark:text-orange-300'>
                    {stats.currentStreak}
                  </div>
                  <div className='text-xs text-orange-600 dark:text-orange-400'>
                    day streak
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={openSettingsModal}
              className='rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors'
              aria-label='Settings'
            >
              <Settings className='h-5 w-5' />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading className='mt-5' />
      ) : !todayRituals || (!todayRituals.globalRitual && (!todayRituals.personalizedRituals || todayRituals.personalizedRituals.length === 0)) ? (
        <div className='px-4 py-12 text-center'>
          <div className='mx-auto max-w-md'>
            <div className='mb-4 text-6xl'>🌱</div>
            <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
              No Rituals Available Yet
            </h3>
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              {!ritualsEnabled 
                ? 'Initializing your rituals...' 
                : 'We\'re setting up your daily rituals. This might take a moment.'}
            </p>
            {process.env.NODE_ENV === 'development' && todayRituals && (
              <div className='mb-4 rounded-lg bg-gray-100 p-4 text-left text-xs dark:bg-gray-800'>
                <div className='font-semibold'>Debug Info:</div>
                <div>Has Global: {todayRituals.globalRitual ? 'Yes' : 'No'}</div>
                <div>Personalized Count: {todayRituals.personalizedRituals?.length || 0}</div>
                <div>Rituals Enabled: {ritualsEnabled ? 'Yes' : 'No'}</div>
                <div>Onboarding Completed: {onboardingCompleted ? 'Yes' : 'No'}</div>
              </div>
            )}
            <button
              onClick={() => {
                if (user?.id) {
                  setLoading(true);
                  fetch(`/api/rituals/today?userId=${user.id}`)
                    .then(res => res.json())
                    .then(data => {
                      console.log('Refresh - Rituals Data:', data);
                      setTodayRituals(data.rituals);
                      setRitualsEnabled(!data.error);
                      setLoading(false);
                    })
                    .catch((err) => {
                      console.error('Refresh error:', err);
                      setLoading(false);
                    });
                }
              }}
              className='rounded-full bg-main-accent px-6 py-2 font-medium text-white transition hover:bg-main-accent/90'
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className='space-y-6 px-4 py-6'>
          {/* Today's Rituals Section */}
          <div>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Today's Rituals
              </h3>
              <button
                onClick={() => {
                  setEditingRitual(null);
                  openRitualFormModal();
                }}
                className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700'
              >
                <Plus className='h-4 w-4' />
                New Ritual
              </button>
            </div>
            <div className='space-y-4'>
              {/* Global Ritual */}
              {todayRituals.globalRitual && (
                <RitualCard
                  ritual={todayRituals.globalRitual}
                  isGlobal
                  completed={todayRituals.globalRitual.completed || false}
                  onCompleteAndShare={() => handleCompleteAndShare(todayRituals.globalRitual!)}
                  onShareRitual={() => handleShareRitual(todayRituals.globalRitual!)}
                  loading={completingRitualId === todayRituals.globalRitual.id}
                  showJoinButton={true}
                  ritualScope='global'
                />
              )}

              {/* Personalized Rituals */}
              {todayRituals.personalizedRituals.map((ritual) => {
                // Check if this is a custom ritual (has createdBy field matching current user)
                const isCustomRitual = (ritual as any).createdBy === user?.id;
                
                return (
                  <div key={ritual.id} className='relative'>
                    <RitualCard
                      ritual={ritual}
                      isGlobal={false}
                      completed={ritual.completed || false}
                      onCompleteAndShare={() => handleCompleteAndShare(ritual)}
                      onShareRitual={() => handleShareRitual(ritual)}
                      loading={completingRitualId === ritual.id}
                      showJoinButton={!isCustomRitual}
                      ritualScope={isCustomRitual ? undefined : 'personalized'}
                    />
                    {isCustomRitual && (
                      <button
                        onClick={() => {
                          setEditingRitual(ritual);
                          openRitualFormModal();
                        }}
                        className='absolute right-4 top-4 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                        aria-label='Edit ritual'
                      >
                        <Edit2 className='h-4 w-4' />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Section */}
          {stats && (
            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
                Your Progress
              </h3>
              <StreakVisualization
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
                completions={completions}
              />
              <div className='mt-6 grid grid-cols-3 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.completedThisWeek}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    This Week
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.completedThisMonth}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    This Month
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.totalCompleted}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    Total
                  </div>
                </div>
              </div>

              {/* Enhanced Stats */}
              {(stats.averageCompletionsPerDay !== undefined || stats.completionRate !== undefined || stats.bestDay) && (
                <div className='mt-6 border-t border-gray-200 pt-6 dark:border-gray-700'>
                  <h4 className='mb-3 text-sm font-semibold text-gray-900 dark:text-white'>
                    Detailed Insights
                  </h4>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    {stats.averageCompletionsPerDay !== undefined && (
                      <div>
                        <div className='text-gray-600 dark:text-gray-400'>Avg per Day</div>
                        <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                          {stats.averageCompletionsPerDay.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {stats.completionRate !== undefined && (
                      <div>
                        <div className='text-gray-600 dark:text-gray-400'>Completion Rate</div>
                        <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                          {stats.completionRate.toFixed(1)}%
                        </div>
                      </div>
                    )}
                    {stats.bestDay && (
                      <div>
                        <div className='text-gray-600 dark:text-gray-400'>Best Day</div>
                        <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                          {stats.bestDay}
                        </div>
                      </div>
                    )}
                    {stats.completionTrend && (
                      <div>
                        <div className='text-gray-600 dark:text-gray-400'>Trend</div>
                        <div className={`text-lg font-semibold ${
                          stats.completionTrend === 'increasing' ? 'text-green-600 dark:text-green-400' :
                          stats.completionTrend === 'decreasing' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {stats.completionTrend === 'increasing' ? '📈 Increasing' :
                           stats.completionTrend === 'decreasing' ? '📉 Decreasing' :
                           '➡️ Stable'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {(stats.streakMilestones && stats.streakMilestones.length > 0) || 
               (stats.completionMilestones && stats.completionMilestones.length > 0) ? (
                <div className='mt-6 border-t border-gray-200 pt-6 dark:border-gray-700'>
                  <h4 className='mb-3 text-sm font-semibold text-gray-900 dark:text-white'>
                    Milestones
                  </h4>
                  {stats.streakMilestones && stats.streakMilestones.length > 0 && (
                    <div className='mb-4'>
                      <div className='mb-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
                        Streak Milestones
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {stats.streakMilestones.map((milestone) => (
                          <div
                            key={milestone.milestone}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              milestone.achieved
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {milestone.milestone} days {milestone.achieved ? '✓' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {stats.completionMilestones && stats.completionMilestones.length > 0 && (
                    <div>
                      <div className='mb-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
                        Completion Milestones
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {stats.completionMilestones.map((milestone) => (
                          <div
                            key={milestone.milestone}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              milestone.achieved
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {milestone.milestone} completions {milestone.achieved ? '✓' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Most Active Tags */}
              {stats.mostActiveTags && stats.mostActiveTags.length > 0 && (
                <div className='mt-6 border-t border-gray-200 pt-6 dark:border-gray-700'>
                  <h4 className='mb-3 text-sm font-semibold text-gray-900 dark:text-white'>
                    Most Active Categories
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {stats.mostActiveTags.map(({ tag, count }) => (
                      <div
                        key={tag}
                        className='rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      >
                        {tag}: {count}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Section (Placeholder) */}
          <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              History
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Your ritual completion history will appear here.
            </p>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {selectedRitual && (
        <RitualCompleteModal
          ritual={selectedRitual}
          open={completeModalOpen}
          closeModal={() => {
            closeCompleteModal();
            setSelectedRitual(null);
          }}
          onComplete={handleShareComplete}
        />
      )}

      {/* Share Modal */}
      {sharingRitual && (
        <RitualShareModal
          ritual={sharingRitual}
          open={shareModalOpen}
          closeModal={() => {
            closeShareModal();
            setSharingRitual(null);
          }}
        />
      )}

      {/* Settings Modal */}
      <RitualSettings
        open={settingsModalOpen}
        closeModal={closeSettingsModal}
      />

      {/* Ritual Form Modal */}
      <RitualFormModal
        open={ritualFormModalOpen}
        closeModal={() => {
          closeRitualFormModal();
          setEditingRitual(null);
        }}
        ritual={editingRitual || undefined}
        onSuccess={async () => {
          // Refresh rituals after create/update
          if (user?.id) {
            try {
              const response = await fetch(`/api/rituals/today?userId=${user.id}`);
              if (response.ok) {
                const data = await response.json();
                setTodayRituals(data.rituals);
              }
            } catch (error) {
              console.error('Error refreshing rituals:', error);
            }
          }
        }}
      />
    </MainContainer>
  );
}

RitualsPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout redirectUrl='/login'>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);

