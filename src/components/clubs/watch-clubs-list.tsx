import { useState, useEffect } from 'react';
import { getWatchClubs } from '@lib/firebase/utils/watchclub';
import { WatchClubCard } from './watch-club-card';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';
import type { WatchClubWithUser } from '@lib/types/watchclub';

type SortOption = 'latest' | 'oldest' | 'members';
type FilterOption = 'all' | 'movie' | 'tv' | 'joined';

export function WatchClubsList(): JSX.Element {
  const [clubs, setClubs] = useState<WatchClubWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    const loadClubs = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        console.log('Starting to fetch clubs...');
        const fetchedClubs = await getWatchClubs();
        console.log('Successfully fetched clubs:', fetchedClubs);
        setClubs(fetchedClubs);
      } catch (error) {
        console.error('Error loading clubs:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to load clubs'
        );
      } finally {
        setLoading(false);
      }
    };

    void loadClubs();
  }, []);

  if (loading) {
    return (
      <div className='mt-5'>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className='mt-5 text-center text-red-500'>
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className='mt-2 text-sm text-blue-500 hover:underline'
        >
          Try again
        </button>
      </div>
    );
  }

  const filteredClubs = clubs.filter((club) => {
    if (filterBy === 'all') return true;
    if (filterBy === 'movie' || filterBy === 'tv') {
      return club.mediaType === filterBy;
    }
    return true;
  });

  const sortedClubs = [...filteredClubs].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.createdAt.seconds - b.createdAt.seconds;
      case 'members':
        return b.totalMembers - a.totalMembers;
      default: // latest
        return b.createdAt.seconds - a.createdAt.seconds;
    }
  });

  if (!clubs.length) {
    return (
      <StatsEmpty
        title='No watch clubs yet'
        description='Create a club and start watching together!'
      />
    );
  }

  return (
    <div className='space-y-4'>
      {/* Filters and Sort Controls */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800'>
        {/* Filter Buttons */}
        <div className='flex gap-2'>
          {(['all', 'movie', 'tv', 'joined'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilterBy(option)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium',
                filterBy === option
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              )}
            >
              {option === 'all'
                ? 'All Clubs'
                : option === 'movie'
                ? 'Movies'
                : option === 'tv'
                ? 'TV Shows'
                : 'Joined'}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className={cn(
            'rounded-lg px-3 py-1.5',
            'bg-gray-100 dark:bg-gray-700',
            'text-sm font-medium',
            'border-0',
            'focus:ring-2 focus:ring-emerald-500'
          )}
        >
          <option value='latest'>Latest First</option>
          <option value='oldest'>Oldest First</option>
          <option value='members'>Most Members</option>
        </select>
      </div>

      {/* Clubs Grid */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {sortedClubs.map((club) => (
          <WatchClubCard key={club.id} club={club} />
        ))}
      </div>
    </div>
  );
}
