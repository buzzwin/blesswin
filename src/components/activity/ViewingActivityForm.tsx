import { type ChangeEvent, useState } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { sendTweet } from '@lib/firebase/utils/tweet';
import SpinnerComponent from '@components/common/spinner';
import { HeroIcon } from '@components/ui/hero-icon';
import { DefaultAvatar } from '@components/ui/default-avatar';
import SearchResults from './searchresults';
import type { SearchResult, ViewingActivity, TMDBResult } from './types';

type ViewingActivityFormProps = {
  onSave: (activity: ViewingActivity) => void;
};

type SelectedShow = {
  id: number;
  title: string;
  releaseDate: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  name: string;
  status: string;
};

type TmdbResponse = {
  results: TMDBResult[];
};

const defaultActivity: ViewingActivity = {
  tmdbId: '0',
  title: '',
  poster_path: '',
  status: 'is watching',
  username: 'demo_user',
  photoURL: 'default-avatar',
  mediaType: 'movie'
};
// Movie review generation removed

const ViewingActivityForm = ({
  onSave
}: ViewingActivityFormProps): JSX.Element => {
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
  // Movie review generation removed
  const { user } = useAuth();

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const { value } = e.target;
    setSearchText(value);
    if (value.length > 0) setIsExpanded(true);
    await handleSearch(e);
  };

  const handleReviewChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setViewingActivity((prevState) => ({
      ...prevState,
      review: e.target.value
    }));
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setViewingActivity((prev) => ({ ...prev, status: event.target.value }));
  };

  const handleSearch = debounce(
    async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
      setLoading(true);
      const queryString = e.target.value ?? '';

      if (!queryString) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      const apiKey = '0af4f0642998fa986fe260078ab69ab6';
      const apiUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${queryString}&limit=5&sort_by=popularity.desc,release_date.desc&sort_order=desc`;

      try {
        const { data } = await axios.get<TmdbResponse>(apiUrl);
        const results = data.results
          .filter(
            (result): result is TMDBResult => result.media_type !== 'person'
          )
          .map(
            (result) =>
              ({
                id: result.id,
                title: result.title ?? result.name ?? '',
                releaseDate: result.release_date ?? result.first_air_date ?? '',
                overview: result.overview,
                poster_path: result.poster_path ?? '',
                vote_average: result.vote_average,
                name: result.name ?? result.title ?? '',
                status: 'is watching'
              } as SearchResult)
          );

        setSearchResults(results);
      } catch (error) {
        // console.error('Search error:', error);
      }

      setLoading(false);
    },
    1500
  );

  const handleShowSelect = (show: SearchResult) => {
    setSelectedShow(show);
    setViewingActivity((prevState) => ({
      ...prevState,
      tmdbId: show.id.toString(),
      title: show.title ?? show.name,
      poster_path: show.poster_path,
      overview: show.overview,
      status: 'is watching',
      username: prevState.username,
      photoURL: prevState.photoURL
    }));

    setSearchResults([]);
    setSearchText('');
    setIsExpanded(true);

    const searchInput = document.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
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

  const handleSave = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      if (!user?.id) {
        toast.error('Please sign in to post');
        return;
      }

      if (viewingActivity.status === null || viewingActivity.status === '') {
        viewingActivity.status = 'is watching';
      }

      const activityToSave = {
        ...viewingActivity,
        tmdbId: viewingActivity.tmdbId,
        username: user.username,
        photoURL: user.photoURL
      };

      // Create tweet with the activity
      const tweetUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        photoURL: user.photoURL,
        verified: user.verified
      };

      await sendTweet(activityToSave, tweetUser);
      onSave(activityToSave);
      handleCancel();
      toast.success('Review posted successfully!');
    } catch (error) {
      // console.error('Error saving activity:', error);
      toast.error('Failed to post review');
    }
  };

  // Movie review generation removed

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div
        className={cn(
          'transition-all duration-300',
          isExpanded ? 'space-y-4 p-4' : 'p-1'
        )}
      >
        {/* Expanded Content */}
        {isExpanded && (
          <div
            className={cn(
              'space-y-4',
              'animate-in fade-in slide-in-from-top-4',
              'duration-300'
            )}
          >
            {/* Action Buttons - Moved to top */}
            {(selectedShow.title ?? selectedShow.name) && (
              <div className='flex items-center justify-between'>
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
            )}

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
                  onSelect={handleShowSelect}
                />
              </div>
            )}

            {/* Selected Show Details */}
            {(selectedShow.title ?? selectedShow.name) && (
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
                        alt={selectedShow.title ?? selectedShow.name}
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
                      {selectedShow.title ?? selectedShow.name}
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewingActivityForm;
