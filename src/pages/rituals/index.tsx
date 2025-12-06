import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { RitualCard } from '@components/rituals/ritual-card';
import { RitualCompleteModal } from '@components/rituals/ritual-complete-modal';
import { RitualSettings } from '@components/rituals/ritual-settings';
import { RitualFormModal } from '@components/rituals/ritual-form-modal';
import { RitualShareModal } from '@components/rituals/ritual-share-modal';
import { StreakVisualization } from '@components/rituals/streak-visualization';
import { MyRitualsSection } from '@components/rituals/my-rituals-section';
import { KarmaLevelSystem } from '@components/rituals/karma-level-system';
import { ProgressBars } from '@components/rituals/progress-bars';
import { Achievements } from '@components/rituals/achievements';
import { Leaderboard } from '@components/rituals/leaderboard';
import { InviteModal } from '@components/rituals/invite-modal';
import { NotificationCenter } from '@components/rituals/notification-center';
import { RitualsStatsBar, type RitualTab } from '@components/rituals/rituals-stats-bar';
import { RitualsTabs } from '@components/rituals/rituals-tabs';
import { JoinedRitualsSection } from '@components/rituals/joined-rituals-section';
import { RitualsSearch } from '@components/rituals/rituals-search';
import { RitualsSort, type SortOption } from '@components/rituals/rituals-sort';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { useModal } from '@lib/hooks/useModal';
import { useBrowserNotifications } from '@lib/hooks/useBrowserNotifications';
import { toast } from 'react-hot-toast';
import { Flame, Settings, Calendar, Plus, Edit2 } from 'lucide-react';
import Link from 'next/link';
import type { RitualDefinition, TodayRituals, RitualStats, RitualCompletion, Achievement, LeaderboardEntry } from '@lib/types/ritual';
import type { ImpactTag } from '@lib/types/impact-moment';
import type { ReactElement, ReactNode } from 'react';
import { getKarmaPoints } from '@lib/types/karma';

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
  const [userKarma, setUserKarma] = useState(0);
  const [previousKarma, setPreviousKarma] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [invitingRitual, setInvitingRitual] = useState<RitualDefinition | null>(null);
  const { open: inviteModalOpen, openModal: openInviteModal, closeModal: closeInviteModal } = useModal();
  const { requestPermission: requestNotificationPermission } = useBrowserNotifications();
  const [activeTab, setActiveTab] = useState<RitualTab>('joined');
  const [joinedRitualsCount, setJoinedRitualsCount] = useState(0);
  const [availableRitualsCount, setAvailableRitualsCount] = useState(0);
  const [createdRitualsCount, setCreatedRitualsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  // Function to fetch today's rituals (can be called from callbacks)
  const fetchTodayRituals = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/rituals/today?userId=${user.id}`);
      const data = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('Rituals API Response:', data);
      }

      if (!data.rituals || (!data.rituals.globalRitual && (!data.rituals.personalizedRituals || data.rituals.personalizedRituals.length === 0))) {
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
  }, [user?.id]);

  // Fetch today's rituals on mount
  useEffect(() => {
    void fetchTodayRituals();
  }, [user?.id]);

  // Fetch user karma
  useEffect(() => {
    if (!user?.id) return;

    const fetchKarma = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/karma/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setPreviousKarma(userKarma);
          setUserKarma(data.karmaPoints || 0);
        }
      } catch (error) {
        console.error('Error fetching karma:', error);
      }
    };

    void fetchKarma();
  }, [user?.id]);

  // Fetch achievements
  useEffect(() => {
    if (!user?.id) return;

    const fetchAchievements = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/rituals/achievements?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements || []);
          setUnlockedAchievementIds(data.unlockedIds || []);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };

    void fetchAchievements();
  }, [user?.id, userKarma, stats?.currentStreak, stats?.totalCompleted]);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async (): Promise<void> => {
      try {
        const response = await fetch('/api/rituals/leaderboard?limit=10');
        if (response.ok) {
          const data = await response.json();
          setLeaderboardEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    void fetchLeaderboard();
  }, []);

  // Register service worker for notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

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

  // Calculate stats for stats bar
  const dailyProgress = stats ? Math.min(100, ((stats.completedThisWeek > 0 ? 1 : 0) / 1) * 100) : 0;
  const weeklyProgress = stats ? Math.min(100, (stats.completedThisWeek / 5) * 100) : 0;
  const totalRitualsCount = joinedRitualsCount + availableRitualsCount + createdRitualsCount;

  // Calculate tab counts
  const tabCounts = {
    'joined': joinedRitualsCount,
    'available': availableRitualsCount,
    'created': createdRitualsCount,
    'progress': undefined,
    'achievements': achievements.filter(a => unlockedAchievementIds.includes(a.id)).length,
    'leaderboard': undefined
  };

  return (
    <MainContainer>
      <SEO 
        title='Daily Rituals - Small Actions, Big Impact / Buzzwin'
        description='Build positive habits with daily rituals. Small actions that create big impact.'
      />
      <MainHeader title='Daily Rituals' useMobileSidebar />
      
      {/* Compact Stats Bar */}
      <RitualsStatsBar
        dailyProgress={dailyProgress}
        weeklyProgress={weeklyProgress}
        karmaPoints={userKarma}
        ritualsCount={totalRitualsCount}
        onNavigateToTab={setActiveTab}
      />

      {/* Tabs */}
      <RitualsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
      />

      {loading ? (
        <Loading className='mt-5' />
      ) : (
        <div className='space-y-6 px-4 py-6'>
          {/* Tab Content */}
          {activeTab === 'joined' && (
            <div className='space-y-3 md:space-y-4'>
              {/* Search and Sort Controls */}
              <div className='space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4'>
                <RitualsSearch
                  onSearchChange={setSearchQuery}
                  placeholder='Search joined rituals by name, description, or tags...'
                />
                <RitualsSort activeSort={sortBy} onSortChange={setSortBy} />
              </div>

              <JoinedRitualsSection
                onCompleteAndShare={handleCompleteAndShare}
                onShareRitual={handleShareRitual}
                completingRitualId={completingRitualId}
                todayRituals={todayRituals}
                onRefetch={() => {
                  void fetchTodayRituals();
                }}
                searchQuery={searchQuery}
                sortBy={sortBy}
                onCountsUpdate={setJoinedRitualsCount}
              />
            </div>
          )}

          {activeTab === 'created' && (
            <div className='space-y-3 md:space-y-4'>
              {/* Search and Sort Controls */}
              <div className='space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4'>
                <RitualsSearch
                  onSearchChange={setSearchQuery}
                  placeholder='Search created rituals by name, description, or tags...'
                />
                <RitualsSort activeSort={sortBy} onSortChange={setSortBy} />
              </div>

              <MyRitualsSection
                onCreateRitual={() => {
                  setEditingRitual(null);
                  openRitualFormModal();
                }}
                onEditRitual={(ritual) => {
                  setEditingRitual(ritual);
                  openRitualFormModal();
                }}
                onCompleteAndShare={handleCompleteAndShare}
                onShareRitual={handleShareRitual}
                completingRitualId={completingRitualId}
                todayRituals={todayRituals}
                onRefetch={() => {
                  void fetchTodayRituals();
                }}
                onCountsUpdate={(counts) => {
                  setAvailableRitualsCount(counts.available);
                  setJoinedRitualsCount(counts.joined);
                  setCreatedRitualsCount(counts.created);
                }}
                filterType='created'
                searchQuery={searchQuery}
                sortBy={sortBy}
              />
            </div>
          )}

          {activeTab === 'available' && (
            <div className='space-y-3 md:space-y-4'>
              {/* Search and Sort Controls */}
              <div className='space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4'>
                <RitualsSearch
                  onSearchChange={setSearchQuery}
                  placeholder='Search available rituals...'
                />
                <RitualsSort activeSort={sortBy} onSortChange={setSortBy} />
              </div>
              <MyRitualsSection
                onCreateRitual={() => {
                  setEditingRitual(null);
                  openRitualFormModal();
                }}
                onEditRitual={(ritual) => {
                  setEditingRitual(ritual);
                  openRitualFormModal();
                }}
                onCompleteAndShare={handleCompleteAndShare}
                onShareRitual={handleShareRitual}
                completingRitualId={completingRitualId}
                todayRituals={todayRituals}
                showOnlyAvailable={true}
                onRefetch={() => {
                  void fetchTodayRituals();
                }}
                onCountsUpdate={(counts) => {
                  setAvailableRitualsCount(counts.available);
                  setJoinedRitualsCount(counts.joined);
                  setCreatedRitualsCount(counts.created);
                }}
                searchQuery={searchQuery}
                sortBy={sortBy}
              />
            </div>
          )}

          {activeTab === 'progress' && stats && (
            <div className='space-y-3 md:space-y-4'>
              {/* Progress Bars */}
              <div className='grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2'>
                <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4'>
                  <ProgressBars
                    dailyCompleted={stats.completedThisWeek > 0 ? 1 : 0}
                    dailyGoal={1}
                    weeklyCompleted={stats.completedThisWeek}
                    weeklyGoal={5}
                  />
                </div>
                {stats.currentStreak > 0 && (
                  <div className='flex items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 p-4 dark:border-gray-700 dark:from-orange-900/20 dark:to-red-900/20 md:p-6'>
                    <div className='text-center'>
                      <Flame className='mx-auto mb-2 h-6 w-6 text-orange-500 md:h-8 md:w-8' />
                      <div className='text-2xl font-bold text-orange-700 dark:text-orange-300 md:text-3xl'>
                        {stats.currentStreak}
                      </div>
                      <div className='text-xs text-orange-600 dark:text-orange-400 md:text-sm'>
                        day streak! Keep it going! 🔥
                      </div>
                    </div>
                  </div>
                )}
              </div>

                  <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4 lg:p-6'>
                <h3 className='mb-3 text-base font-semibold text-gray-900 dark:text-white md:mb-4 md:text-lg'>
                  Your Progress
                </h3>
                <StreakVisualization
                  currentStreak={stats.currentStreak}
                  longestStreak={stats.longestStreak}
                  completions={completions}
                />
                <div className='mt-4 grid grid-cols-3 gap-2 md:mt-6 md:gap-4'>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-gray-900 dark:text-white md:text-2xl'>
                      {stats.completedThisWeek}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      This Week
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-gray-900 dark:text-white md:text-2xl'>
                      {stats.completedThisMonth}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      This Month
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-gray-900 dark:text-white md:text-2xl'>
                      {stats.totalCompleted}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Total
                    </div>
                  </div>
                </div>

                {/* Enhanced Stats */}
                {(stats.averageCompletionsPerDay !== undefined || stats.completionRate !== undefined || stats.bestDay) && (
                  <div className='mt-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:mt-6 md:pt-6'>
                    <h4 className='mb-2 text-xs font-semibold text-gray-900 dark:text-white md:mb-3 md:text-sm'>
                      Detailed Insights
                    </h4>
                    <div className='grid grid-cols-2 gap-2 text-xs md:gap-4 md:text-sm'>
                      {stats.averageCompletionsPerDay !== undefined && (
                        <div>
                          <div className='text-gray-600 dark:text-gray-400'>Avg per Day</div>
                          <div className='text-base font-semibold text-gray-900 dark:text-white md:text-lg'>
                            {stats.averageCompletionsPerDay.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {stats.completionRate !== undefined && (
                        <div>
                          <div className='text-gray-600 dark:text-gray-400'>Completion Rate</div>
                          <div className='text-base font-semibold text-gray-900 dark:text-white md:text-lg'>
                            {stats.completionRate.toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {stats.bestDay && (
                        <div>
                          <div className='text-gray-600 dark:text-gray-400'>Best Day</div>
                          <div className='text-base font-semibold text-gray-900 dark:text-white md:text-lg'>
                            {stats.bestDay}
                          </div>
                        </div>
                      )}
                      {stats.completionTrend && (
                        <div>
                          <div className='text-gray-600 dark:text-gray-400'>Trend</div>
                          <div className={`text-base font-semibold md:text-lg ${
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
                  <div className='mt-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:mt-6 md:pt-6'>
                    <h4 className='mb-2 text-xs font-semibold text-gray-900 dark:text-white md:mb-3 md:text-sm'>
                      Milestones
                    </h4>
                    {stats.streakMilestones && stats.streakMilestones.length > 0 && (
                      <div className='mb-3 md:mb-4'>
                        <div className='mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 md:mb-2'>
                          Streak Milestones
                        </div>
                        <div className='flex flex-wrap gap-1.5 md:gap-2'>
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
                        <div className='mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 md:mb-2'>
                          Completion Milestones
                        </div>
                        <div className='flex flex-wrap gap-1.5 md:gap-2'>
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
                  <div className='mt-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:mt-6 md:pt-6'>
                    <h4 className='mb-2 text-xs font-semibold text-gray-900 dark:text-white md:mb-3 md:text-sm'>
                      Most Active Categories
                    </h4>
                    <div className='flex flex-wrap gap-1.5 md:gap-2'>
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
            </div>
          )}

          {activeTab === 'achievements' && user?.id && (
            <div className='space-y-3 md:space-y-4'>
              <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4 lg:p-6'>
                <Achievements
                  achievements={achievements}
                  unlockedAchievementIds={unlockedAchievementIds}
                  userKarma={userKarma}
                  userStreak={stats?.currentStreak || 0}
                  userCompletions={stats?.totalCompleted || 0}
                />
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && leaderboardEntries.length > 0 && (
            <div className='space-y-3 md:space-y-4'>
              <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:p-4 lg:p-6'>
                <Leaderboard
                  entries={leaderboardEntries}
                  currentUserId={user?.id}
                />
              </div>
            </div>
          )}
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

      {/* Invite Modal */}
      {invitingRitual && (
        <InviteModal
          ritual={invitingRitual}
          open={inviteModalOpen}
          onClose={() => {
            closeInviteModal();
            setInvitingRitual(null);
          }}
        />
      )}
    </MainContainer>
  );
}

RitualsPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout redirectUrl='/login'>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);

