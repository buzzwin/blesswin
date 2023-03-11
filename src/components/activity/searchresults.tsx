import Link from 'next/link';
import { SearchResult } from './types';

import React from 'react';
import Image from 'next/image';

interface SearchResultProps {
  results: SearchResult[];
  onSelect: (selected: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultProps> = ({ results, onSelect }) => {
  // Component code here
  return (
    <div className='flex flex-wrap items-center justify-center'>
      {/* Loop through TMDB search results and display them in cards */}
      {/* Assuming 'results' is an array of search results returned by the TMDB API */}
      {results.map((result) => (
        <div
          key={result.id}
          className='m-4 max-w-xs cursor-pointer overflow-hidden rounded shadow-lg'
          onClick={() => onSelect(result)}
        >
          {/* Display movie or TV show poster as card image */}

          <Image
            src={`https://image.tmdb.org/t/p/w500/${
              result.poster_path ?? 'placeholder.jpg'
            }`}
            alt={result.title || ''}
            width={500}
            height={750}
          />

          <div className='px-6 py-4'>
            {/* Display movie or TV show title and release date */}

            <div className='mb-2 text-xl font-bold'>{result.title}</div>

            <p className='text-base text-gray-700'>{result.releaseDate}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
