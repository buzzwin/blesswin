import { cn } from '@lib/utils';
import type { RitualTab } from './rituals-stats-bar';

interface RitualsTabsProps {
  activeTab: RitualTab;
  onTabChange: (tab: RitualTab) => void;
  tabCounts?: {
    'joined'?: number;
    'available'?: number;
    'created'?: number;
    'progress'?: number;
    'achievements'?: number;
    'leaderboard'?: number;
  };
  className?: string;
}

const tabLabels: Record<RitualTab, string> = {
  'joined': 'Joined',
  'available': 'Available',
  'created': 'Created',
  'progress': 'Progress',
  'achievements': 'Achievements',
  'leaderboard': 'Leaderboard'
};

export function RitualsTabs({
  activeTab,
  onTabChange,
  tabCounts,
  className
}: RitualsTabsProps): JSX.Element {
  const tabs: RitualTab[] = ['joined', 'available', 'created', 'progress', 'achievements', 'leaderboard'];

  return (
    <div
      className={cn(
        'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        'overflow-x-auto',
        className
      )}
    >
      <div className='mx-auto flex max-w-6xl items-center gap-2 px-2 py-2 md:gap-4 md:px-4'>
        {tabs.map((tab) => {
          const count = tabCounts?.[tab];
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                'whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition-colors',
                'border-b-2',
                isActive
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
                'flex items-center gap-1.5'
              )}
            >
              <span>{tabLabels[tab]}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs',
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

