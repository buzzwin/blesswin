import { FormEvent, ChangeEvent, useState } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import SpinnerComponent from '@components/common/spinner';
import SearchResults from './searchresults';
import { SearchResult } from './types';
import { ViewingActivity } from './types';
import { cn } from '../../lib/utils';
import { HeroIcon } from '../../components/ui/hero-icon';

interface ViewingActivityFormProps {
  onSave: (ViewingActivity: {
    id: number;
    tmdbId: string;
    title: string;
    status: string;
    rating: string;
    review: string;
    poster_path: string;
    username: string;
    network: string;
    releaseDate: string;
    time: string;
    photoURL: string;
    mediaType: 'movie' | 'tv';
  }) => void;
}

interface SelectedShow {
  id: number;
  title: string;
  releaseDate: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  name: string;
  status: string;
}

interface TmdbResponse {
  results: SearchResult[];
}

const defaultActivity: ViewingActivity = {
  id: 0,
  tmdbId: '',
  title: '',
  status: 'is watching',
  rating: '',
  review: '',
  poster_path: '',
  username: '',
  network: '',
  releaseDate: '',
  time: '',
  photoURL: '',
  mediaType: 'movie'
};

const ViewingActivityForm: React.FC<ViewingActivityFormProps> = ({
  onSave
}) => {
  const [viewingActivity, setViewingActivity] =
    useState<ViewingActivity>(defaultActivity);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedShow, setSelectedShow] = useState<SelectedShow>({
    id: 0,
    title: '',
    releaseDate: '',
    overview: '',
    poster_path: '',
    vote_average: 0,
    name: '',
    status: 'is watching'
  });

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const { value } = e.target;
    setSearchText(value);
    if (value.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
    await handleSearch(e);
  };

  const handleReviewChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setViewingActivity((prevState) => ({
      ...prevState,
      review: value
    }));
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    setViewingActivity((prev) => ({ ...prev, status: newStatus }));
  };

  const handleSearch = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const queryString: string = e.target.value ?? '';
    if (queryString === '') {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    const apiKey = '0af4f0642998fa986fe260078ab69ab6';
    const apiUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${queryString}&limit=5&sort_by=popularity.desc,release_date.desc&sort_order=desc`;

    try {
      const response = await axios.get<TmdbResponse>(apiUrl);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }, 1500);

  const handleSelect = (searchResult: SearchResult) => {
    setSelectedShow(searchResult);
    setSearchResults([]);
    setSearchText(searchResult.title || searchResult.name);
    setViewingActivity((prevState) => ({
      ...prevState,
      title: searchResult.title || searchResult.name,
      tmdbId: searchResult.id.toString(),
      rating: searchResult.vote_average.toString(),
      poster_path: searchResult.poster_path
    }));
  };

  const handleCancel = () => {
    setSearchResults([]);
    setSearchText('');
    setIsExpanded(false);
    setSelectedShow({
      id: 0,
      title: '',
      releaseDate: '',
      overview: '',
      poster_path: '',
      vote_average: 0,
      name: '',
      status: ''
    });
  };

  const handleSave = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (viewingActivity.status === null || viewingActivity.status === '') {
      viewingActivity.status = 'is watching';
    }
    onSave(viewingActivity);
    handleCancel();
  };

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div
        className={cn(
          'transition-all duration-300',
          isExpanded ? 'space-y-4 p-4' : 'p-1'
        )}
      >
        {/* Search Input */}
        <div className='relative'>
          <div
            className={cn(
              'relative flex items-center',
              'rounded-xl',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'transition-all duration-200',
              'hover:border-emerald-500 dark:hover:border-emerald-500',
              'focus-within:border-emerald-500 dark:focus-within:border-emerald-500',
              'focus-within:ring-2 focus-within:ring-emerald-500/20',
              isExpanded ? '' : 'shadow-sm'
            )}
          >
            <HeroIcon
              iconName='MagnifyingGlassIcon'
              className={cn(
                'ml-3 h-5 w-5',
                'text-gray-400 dark:text-gray-500',
                'transition-colors duration-200'
              )}
            />
            <input
              className={cn(
                'w-full',
                'px-3 py-2',
                'bg-transparent',
                'text-gray-900 dark:text-gray-100',
                'placeholder-gray-500 dark:placeholder-gray-400',
                'focus:outline-none',
                'text-sm'
              )}
              type='text'
              placeholder='Search movies and TV shows...'
              value={searchText}
              onChange={handleInputChange}
            />
            {loading && (
              <div className='absolute right-3'>
                <SpinnerComponent />
              </div>
            )}
          </div>
          {!isExpanded && (
            <p
              className={cn(
                'absolute left-0 -bottom-5',
                'text-xs',
                'text-gray-500 dark:text-gray-400',
                'transition-colors duration-200'
              )}
            >
              Try searching for your favorite shows
            </p>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div
            className={cn(
              'space-y-4',
              'animate-in fade-in slide-in-from-top-4',
              'duration-300'
            )}
          >
            {/* Status Selection */}
            <div className='relative'>
              <select
                className={cn(
                  'w-full appearance-none',
                  'px-4 py-2',
                  'rounded-xl',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-900 dark:text-gray-100',
                  'text-sm',
                  'shadow-sm',
                  'transition-all duration-200',
                  'hover:border-emerald-500 dark:hover:border-emerald-500',
                  'focus:border-emerald-500 dark:focus:border-emerald-500',
                  'focus:ring-2 focus:ring-emerald-500/20',
                  'focus:outline-none'
                )}
                value={viewingActivity.status}
                onChange={handleStatusChange}
              >
                <option value='is watching'>Currently watching</option>
                <option value='has just started'>Just started</option>
                <option value='has finished'>Finished</option>
                <option value='hates'>Hated</option>
                <option value='loves'>Loved</option>
                <option value='likes'>Liked</option>
                <option value='is intrigued by'>Intrigued by</option>
                <option value='has news about'>Has news about</option>
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-4'>
                <HeroIcon
                  iconName='ChevronDownIcon'
                  className='h-5 w-5 text-gray-500 dark:text-gray-400'
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && (
              <div
                className={cn(
                  'absolute z-10',
                  'max-h-80 w-full',
                  'mt-2',
                  'overflow-y-auto',
                  'rounded-xl',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'shadow-lg',
                  'divide-y divide-gray-200 dark:divide-gray-700'
                )}
              >
                <SearchResults
                  results={searchResults}
                  onSelect={handleSelect}
                />
              </div>
            )}

            {/* Selected Show Details */}
            {(selectedShow.title || selectedShow.name) && (
              <div className='space-y-4'>
                {/* Review Textarea */}
                <div className='relative'>
                  <label
                    className={cn(
                      'mb-1.5 block',
                      'text-sm font-medium',
                      'text-gray-700 dark:text-gray-300'
                    )}
                    htmlFor='review'
                  >
                    Your Review
                  </label>
                  <textarea
                    className={cn(
                      'w-full',
                      'px-4 py-2',
                      'rounded-xl',
                      'bg-white dark:bg-gray-800',
                      'border border-gray-200 dark:border-gray-700',
                      'text-gray-900 dark:text-gray-100',
                      'text-sm',
                      'placeholder-gray-500 dark:placeholder-gray-400',
                      'shadow-sm',
                      'transition-all duration-200',
                      'hover:border-emerald-500 dark:hover:border-emerald-500',
                      'focus:border-emerald-500 dark:focus:border-emerald-500',
                      'focus:ring-2 focus:ring-emerald-500/20',
                      'focus:outline-none',
                      'resize-none',
                      'min-h-[100px]'
                    )}
                    id='review'
                    name='review'
                    placeholder='Share your thoughts about this show...'
                    value={viewingActivity.review}
                    onChange={handleReviewChange}
                  />
                </div>

                {/* Selected Show Preview */}
                <div
                  className={cn(
                    'flex gap-4',
                    'p-3',
                    'rounded-xl',
                    'bg-gray-50 dark:bg-gray-800/50',
                    'border border-gray-100 dark:border-gray-700'
                  )}
                >
                  {selectedShow.poster_path && (
                    <div
                      className={cn(
                        'relative shrink-0',
                        'h-28 w-20',
                        'overflow-hidden rounded-lg',
                        'shadow-sm'
                      )}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500${selectedShow.poster_path}`}
                        alt={selectedShow.title || selectedShow.name}
                        className='h-full w-full object-cover'
                      />
                    </div>
                  )}
                  <div className='flex-1 space-y-1.5'>
                    <h3
                      className={cn(
                        'text-base font-semibold',
                        'text-gray-900 dark:text-gray-100'
                      )}
                    >
                      {selectedShow.title || selectedShow.name}
                    </h3>
                    <p
                      className={cn(
                        'text-sm',
                        'text-gray-600 dark:text-gray-400',
                        'line-clamp-2'
                      )}
                    >
                      {selectedShow.overview}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    onClick={handleCancel}
                    className={cn(
                      'px-3 py-1.5',
                      'text-sm font-medium',
                      'rounded-lg',
                      'bg-gray-100 dark:bg-gray-800',
                      'text-gray-700 dark:text-gray-300',
                      'hover:bg-gray-200 dark:hover:bg-gray-700',
                      'focus:outline-none focus:ring-2 focus:ring-gray-500/20',
                      'transition-all duration-200'
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className={cn(
                      'px-3 py-1.5',
                      'text-sm font-medium',
                      'rounded-lg',
                      'bg-emerald-500 dark:bg-emerald-600',
                      'text-white',
                      'hover:bg-emerald-600 dark:hover:bg-emerald-700',
                      'focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
                      'transition-all duration-200'
                    )}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewingActivityForm;
