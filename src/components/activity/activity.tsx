import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import NextImage from 'next/image';
import cn from 'clsx';
import { useAuth } from '@lib/context/auth-context';
import { ActivityItem } from '@components/activity/ActivityItem';
import { DefaultAvatar } from '@components/ui/default-avatar';
import type { TMDBResult, TMDBResponse , ViewingActivity } from './types';

const ActivityFeed: React.FC = () => {
  const { user } = useAuth();
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

        const updatedActivities = results
          .filter(
            (result): result is TMDBResult => result.media_type !== 'person'
          )
          .map((result) => {
            const mediaType =
              result.media_type === 'tv' ? ('tv' as const) : ('movie' as const);

            return {
              tmdbId: result.id.toString(),
              title: result.title ?? result.name ?? '',
              poster_path: result.poster_path ?? '',
              mediaType,
              status: 'is watching',
              review: result.overview ?? '',
              overview: result.overview ?? '',
              username: 'demo_user',
              photoURL: 'default-avatar',
              network: '',
              releaseDate: result.release_date ?? result.first_air_date ?? ''
            };
          });

        setActivities(updatedActivities);
        setLoading(false);
      } catch (error) {
        // console.error('Error fetching TMDB data:', error);
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
      <div
        className={cn(
          'flex h-[50vh] w-full items-center justify-center',
          'bg-gradient-to-b from-gray-900/50 to-gray-900',
          'dark:from-black/50 dark:to-black',
          'backdrop-blur-sm'
        )}
      >
        <div
          className={cn(
            'h-8 w-8 rounded-full',
            'border-4 border-emerald-400 dark:border-emerald-500',
            'border-t-transparent dark:border-t-transparent',
            'animate-spin'
          )}
        ></div>
      </div>
    );
  }

  const handleDotClick = (index: number): void => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl',
        'h-[50vh] md:h-[60vh] lg:h-[70vh]',
        'bg-gradient-to-b from-gray-900/50 to-gray-900',
        'dark:from-black/50 dark:to-black',
        'transition-colors duration-500'
      )}
    >
      <div className='relative h-full w-full'>
        {activities.map((activity, index) => (
          <div
            key={`${activity.tmdbId}-${index}`}
            className={cn(
              'absolute h-full w-full transform',
              'transition-all duration-700 ease-in-out',
              index === currentIndex
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            )}
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`
            }}
          >
            <div className='group relative h-full w-full'>
              {/* Backdrop Image */}
              <div className='absolute inset-0 transition-transform duration-700 group-hover:scale-105'>
                <NextImage
                  src={`https://image.tmdb.org/t/p/original${activity.poster_path}`}
                  alt={activity.title}
                  layout='fill'
                  className='object-cover transition-all duration-700'
                  priority={index === currentIndex}
                  sizes='100vw'
                />
                <div
                  className={cn(
                    'absolute inset-0',
                    'bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent',
                    'dark:from-black dark:via-black/60 dark:to-transparent'
                  )}
                ></div>
              </div>

              {/* Content */}
              <div
                className={cn(
                  'absolute inset-x-0 bottom-0',
                  'p-6 md:p-8',
                  'transition-all duration-500',
                  'translate-y-0 group-hover:translate-y-[-8px]'
                )}
              >
                <div className='flex items-end gap-6'>
                  {/* Poster */}
                  {activity.poster_path && (
                    <div
                      className={cn(
                        'relative shrink-0 overflow-hidden rounded-lg',
                        'h-36 w-24 md:h-48 md:w-32 lg:h-64 lg:w-44',
                        'transition-all duration-500',
                        'shadow-2xl group-hover:shadow-emerald-500/20',
                        'dark:shadow-black/50 dark:group-hover:shadow-emerald-500/10'
                      )}
                    >
                      <NextImage
                        src={`https://image.tmdb.org/t/p/w500${activity.poster_path}`}
                        alt={activity.title}
                        layout='fill'
                        className={cn(
                          'rounded-lg object-cover transition-all duration-700',
                          'ring-1 ring-white/10 group-hover:ring-emerald-500/50',
                          'dark:ring-black/20 dark:group-hover:ring-emerald-500/30'
                        )}
                        sizes='(max-width: 768px) 96px, (max-width: 1024px) 128px, 176px'
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className='flex-1 space-y-3'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <div
                        className={cn(
                          'relative overflow-hidden rounded-full',
                          'h-6 w-6 md:h-8 md:w-8',
                          'transition-transform duration-500 group-hover:scale-105',
                          'ring-2 ring-white/10 group-hover:ring-emerald-500/50',
                          'dark:ring-white/5 dark:group-hover:ring-emerald-500/30'
                        )}
                      >
                        {activity.photoURL === 'default-avatar' ? (
                          <DefaultAvatar
                            className={cn(
                              'relative overflow-hidden rounded-full',
                              'h-6 w-6 md:h-8 md:w-8',
                              'transition-transform duration-500 group-hover:scale-105',
                              'ring-2 ring-white/10 group-hover:ring-emerald-500/50',
                              'dark:ring-white/5 dark:group-hover:ring-emerald-500/30'
                            )}
                          />
                        ) : activity.photoURL ? (
                          <NextImage
                            src={activity.photoURL}
                            alt={activity.username}
                            className='rounded-full'
                            width={32}
                            height={32}
                          />
                        ) : (
                          <DefaultAvatar className='h-8 w-8 rounded-full' />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-base font-medium md:text-lg',
                          'text-gray-300 group-hover:text-white',
                          'dark:text-gray-400 dark:group-hover:text-white',
                          'transition-colors duration-500'
                        )}
                      >
                        {activity.username}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs md:text-sm',
                          'bg-gray-800/50 text-gray-300',
                          'dark:bg-black/50 dark:text-gray-400',
                          'group-hover:bg-emerald-900/30 group-hover:text-emerald-200',
                          'dark:group-hover:bg-emerald-950/50 dark:group-hover:text-emerald-300',
                          'transition-colors duration-500'
                        )}
                      >
                        {activity.status}
                      </span>
                    </div>

                    <h3
                      className={cn(
                        'text-xl font-bold md:text-3xl lg:text-4xl',
                        'text-white group-hover:text-emerald-400',
                        'dark:text-gray-100 dark:group-hover:text-emerald-500',
                        'transition-all duration-500'
                      )}
                    >
                      {activity.title}
                    </h3>

                    <div
                      className={cn(
                        'flex flex-wrap items-center gap-3 md:gap-4',
                        'text-sm md:text-base',
                        'text-gray-400 group-hover:text-gray-300',
                        'dark:text-gray-500 dark:group-hover:text-gray-400',
                        'transition-colors duration-500'
                      )}
                    >
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 md:px-4',
                          'bg-gray-800/50',
                          'dark:bg-black/50',
                          'group-hover:bg-emerald-900/30 group-hover:text-emerald-200',
                          'dark:group-hover:bg-emerald-950/50 dark:group-hover:text-emerald-300',
                          'transition-colors duration-500'
                        )}
                      >
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
        <div className='absolute inset-y-0 left-0 flex items-center'>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className={cn(
              'p-2 md:p-3',
              'rounded-r-2xl',
              'text-white',
              'bg-black/20 dark:bg-black/40',
              'backdrop-blur-sm',
              'hover:bg-black/40 dark:hover:bg-black/60',
              'disabled:opacity-50',
              'translate-x-0 hover:translate-x-1',
              'transition-all duration-500',
              'group'
            )}
            aria-label='Previous slide'
          >
            <ChevronLeftIcon className='h-5 w-5 transition-transform duration-500 group-hover:scale-110 md:h-6 md:w-6 lg:h-8 lg:w-8' />
          </button>
        </div>
        <div className='absolute inset-y-0 right-0 flex items-center'>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={cn(
              'p-2 md:p-3',
              'rounded-l-2xl',
              'text-white',
              'bg-black/20 dark:bg-black/40',
              'backdrop-blur-sm',
              'hover:bg-black/40 dark:hover:bg-black/60',
              'disabled:opacity-50',
              '-translate-x-0 hover:-translate-x-1',
              'transition-all duration-500',
              'group'
            )}
            aria-label='Next slide'
          >
            <ChevronRightIcon className='h-5 w-5 transition-transform duration-500 group-hover:scale-110 md:h-6 md:w-6 lg:h-8 lg:w-8' />
          </button>
        </div>

        {/* Dots */}
        <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2'>
          {activities.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              disabled={isTransitioning}
              className={cn(
                'h-1.5 rounded-full md:h-2',
                'transition-all duration-500',
                index === currentIndex
                  ? 'w-6 bg-emerald-400 dark:bg-emerald-500'
                  : cn(
                      'w-1.5 md:w-2',
                      'bg-white/30 hover:bg-white/50',
                      'dark:bg-white/20 dark:hover:bg-white/40'
                    )
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
