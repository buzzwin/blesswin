import { useState } from 'react';
import { Modal } from '@components/modal/modal';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { toast } from 'react-hot-toast';
import { addMediaToClub } from '@lib/firebase/utils/watchclub';
import { debounce } from 'lodash';
import axios from 'axios';
import type { SearchResult, TMDBResult } from '@components/activity/types';
import type { WatchClub } from '@lib/types/watchclub';

type AddMediaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  club: WatchClub;
  onMediaAdded: () => void;
};

export function AddMediaModal({
  isOpen,
  onClose,
  club,
  onMediaAdded
}: AddMediaModalProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const searchTMDB = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get<{ results: TMDBResult[] }>(
        `https://api.themoviedb.org/3/search/multi/${club.mediaType}`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            query,
            language: 'en-US',
            page: 1,
            include_adult: false
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`
          }
        }
      );

      console.log('TMDB Response:', response.data);

      const mappedResults = response.data.results.map((result) => ({
        id: result.id,
        title: club.mediaType === 'movie' ? result.title : result.name,
        releaseDate:
          club.mediaType === 'movie'
            ? result.release_date
            : result.first_air_date,
        overview: result.overview,
        poster_path: result.poster_path,
        vote_average: result.vote_average,
        name: club.mediaType === 'movie' ? result.title : result.name,
        status: ''
      }));

      console.log('Mapped Results:', mappedResults);
      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Error searching TMDB:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        toast.error(
          error.response?.data?.status_message || 'Failed to search media'
        );
      } else {
        toast.error('Failed to search media');
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchTMDB, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;
    setSearchQuery(query);
    void debouncedSearch(query);
  };

  const handleAddMedia = async (media: SearchResult): Promise<void> => {
    setAdding(true);
    try {
      await addMediaToClub(club.id, {
        tmdbId: media.id.toString(),
        title: media.title || media.name,
        overview: media.overview,
        posterPath: media.poster_path,
        releaseDate: media.releaseDate,
        mediaType: club.mediaType as 'movie' | 'tv' // Type assertion since we filter by mediaType
      });
      toast.success('Added to club successfully');
      onMediaAdded();
      onClose();
    } catch (error) {
      console.error('Error adding media:', error);
      toast.error('Failed to add media');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal
      modalClassName='w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl'
      open={isOpen}
      closeModal={onClose}
    >
      <div className='p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>
            Add {club.mediaType === 'movie' ? 'Movie' : 'TV Show'}
          </h2>
          <button
            onClick={onClose}
            className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <HeroIcon iconName='XMarkIcon' className='h-5 w-5' />
          </button>
        </div>

        {/* Search Input */}
        <div className='flex gap-2'>
          <input
            type='text'
            value={searchQuery}
            onChange={handleSearch}
            placeholder={`Search for ${
              club.mediaType === 'movie' ? 'movies' : 'TV shows'
            }`}
            className={cn(
              'flex-1 rounded-lg',
              'border border-gray-300 dark:border-gray-700',
              'bg-white dark:bg-gray-800',
              'p-2.5 text-sm',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:border-emerald-500 focus:ring-emerald-500'
            )}
          />
        </div>

        {/* Search Results */}
        <div className='mt-6 space-y-4'>
          {loading ? (
            <div className='flex justify-center py-8'>
              <HeroIcon
                iconName='ArrowPathIcon'
                className='h-8 w-8 animate-spin text-gray-400'
              />
            </div>
          ) : (
            searchResults.map((media) => (
              <div
                key={media.id}
                className='flex items-start gap-4 rounded-lg border p-4 dark:border-gray-700'
              >
                {media.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${media.poster_path}`}
                    alt={media.title || media.name}
                    className='h-24 w-16 rounded-md object-cover'
                  />
                ) : (
                  <div className='flex h-24 w-16 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800'>
                    <HeroIcon
                      iconName={
                        club.mediaType === 'movie' ? 'FilmIcon' : 'TvIcon'
                      }
                      className='h-8 w-8 text-gray-400'
                    />
                  </div>
                )}
                <div className='flex-1'>
                  <h3 className='font-medium text-gray-900 dark:text-white'>
                    {media.title || media.name}
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    {media.releaseDate?.split('-')[0]}
                  </p>
                  <p className='line-clamp-2 mt-2 text-sm text-gray-600 dark:text-gray-300'>
                    {media.overview}
                  </p>
                </div>
                <Button
                  onClick={() => void handleAddMedia(media)}
                  disabled={adding}
                  className='flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50'
                >
                  {adding ? (
                    <HeroIcon
                      iconName='ArrowPathIcon'
                      className='h-4 w-4 animate-spin'
                    />
                  ) : (
                    <HeroIcon iconName='PlusIcon' className='h-4 w-4' />
                  )}
                  Add
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
