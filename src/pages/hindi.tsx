import axios from 'axios';
import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { ViewingActivity } from '@components/activity/types';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { PublicLayout } from '@components/layout/pub_layout';
import router from 'next/router';

interface Show {
  id: number;
  name: string;
  poster_path: string;
  overview: string;
}

interface ShowsProps {
  shows: Show[];
}

const TopHindiShows: NextPage<ShowsProps> = ({ shows }) => {
  const handleBack = async (): Promise<void> => {
    try {
      await router.push('/');
    } catch (error) {
      //console.error(
      //'An error occurred while navigating to the homepage:',
      //error
      //);
    }
  };
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  const openLightbox = (show: Show) => {
    setSelectedShow(show);
  };

  const closeLightbox = () => {
    setSelectedShow(null);
  };

  return (
    <div className='container mx-auto'>
      <h1 className='my-4 text-2xl font-bold'>Newest Hindi Shows on Netflix</h1>
      <div className='grid grid-cols-3 gap-4'>
        {shows.map((show) => (
          <div key={show.id} className='rounded-md bg-white p-4 shadow-md'>
            <img
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={show.name}
              className='mb-4 w-full cursor-pointer rounded-md'
              onClick={() => openLightbox(show)}
            />
            <h2 className='mb-2 text-lg font-semibold'>{show.name}</h2>
            <p>{show.overview}</p>
          </div>
        ))}
      </div>
      {selectedShow && (
        <div className='fixed inset-0 z-10 flex items-center justify-center'>
          <div className='max-w-md rounded-lg bg-white p-8 shadow-lg'>
            <button
              className='float-right p-4 text-gray-500 hover:text-gray-700'
              onClick={closeLightbox}
            >
              <svg
                className='h-6 w-6 fill-current'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
              >
                <path d='M12 10.586L8.707 7.293A1 1 0 107.293 8.707L10.586 12l-3.293 3.293a1 1 0 101.414 1.414L12 13.414l3.293 3.293a1 1 0 101.414-1.414L13.414 12l3.293-3.293a1 1 0 10-1.414-1.414L12 10.586z' />
              </svg>
            </button>
            <h2 className='mb-2 text-lg font-semibold'>{selectedShow.name}</h2>
            <p>{selectedShow.overview}</p>
            {/* Add additional details from TMDB as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

TopHindiShows.getInitialProps = async () => {
  try {
    const response = await axios.get(
      'https://api.themoviedb.org/3/discover/tv?api_key=0af4f0642998fa986fe260078ab69ab6&sort_by=first_air_date.desc&with_original_language=hi&with_networks=213'
    );

    const shows: Show[] = response.data?.results ?? [];
    return { shows };
  } catch (error) {
    console.error(error);
    return { shows: [] };
  }
};

export default TopHindiShows;
