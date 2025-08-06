import { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Star, Calendar } from 'lucide-react';
import axios from 'axios';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button-shadcn';
import { Input } from '@components/ui/input';
import { Card, CardContent } from '@components/ui/card';

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  media_type: 'movie' | 'tv' | 'person';
}

interface TMDBResponse {
  page: number;
  results: TMDBResult[];
  total_pages: number;
  total_results: number;
}

interface SearchResult {
  id: number;
  title: string;
  releaseDate: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  mediaType: 'movie' | 'tv';
}

interface MediaSearchProps {
  onMediaSelect: (media: SearchResult) => void;
  onClose: () => void;
}

export function MediaSearch({
  onMediaSelect,
  onClose
}: MediaSearchProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchTMDB = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get<TMDBResponse>(
        'https://api.themoviedb.org/3/search/multi',
        {
          params: {
            api_key:
              process.env.NEXT_PUBLIC_TMDB_API_KEY ??
              '0af4f0642998fa986fe260078ab69ab6',
            query,
            language: 'en-US',
            page: 1,
            include_adult: false
          }
        }
      );

      const mappedResults = response.data.results
        .filter(
          (result): result is TMDBResult => result.media_type !== 'person'
        )
        .map((result) => ({
          id: result.id,
          title: result.title ?? result.name ?? '',
          releaseDate: result.release_date ?? result.first_air_date ?? '',
          overview: result.overview,
          poster_path: result.poster_path ?? '',
          vote_average: result.vote_average,
          mediaType: result.media_type as 'movie' | 'tv'
        }))
        .slice(0, 8); // Limit to 8 results

      setSearchResults(mappedResults);
      setShowResults(true);
    } catch (error) {
      // console.error('Error searching TMDB:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      // Debounce search
      const timeoutId = setTimeout(() => {
        void searchTMDB(query);
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleMediaSelect = (media: SearchResult): void => {
    onMediaSelect(media);
    setSearchQuery('');
    setShowResults(false);
    onClose();
  };

  return (
    <div ref={searchRef} className='relative w-full'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
        <Input
          type='text'
          placeholder='Search for movies or TV shows...'
          value={searchQuery}
          onChange={handleSearchChange}
          className='border-amber-200 py-2 pl-10 pr-4 focus:border-amber-400 dark:border-amber-800 dark:focus:border-amber-600'
        />
        {loading && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent' />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <Card className='absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto border-amber-200 bg-white shadow-lg dark:border-amber-800 dark:bg-gray-800'>
          <CardContent className='p-2'>
            <div className='space-y-2'>
              {searchResults.map((result) => (
                <div
                  key={`${result.mediaType}-${result.id}`}
                  onClick={() => handleMediaSelect(result)}
                  className='flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20'
                >
                  {/* Poster */}
                  <div className='flex-shrink-0'>
                    {result.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                        alt={result.title}
                        className='h-16 w-12 rounded-md object-cover'
                      />
                    ) : (
                      <div className='flex h-16 w-12 items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700'>
                        {result.mediaType === 'movie' ? (
                          <Film className='h-6 w-6 text-gray-400' />
                        ) : (
                          <Tv className='h-6 w-6 text-gray-400' />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <h3 className='break-words font-medium text-gray-900 dark:text-white'>
                        {result.title}
                      </h3>
                      <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                        {result.mediaType === 'movie' ? (
                          <Film className='h-3 w-3' />
                        ) : (
                          <Tv className='h-3 w-3' />
                        )}
                        {result.mediaType === 'movie' ? 'Movie' : 'TV'}
                      </span>
                    </div>

                    {result.releaseDate && (
                      <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                        <Calendar className='h-3 w-3' />
                        {new Date(result.releaseDate).getFullYear()}
                      </div>
                    )}

                    {result.vote_average > 0 && (
                      <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                        <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                        {result.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && searchQuery && !loading && searchResults.length === 0 && (
        <Card className='absolute top-full left-0 right-0 z-50 mt-2 border-amber-200 bg-white shadow-lg dark:border-amber-800 dark:bg-gray-800'>
          <CardContent className='p-4 text-center'>
            <p className='text-gray-500 dark:text-gray-400'>
              No movies or TV shows found for &quot;{searchQuery}&quot;
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
