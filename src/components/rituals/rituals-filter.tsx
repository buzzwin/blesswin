import { cn } from '@lib/utils';
import { Calendar, Users, Plus, Grid3x3 } from 'lucide-react';

export type RitualFilterType = 'todays' | 'joined' | 'created';

interface RitualsFilterProps {
  activeFilter: RitualFilterType;
  onFilterChange: (filter: RitualFilterType) => void;
  className?: string;
  counts?: {
    todays?: number;
    joined?: number;
    created?: number;
  };
}

const filterOptions: Array<{
  id: RitualFilterType;
  label: string;
  icon: typeof Calendar;
}> = [
  { id: 'todays', label: "Today's", icon: Calendar },
  { id: 'joined', label: 'Joined', icon: Users },
  { id: 'created', label: 'Created', icon: Plus }
];

export function RitualsFilter({
  activeFilter,
  onFilterChange,
  className,
  counts
}: RitualsFilterProps): JSX.Element {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filterOptions.map((option) => {
        const Icon = option.icon;
        const count = counts?.[option.id];
        const isActive = activeFilter === option.id;

        return (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
              isActive
                ? 'border-purple-600 bg-purple-600 text-white dark:border-purple-400 dark:bg-purple-400 dark:text-gray-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'
            )}
          >
            <Icon className='h-3 w-3 md:h-3.5 md:w-3.5' />
            <span>{option.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs font-semibold',
                  isActive
                    ? 'bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-100'
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
  );
}

