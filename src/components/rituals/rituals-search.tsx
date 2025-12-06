import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@lib/utils';

interface RitualsSearchProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function RitualsSearch({
  onSearchChange,
  placeholder = 'Search rituals...',
  className
}: RitualsSearchProps): JSX.Element {
  const [query, setQuery] = useState('');

  useEffect(() => {
    onSearchChange(query);
  }, [query, onSearchChange]);

  const clearSearch = (): void => {
    setQuery('');
  };

  return (
    <div className={cn('relative', className)}>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-10 text-sm',
            'placeholder:text-gray-400',
            'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
            'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
            'dark:focus:border-purple-400 dark:focus:ring-purple-400'
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            aria-label='Clear search'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  );
}

