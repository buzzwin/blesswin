import SpinnerComponent from '@components/common/spinner';
import axios from 'axios';
import { debounce } from 'lodash'; // import the debounce function from lodash library
import { ChangeEvent, useState } from 'react';
import SearchResults from './searchresults';
import { SearchResult, ViewingActivity } from './types';

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

interface AutocompleteState {
  selectedValue: string;
  filteredItems: string[];
  // add other state properties as needed
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
  photoURL: ''
};

const ViewingActivityForm: React.FC<ViewingActivityFormProps> = ({
  onSave
}) => {
  const [viewingActivity, setViewingActivity] =
    useState<ViewingActivity>(defaultActivity);

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const { name, value } = e.target;
    setSearchText(value);
    await handleSearch(e);
    console.log('handleSearch');
  };

  const handleReviewChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setViewingActivity((prevState) => ({
      ...prevState,
      [name]: value
    }));
    //console.log('Status', viewingActivity);
  };

  const handleSave = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log('handleSave ViewingActivity: ', viewingActivity);
    onSave(viewingActivity);
    setSearchResults([]);
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

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Status', event.target.value);
    const newStatus = event.target.value;
    setViewingActivity((prev) => ({ ...prev, status: newStatus }));
  };

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hidden, setHidden] = useState(true);
  const [selectedShow, setSelectedShow] = useState<SelectedShow>({
    // set the selected show state
    id: 0,
    title: '',
    releaseDate: '',
    overview: '',
    poster_path: '',
    vote_average: 0,
    name: '',
    status: 'is watching'
  });

  // debounce the handleSearch function
  const handleSearch = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const queryString: string = e.target.value ?? '';
    if (queryString === '') {
      setSearchResults([]);
      return;
    }

    const apiKey = '0af4f0642998fa986fe260078ab69ab6';
    const apiUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${queryString}&limit=5&sort_by=popularity.desc,release_date.desc&sort_order=desc`;
    // const response = (await axios.get(apiUrl ?? '')) as any;
    // const results = response.data.results as SearchResult[];
    try {
      const response = await axios.get<TmdbResponse>(apiUrl);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error(error);
      return [];
    }

    setLoading(false);
  }, 1500); // set the delay time to 500ms

  const handleSelect = (searchResult: SearchResult) => {
    //console.log('Selected: ', searchResult);
    setSelectedShow(searchResult);
    //setSelectedShow(event); // set the selected show
    setSearchResults([]);
    setSearchText(searchResult.title || searchResult.name);
    console.log('Selected Viewing: ', viewingActivity);
    setViewingActivity((prevState) => ({
      ...prevState,
      title: searchResult.title || searchResult.name,
      tmdbId: searchResult.id.toString(),
      rating: searchResult.vote_average.toString(),
      poster_path: searchResult.poster_path
    }));
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSearchResults([]);
    setSearchText(' ');
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

  const [loading, setLoading] = useState(false);

  return (
    <div className='mx-auto mt-4 w-full sm:max-w-sm lg:max-w-md'>
      <div className='flex items-center space-x-2'>
        <select
          className='focus:shadow-outline w-auto appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
          id='status'
          name='status'
          value={viewingActivity.status}
          onChange={handleStatusChange}
          defaultValue='is watching'
        >
          <option value='is watching'>Currently watching</option>
          <option value='just started'>Just started</option>
          <option value='finished'>Finished</option>
          <option value='hates'>Hated</option>
          <option value='loves'>Loved</option>
        </select>
      </div>

      <div className='mx-auto w-full max-w-lg'>
        <div className='mt-8 mb-8'>
          <input
            className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
            id='show'
            type='text'
            placeholder='eg . The Last of Us'
            onChange={handleInputChange}
            value={searchText}
          />
          {loading && (
            <div>
              <div>
                <SpinnerComponent />
              </div>
            </div>
          )}
          {searchResults && searchResults.length > 0 && (
            <SearchResults results={searchResults} onSelect={handleSelect} />
          )}
        </div>

        {selectedShow.title || selectedShow.name ? (
          <div>
            <div className='mb-4'>
              <label
                className='text-white-700 mb-2 block pt-2 text-sm font-bold'
                htmlFor='review'
              >
                Review
              </label>
              <textarea
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
                id='review'
                name='review'
                value={viewingActivity.review}
                onChange={handleReviewChange}
              ></textarea>
            </div>

            <div className='flex items-center justify-between'>
              <button
                className='focus:shadow-outline rounded bg-gray-400 px-4 py-2 font-bold text-white hover:bg-gray-500 focus:outline-none'
                type='button'
                onClick={handleCancel}
              >
                Cancel!
              </button>
              <button
                className='focus:shadow-outline rounded bg-green-700 px-4 py-2 font-bold text-white hover:bg-main-accent focus:outline-none'
                onClick={handleSave}
              >
                Save
              </button>
            </div>

            <div className='flex items-center justify-center pt-4'>
              <img
                src={
                  selectedShow.poster_path
                    ? `https://image.tmdb.org/t/p/w500/${selectedShow.poster_path}`
                    : ''
                }
                alt={selectedShow.title}
                className='h-1/2 w-1/2 object-cover'
              />
              <div className='p-4'>
                <h2 className='mb-2 text-lg font-bold'>{selectedShow.title}</h2>
                <p className='mb-2 text-base text-gray-700'>
                  {selectedShow.overview}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}

        {hidden ? <div></div> : <div></div>}
      </div>
    </div>
  );
};

export default ViewingActivityForm;
