import React, { useState, useEffect, useCallback } from 'react';
import { ActivityItem } from '@components/activity/ActivityItem';
import { ViewingActivity } from './types';
import { TMDBResult, TMDBResponse } from './types';
import axios from 'axios';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@lib/context/auth-context';
import Image from 'next/image';

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ViewingActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === activities.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [activities.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? activities.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [activities.length, isTransitioning]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    const fetchTMDBData = async () => {
      try {
        const titles = [
          'Inception',
          'Stranger Things',
          'The Dark Knight',
          'Breaking Bad',
          'Game of Thrones',
          'The Shawshank Redemption',
          'The Last Kingdom',
          'The White Lotus'
        ];

        const results = await Promise.all(
          titles.map(async (title) => {
            const response = await axios.get<TMDBResponse>(
              `https://api.themoviedb.org/3/search/multi?api_key=0af4f0642998fa986fe260078ab69ab6&query=${encodeURIComponent(
                title
              )}&page=1`
            );
            return response.data.results[0];
          })
        );

        const updatedActivities: ViewingActivity[] = results.map(
          (result: TMDBResult, index) => ({
            id: index + 1,
            tmdbId: result.id.toString(),
            rating: '',
            review: '',
            username: [
              'jdoe',
              'MikeM',
              'sarahJoe',
              'jderocks',
              'oHiCoolGuy',
              'totallyNotABot',
              'randomMan',
              'randomMan'
            ][index],
            status: [
              'loved',
              'loved',
              'watched',
              'started watching',
              'finished watching',
              'watched',
              'loved',
              'hates the show'
            ][index],
            title: result.title || result.name || 'Unknown Title',
            network: [
              'HBO',
              'Netflix',
              'Amazon Prime Video',
              'Netflix',
              'HBO',
              'Amazon Prime Video',
              'HBO',
              'HBO'
            ][index],
            releaseDate: result.release_date || result.first_air_date || '',
            time: new Date(
              Date.now() - Math.random() * 10000000000
            ).toISOString(),
            poster_path: result.poster_path || '',
            backdrop_path: result.backdrop_path || '',
            photoURL: `https://xsgames.co/randomusers/avatar.php?g=pixel&i=${Math.floor(
              Math.random() * 16
            )}`
          })
        );

        setActivities(updatedActivities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching TMDB data:', error);
        setLoading(false);
      }
    };

    void fetchTMDBData();
  }, []);

  useEffect(() => {
    // Auto-advance slides every 5 seconds if not transitioning
    const timer = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [nextSlide, isTransitioning]);

  if (loading) {
    return (
      <div className='flex h-[50vh] w-full items-center justify-center bg-gray-800/50 backdrop-blur-sm'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='relative h-[50vh] w-full overflow-hidden rounded-xl bg-gray-900 md:h-[60vh] lg:h-[70vh]'>
      <div className='relative h-full w-full'>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`absolute h-full w-full transform transition-all duration-500 ease-in-out ${
              index === currentIndex
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`
            }}
          >
            <div className='relative h-full w-full'>
              {/* Backdrop Image */}
              <div className='absolute inset-0'>
                {activity.backdrop_path && (
                  <Image
                    src={`https://image.tmdb.org/t/p/original${activity.backdrop_path}`}
                    alt={activity.title}
                    className='object-cover'
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute'
                    }}
                    width={1920}
                    height={1080}
                    priority={index === currentIndex}
                  />
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60'></div>
              </div>

              {/* Content */}
              <div className='absolute bottom-0 left-0 right-0 p-6 md:p-8'>
                <div className='flex items-end gap-6'>
                  {/* Poster */}
                  {activity.poster_path && (
                    <div className='relative h-36 w-24 md:h-48 md:w-32 lg:h-64 lg:w-44'>
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${activity.poster_path}`}
                        alt={activity.title}
                        className='rounded-lg object-cover shadow-2xl ring-1 ring-gray-800'
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute'
                        }}
                        width={500}
                        height={750}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className='flex-1 space-y-3'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <div className='relative h-6 w-6 md:h-8 md:w-8'>
                        <Image
                          src={activity.photoURL}
                          alt={activity.username}
                          className='rounded-full ring-2 ring-white/20'
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute'
                          }}
                          width={32}
                          height={32}
                        />
                      </div>
                      <span className='text-base font-medium text-gray-300 md:text-lg'>
                        {activity.username}
                      </span>
                      <span className='rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400 md:text-sm'>
                        {activity.status}
                      </span>
                    </div>

                    <h3 className='text-xl font-bold text-white md:text-3xl lg:text-4xl'>
                      {activity.title}
                    </h3>

                    <div className='flex flex-wrap items-center gap-3 text-sm text-gray-400 md:gap-4 md:text-base'>
                      <span className='rounded-full bg-gray-800/50 px-3 py-1 md:px-4'>
                        {activity.network}
                      </span>
                      <span>•</span>
                      <span>
                        {activity.releaseDate &&
                          new Date(activity.releaseDate).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className='absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 disabled:opacity-50 md:p-3'
          aria-label='Previous slide'
        >
          <ChevronLeftIcon className='h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8' />
        </button>
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 disabled:opacity-50 md:p-3'
          aria-label='Next slide'
        >
          <ChevronRightIcon className='h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8' />
        </button>

        {/* Dots */}
        <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2'>
          {activities.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsTransitioning(false), 500);
                }
              }}
              disabled={isTransitioning}
              className={`h-1.5 rounded-full transition-all md:h-2 ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/75 md:w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
