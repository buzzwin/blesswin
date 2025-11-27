import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Calendar, Star, Heart, Loader2 } from 'lucide-react';
import { Button } from '@components/ui/button-shadcn';

interface WellnessContentItem {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  posterUrl: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  reason: string;
  wellnessThemes: string[];
  category: 'yoga' | 'meditation' | 'harmony' | 'holistic' | 'wellness';
}

interface WellnessContentGridProps {
  category?: string;
  limit?: number;
  title?: string;
  autoFetch?: boolean;
}

export function WellnessContentGrid({
  category,
  limit = 10,
  title = 'Wellness Content',
  autoFetch = false
}: WellnessContentGridProps): JSX.Element {
  const [content, setContent] = useState<WellnessContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchWellnessContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`/api/wellness-content?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wellness content');
      }

      const data = await response.json();
      setContent(data.content || []);
      setHasFetched(true);
    } catch (err) {
      console.error('Error fetching wellness content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    if (autoFetch) {
      void fetchWellnessContent();
    }
  }, [autoFetch, fetchWellnessContent]);

  if (!hasFetched && !loading) {
    return (
      <div className='py-20 text-center'>
        {title && (
          <h2 className='mb-6 text-3xl font-light text-gray-900 dark:text-white sm:text-4xl'>
            {title}
          </h2>
        )}
        <p className='mb-6 text-gray-600 dark:text-gray-400'>
          Ask your wellness AI pal for movie and TV show recommendations!
        </p>
        <Button
          onClick={fetchWellnessContent}
          className='rounded-lg bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white shadow-md transition-all hover:shadow-lg'
        >
          <Heart className='mr-2 h-4 w-4' />
          Get Recommendations
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-20 text-center'>
        {title && (
          <h2 className='mb-6 text-3xl font-light text-gray-900 dark:text-white sm:text-4xl'>
            {title}
          </h2>
        )}
        <p className='mb-4 text-gray-600 dark:text-gray-400'>{error}</p>
        <Button
          onClick={fetchWellnessContent}
          variant='outline'
          className='rounded-lg'
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className='py-20 text-center'>
        {title && (
          <h2 className='mb-6 text-3xl font-light text-gray-900 dark:text-white sm:text-4xl'>
            {title}
          </h2>
        )}
        <p className='mb-4 text-gray-600 dark:text-gray-400'>
          No wellness content found. Check back soon!
        </p>
        <Button
          onClick={fetchWellnessContent}
          variant='outline'
          className='rounded-lg'
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className='mb-8 text-3xl font-light text-gray-900 dark:text-white sm:text-4xl'>
          {title}
        </h2>
      )}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
        {content.map((item) => {
          const releaseYear = item.releaseDate
            ? new Date(item.releaseDate).getFullYear()
            : null;

          return (
            <div
              key={`${item.mediaType}-${item.tmdbId}`}
              className='group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-xl dark:bg-gray-800'
            >
              {/* Poster */}
              <div className='relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700'>
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  layout='fill'
                  objectFit='cover'
                  className='transition-transform group-hover:scale-105'
                  sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                
                {/* Play Button Overlay */}
                <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
                  <div className='rounded-full bg-white/90 p-3 shadow-lg'>
                    <Play className='h-6 w-6 text-gray-900' fill='currentColor' />
                  </div>
                </div>

                {/* Rating Badge */}
                {item.voteAverage > 0 && (
                  <div className='absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm'>
                    <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                    {item.voteAverage.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Content Info */}
              <div className='p-3'>
                <h3 className='mb-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white'>
                  {item.title}
                </h3>
                <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                  {releaseYear && (
                    <>
                      <Calendar className='h-3 w-3' />
                      <span>{releaseYear}</span>
                    </>
                  )}
                  <span className='ml-auto capitalize'>{item.mediaType}</span>
                </div>
                
                {/* Wellness Themes */}
                {item.wellnessThemes && item.wellnessThemes.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-1'>
                    {item.wellnessThemes.slice(0, 2).map((theme, idx) => (
                      <span
                        key={idx}
                        className='rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

