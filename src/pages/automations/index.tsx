import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Sparkles, Plus, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { AutomationChat } from '@components/automation/automation-chat';
import { AutomationRegistry } from '@components/automation/automation-registry';
import { MyAutomationsList } from '@components/automation/my-automations-list';
import { BounceButton } from '@components/animations/bounce-button';
import { TodayStack } from '@components/rituals/today-stack';
import { RitualsStatsBar } from '@components/rituals/rituals-stats-bar';
import { MyRitualsSection } from '@components/rituals/my-rituals-section';
import { JoinedRitualsSection } from '@components/rituals/joined-rituals-section';
import { RitualFormModal } from '@components/rituals/ritual-form-modal';
import { RitualCompleteModal } from '@components/rituals/ritual-complete-modal';
import { ProgressBars } from '@components/rituals/progress-bars';
import { Achievements } from '@components/rituals/achievements';
import { Leaderboard } from '@components/rituals/leaderboard';
import { useModal } from '@lib/hooks/useModal';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import type { Automation } from '@lib/types/automation';
import type { SortOption } from '@components/rituals/rituals-sort';
import type { RitualDefinition, TodayRituals, RitualStats, RitualCompletion, Achievement, LeaderboardEntry } from '@lib/types/ritual';
import type { ReactElement, ReactNode } from 'react';

export default function AutomationsPage(): JSX.Element {
  useRequireAuth('/login');
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'registry' | 'my-automations' | 'rituals'>('create');
  const [ritualView, setRitualView] = useState<'today' | 'all' | 'create' | 'progress' | 'achievements' | 'leaderboard'>('today');
  
  // Ritual state
  const [todayRituals, setTodayRituals] = useState<TodayRituals | null>(null);
  const [stats, setStats] = useState<RitualStats | null>(null);
  const [completions, setCompletions] = useState<RitualCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedRitual, setSelectedRitual] = useState<RitualDefinition | null>(null);
  const [editingRitual, setEditingRitual] = useState<RitualDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [filterType, setFilterType] = useState<'joined' | 'available' | 'created'>('joined');
  
  // Modals
  const { open: completeModalOpen, openModal: openCompleteModal, closeModal: closeCompleteModal } = useModal();
  const { open: ritualFormModalOpen, openModal: openRitualFormModal, closeModal: closeRitualFormModal } = useModal();

  // Handle query params for tab and view
  useEffect(() => {
    if (!router.isReady) return;
    const { tab, view, filter } = router.query;
    if (tab === 'rituals') {
      if (activeTab !== 'rituals') {
        setActiveTab('rituals');
      }
      if (view === 'progress' || view === 'achievements' || view === 'leaderboard' || view === 'all' || view === 'create') {
        if (ritualView !== view) {
          setRitualView(view as typeof ritualView);
        }
      }
      if (filter === 'joined' || filter === 'available' || filter === 'created') {
        if (filterType !== filter) {
          setFilterType(filter);
        }
      }
    } else if (tab === 'create' || tab === 'registry' || tab === 'my-automations') {
      if (activeTab !== tab) {
        setActiveTab(tab as typeof activeTab);
      }
    }
  }, [router.isReady, router.query, activeTab, ritualView, filterType]);

  // Update URL when tabs/views change (only if not already set from query params)
  useEffect(() => {
    if (!router.isReady) return;
    const { tab, view, filter } = router.query;
    const currentTab = tab as string;
    const currentView = view as string;
    const currentFilter = filter as string;

    if (activeTab === 'rituals') {
      const params = new URLSearchParams();
      params.set('tab', 'rituals');
      if (ritualView !== 'today') {
        params.set('view', ritualView);
      }
      if (ritualView === 'all' && filterType !== 'joined') {
        params.set('filter', filterType);
      }
      const newUrl = `/automations?${params.toString()}`;
      // Only update if URL doesn't match current state
      if (
        router.asPath !== newUrl &&
        (currentTab !== 'rituals' ||
          (ritualView !== 'today' && currentView !== ritualView) ||
          (ritualView === 'all' && filterType !== 'joined' && currentFilter !== filterType))
      ) {
        void router.replace(newUrl, undefined, { shallow: true });
      }
    } else if (activeTab !== currentTab) {
      const params = new URLSearchParams();
      params.set('tab', activeTab);
      const newUrl = `/automations?${params.toString()}`;
      if (router.asPath !== newUrl) {
        void router.replace(newUrl, undefined, { shallow: true });
      }
    }
  }, [activeTab, ritualView, filterType, router]);

  const handleAutomationCreated = (automation: Automation): void => {
    // Switch to My Automations tab to show the newly created automation
    setActiveTab('my-automations');
  };

  // Fetch today's rituals
  const fetchTodayRituals = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/rituals/today?userId=${user.id}`);
      const data = await response.json();
      if (data.rituals) {
        setTodayRituals(data.rituals);
      }
    } catch (error) {
      console.error('Error fetching today rituals:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch ritual stats
  const fetchStats = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/rituals/stats?userId=${user.id}`);
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user?.id]);

  // Fetch achievements
  const fetchAchievements = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/rituals/achievements?userId=${user.id}`);
      const data = await response.json();
      if (data.achievements) {
        setAchievements(data.achievements);
        setUnlockedAchievementIds(data.unlockedAchievementIds || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [user?.id]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/rituals/leaderboard?limit=10');
      const data = await response.json();
      if (data.leaderboard) {
        setLeaderboardEntries(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, []);

  // Load data when rituals tab is active
  useEffect(() => {
    if (activeTab === 'rituals' && user?.id) {
      void fetchTodayRituals();
      void fetchStats();
      if (ritualView === 'achievements') {
        void fetchAchievements();
      }
      if (ritualView === 'leaderboard') {
        void fetchLeaderboard();
      }
    }
  }, [activeTab, ritualView, user?.id, fetchTodayRituals, fetchStats, fetchAchievements, fetchLeaderboard]);

  // Ritual handlers
  const handleRitualComplete = async (ritual: RitualDefinition): Promise<void> => {
    setSelectedRitual(ritual);
    openCompleteModal();
  };

  const handleCompleteModalClose = (): void => {
    closeCompleteModal();
    setSelectedRitual(null);
    void fetchTodayRituals();
    void fetchStats();
  };

  const handleRitualCompleted = (): void => {
    setSelectedRitual(null);
    void fetchTodayRituals();
    void fetchStats();
  };

  const handleCreateRitual = (): void => {
    setEditingRitual(null);
    openRitualFormModal();
  };

  const handleEditRitual = (ritual: RitualDefinition): void => {
    setEditingRitual(ritual);
    openRitualFormModal();
  };

  const handleRitualFormSuccess = (): void => {
    closeRitualFormModal();
    setEditingRitual(null);
    void fetchTodayRituals();
  };

  // Get today's rituals for TodayStack
  const todayRitualsForStack: RitualDefinition[] = [];
  if (todayRituals) {
    if (todayRituals.globalRitual) {
      todayRitualsForStack.push(todayRituals.globalRitual);
    }
    if (todayRituals.personalizedRituals) {
      todayRitualsForStack.push(...todayRituals.personalizedRituals);
    }
  }

  // Calculate stats for stats bar
  const todayDate = new Date().toISOString().split('T')[0];
  const dailyCompleted = completions.filter(completion => completion.date === todayDate).length;
  const dailyGoal = 1;
  const weeklyGoal = 7;
  const weeklyCompleted = stats?.completedThisWeek ?? 0;
  const dailyProgress = Math.min(100, (dailyCompleted / dailyGoal) * 100);
  const weeklyProgress = Math.min(100, (weeklyCompleted / weeklyGoal) * 100);
  const userKarma = user?.karmaPoints ?? 0;
  const totalRitualsCount = todayRitualsForStack.length;

  return (
    <MainContainer>
      <SEO
        title='Automations – Plan, Simulate, Execute / Buzzwin'
        description='Desire → Plan with AI. Expectation → Simulate and prepare. Belief → Execute and adapt. Your AI co-pilot for clear goals and lasting change.'
      />
      <MainHeader title='Automations' useMobileSidebar />

      {/* Playful intro */}
      <div className='mb-6 rounded-[28px] border-2 border-amber-100 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 md:p-6'>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300'>
            Ritual Playground
          </span>
          <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
            Desire → Plan · Expectation → Simulate · Belief → Execute
          </span>
        </div>
        <h2 className='mt-4 text-2xl font-extrabold text-gray-900 dark:text-white md:text-3xl'>
          Make rituals feel light, automatic, and fun.
        </h2>
        <p className='mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-base'>
          Your agent suggests small wins, adapts to your day, and nudges only when it helps.
        </p>
      </div>

      {/* Tabs */}
      <div className='mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto'>
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
            activeTab === 'create'
              ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
          )}
        >
          <div className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            <span>Plan with AI</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('registry')}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
            activeTab === 'registry'
              ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
          )}
        >
          <div className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4' />
            <span>Simulate and prepare</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('my-automations')}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
            activeTab === 'my-automations'
              ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
          )}
        >
          <div className='flex items-center gap-2'>
            <Sparkles className='h-4 w-4' />
            <span>Execute and adapt</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('rituals')}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
            activeTab === 'rituals'
              ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
          )}
        >
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <span>Rituals</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className='space-y-6'>
        {activeTab === 'create' && (
          <div>
            <div className='mb-4'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Plan with AI
              </h2>
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                Clarify your desire. Refine goals into clear plans, break dreams into actionable steps, and set timelines and milestones.
              </p>
            </div>
            <AutomationChat onAutomationCreated={handleAutomationCreated} />
          </div>
        )}

        {activeTab === 'registry' && (
          <AutomationRegistry />
        )}

        {activeTab === 'my-automations' && (
          <div>
            <div className='mb-4'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Execute and adapt
              </h2>
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                Build belief through action. Track progress, get reminders, and adjust plans when obstacles appear.
              </p>
            </div>
            <MyAutomationsList />
          </div>
        )}

        {activeTab === 'rituals' && (
          <div className='space-y-6'>
            {/* Stats Bar */}
            <RitualsStatsBar
              dailyProgress={dailyProgress}
              weeklyProgress={weeklyProgress}
              karmaPoints={userKarma}
              ritualsCount={totalRitualsCount}
              onNavigateToTab={(tab) => {
                if (tab === 'progress') setRitualView('progress');
                else if (tab === 'achievements') setRitualView('achievements');
                else if (tab === 'leaderboard') setRitualView('leaderboard');
                else if (tab === 'joined' || tab === 'available' || tab === 'created') {
                  setRitualView('all');
                  setFilterType(tab);
                }
              }}
            />

            {/* View Navigation */}
            <div className='flex gap-2 border-b border-gray-200 dark:border-gray-700'>
              <button
                onClick={() => setRitualView('today')}
                className={cn(
                  'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  ritualView === 'today'
                    ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setRitualView('all');
                  setFilterType('joined');
                }}
                className={cn(
                  'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  ritualView === 'all'
                    ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                All Rituals
              </button>
              <button
                onClick={() => setRitualView('progress')}
                className={cn(
                  'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  ritualView === 'progress'
                    ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                Progress
              </button>
              <button
                onClick={() => setRitualView('achievements')}
                className={cn(
                  'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  ritualView === 'achievements'
                    ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                Achievements
              </button>
            </div>

            {/* Ritual Content */}
            {ritualView === 'today' && (
              <div className='space-y-4'>
                {loading ? (
                  <div className='text-center py-8 text-gray-600 dark:text-gray-400'>Loading...</div>
                ) : todayRitualsForStack.length > 0 ? (
                  <TodayStack
                    rituals={todayRitualsForStack}
                    onComplete={handleRitualComplete}
                    onViewAll={() => {
                      setRitualView('all');
                      setFilterType('joined');
                    }}
                  />
                ) : (
                  <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50'>
                    <Sparkles className='mx-auto mb-3 h-8 w-8 text-gray-400' />
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      No rituals for today
                    </p>
                    <p className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
                      Your day is open for new intentions
                    </p>
                    <BounceButton
                      variant='primary'
                      onClick={handleCreateRitual}
                      className='mt-4'
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Create Your First Ritual
                    </BounceButton>
                  </div>
                )}
              </div>
            )}

            {ritualView === 'all' && (
              <div className='space-y-4'>
                {/* Filter buttons */}
                <div className='flex gap-2'>
                  <button
                    onClick={() => setFilterType('joined')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      filterType === 'joined'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    Joined
                  </button>
                  <button
                    onClick={() => setFilterType('available')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      filterType === 'available'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setFilterType('created')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      filterType === 'created'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    Created
                  </button>
                </div>

                {filterType === 'joined' ? (
                  <JoinedRitualsSection
                    onCompleteAndShare={handleRitualComplete}
                    onShareRitual={(ritual) => {
                      // Handle share
                      toast.success('Share functionality coming soon');
                    }}
                    todayRituals={todayRituals}
                    onRefetch={fetchTodayRituals}
                    searchQuery={searchQuery}
                    sortBy={sortBy}
                    allCompletions={completions}
                    onEditRitual={handleEditRitual}
                  />
                ) : (
                  <MyRitualsSection
                    onCreateRitual={handleCreateRitual}
                    onEditRitual={handleEditRitual}
                    onCompleteAndShare={handleRitualComplete}
                    onShareRitual={(ritual) => {
                      toast.success('Share functionality coming soon');
                    }}
                    todayRituals={todayRituals}
                    onRefetch={fetchTodayRituals}
                    showOnlyAvailable={filterType === 'available'}
                    filterType={filterType === 'created' ? 'created' : undefined}
                    searchQuery={searchQuery}
                    sortBy={sortBy}
                    allCompletions={completions}
                  />
                )}
              </div>
            )}

            {ritualView === 'progress' && stats && (
              <div className='space-y-6'>
                <ProgressBars
                  dailyCompleted={dailyCompleted}
                  dailyGoal={dailyGoal}
                  weeklyCompleted={weeklyCompleted}
                  weeklyGoal={weeklyGoal}
                />
              </div>
            )}

            {ritualView === 'achievements' && (
              <div className='space-y-6'>
                <Achievements
                  achievements={achievements}
                  unlockedAchievementIds={unlockedAchievementIds}
                  userKarma={userKarma}
                  userStreak={stats?.currentStreak ?? 0}
                  userCompletions={stats?.totalCompleted ?? 0}
                />
              </div>
            )}

            {ritualView === 'leaderboard' && (
              <div className='space-y-6'>
                <Leaderboard entries={leaderboardEntries} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRitual && (
        <RitualCompleteModal
          open={completeModalOpen}
          closeModal={handleCompleteModalClose}
          ritual={selectedRitual}
          onComplete={handleRitualCompleted}
        />
      )}

      {ritualFormModalOpen && (
        <RitualFormModal
          open={ritualFormModalOpen}
          closeModal={() => {
            closeRitualFormModal();
            setEditingRitual(null);
          }}
          onSuccess={handleRitualFormSuccess}
          ritual={editingRitual || undefined}
        />
      )}
    </MainContainer>
  );
}

AutomationsPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout redirectUrl='/login'>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);
