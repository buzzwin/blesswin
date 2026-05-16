import { cn } from '@lib/utils';
import { ArrowUpDown, TrendingUp, Clock, Award, SortAsc } from 'lucide-react';

export type SortOption = 'popularity' | 'newest' | 'karma' | 'alphabetical';

interface RitualsSortProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

const sortOptions: Array<{
  id: SortOption;
  label: string;
  icon: typeof TrendingUp;
}> = [
  { id: 'popularity', label: 'Popular', icon: TrendingUp },
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'karma', label: 'Karma', icon: Award },
  { id: 'alphabetical', label: 'A-Z', icon: SortAsc }
];

export function RitualsSort({
  activeSort,
  onSortChange,
  className
}: RitualsSortProps): JSX.Element {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ArrowUpDown className='h-4 w-4 text-gray-500 dark:text-[#9E8B76]' />
      <span className='text-xs font-medium text-gray-600 dark:text-[#9E8B76] md:text-sm'>
        Sort:
      </span>
      <div className='flex flex-wrap items-center gap-1.5'>
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = activeSort === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50 focus:ring-offset-1',
                isActive
                  ? 'border-[#C9A96E] bg-[#C97D60] text-white dark:border-[rgba(201,169,110,0.45)] dark:bg-[#C97D60] dark:text-[#1a1108]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-[#C4B5A0] dark:hover:border-gray-600 dark:hover:bg-[#231a10]'
              )}
            >
              <Icon className='h-3 w-3' />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

