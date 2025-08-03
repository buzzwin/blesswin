import axios, { AxiosResponse } from 'axios';
import { useState } from 'react';
import Head from 'next/head';
import { ChangeEvent, FormEvent } from 'react';

interface SearchResults {
  id: number;
  title: string;
  releaseDate: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  name: string;
}

interface MyAxiosResponse extends AxiosResponse {
  data: {
    results: SearchResults[];
  };
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults[]>([]);

  const handleSearchQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiUrl = `https://api.themoviedb.org/3/search/multi?api_key=0af4f0642998fa986fe260078ab69ab6&query=${
      searchQuery ?? ''
    }`;

    const response: MyAxiosResponse = await axios.get(apiUrl);
    const results: SearchResults[] = response.data.results;
    // console.log('results', results);
    setSearchResults(results);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <Head>
        <title>Search Movies and TV Shows</title>
      </Head>
      <h1 className='mb-4 text-2xl font-bold'>Search Movies and TV Shows</h1>
      <form onSubmit={handleSearchSubmit} className='mb-4'>
        <input
          type='text'
          value={searchQuery}
          onChange={handleSearchQueryChange}
          placeholder='Search for movies, TV shows, or people'
          className='w-full rounded-md border border-gray-400 p-2 focus:border-blue-500 focus:outline-none focus:ring'
        />
      </form>
      {searchResults.length > 0 ? (
        <ul className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {searchResults.map((result) => (
            <li
              key={result.id}
              className='overflow-hidden rounded-md bg-gray-100 shadow-lg'
            >
              {result.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
                  alt={result.title ?? result.name}
                  className='h-48 w-full object-cover'
                />
              )}
              <div className='p-4'>
                <h2 className='mb-2 text-lg font-bold'>
                  {result.title ?? result.name}
                </h2>
                {result.overview && (
                  <p className='mb-2 text-base text-gray-700'>
                    {result.overview}
                  </p>
                )}
                {result.vote_average && (
                  <div className='text-base text-gray-700'>{`Rating: ${result.vote_average}/10`}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No search results to display</div>
      )}
    </div>
  );
}
