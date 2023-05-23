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
  return (
    <>
      <SEO title='Buzzwin- What are you watching?' />
      <MainHeader useActionButton title='Whats Buzzin!' action={handleBack} />
      <PublicLayout
        title='Top Hindi Shows On Netflix - Buzzwin'
        description='Top 10 Indian shows on Netflix'
      >
        <div className='container mx-auto'>
          <h1 className='my-4 text-2xl font-bold'>
            Top Hindi Shows on Netflix
          </h1>
          <div className='grid grid-cols-3 gap-4'>
            {shows.map((show) => (
              <div key={show.id} className='rounded-md bg-white p-4 shadow-md'>
                <img
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.name}
                  className='mb-4 w-full rounded-md'
                />
                <h2 className='mb-2 text-lg font-semibold'>{show.name}</h2>
                <p>{show.overview}</p>
              </div>
            ))}
          </div>
        </div>
      </PublicLayout>
    </>
  );
};

TopHindiShows.getInitialProps = async () => {
  try {
    const response = await axios.get(
      'https://api.themoviedb.org/3/discover/tv?api_key=0af4f0642998fa986fe260078ab69ab6&sort_by=first_air_date.desc&with_original_language=hi&with_networks=213'
    );

    const shows: Show[] = response.data.results;
    return { shows };
  } catch (error) {
    console.error(error);
    return { shows: [] };
  }
};

export default TopHindiShows;
