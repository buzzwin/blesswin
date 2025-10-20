import { motion, useMotionValue, useTransform } from 'framer-motion';
import { X, Heart, Meh, Sparkles, Share2 } from 'lucide-react';
import { ImageWithFallback } from '@components/ui/image-with-fallback';
import { SimpleSocialShare as SocialShare } from '@components/share/simple-social-share';
import { useState } from 'react';
import type { MediaCard } from '@lib/types/review';

interface MediaCardProps {
  media: MediaCard;
  onSwipe: (direction: 'left' | 'right' | 'middle') => void;
  isActive: boolean;
}

export function SwipeableMediaCard({
  media,
  onSwipe,
  isActive
}: MediaCardProps): JSX.Element {
  const [showSocialShare, setShowSocialShare] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('left');
    }
  };

  const handleButtonClick = (direction: 'left' | 'right' | 'middle') => {
    onSwipe(direction);
  };

  // Get backdrop image URL with fallback
  const backdropUrl = media.backdropPath
    ? `https://image.tmdb.org/t/p/w780${media.backdropPath}`
    : '/api/placeholder/780/439';
  const posterUrl = media.posterPath
    ? `https://image.tmdb.org/t/p/w154${media.posterPath}`
    : '/api/placeholder/154/231';

  return (
    <motion.div
      className='relative h-full w-full overflow-hidden rounded-3xl bg-gray-900 shadow-2xl'
      style={{ x, y, rotate, opacity }}
      drag={isActive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
    >
      {/* Backdrop Image */}
      <div className='absolute inset-0'>
        {media.backdropPath ? (
          <ImageWithFallback
            src={backdropUrl}
            alt={media.title}
            width={780}
            height={439}
            className='h-full w-full object-cover'
            fallback='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzgwIiBoZWlnaHQ9IjQzOSIgdmlld0JveD0iMCAwIDc4MCA0MzkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI3ODAiIGhlaWdodD0iNDM5IiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNkI3MjgwIj43ODB4NDM5PC90ZXh0Pgo8L3N2Zz4='
            priority={isActive}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700'>
            <div className='text-4xl text-gray-500 dark:text-gray-400'>🎬</div>
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
      </div>

      {/* Large Swipe Indicators */}
      <div className='pointer-events-none absolute inset-0'>
        <motion.div
          className='absolute left-6 top-12 rounded-2xl border-4 border-red-500 bg-red-500/30 p-6 text-white backdrop-blur-sm'
          style={{
            opacity: useTransform(x, [-200, -50, 0], [1, 0.5, 0]),
            scale: useTransform(x, [-200, -50, 0], [1, 0.8, 0.5])
          }}
        >
          <X className='h-8 w-8' />
          <p className='mt-2 text-sm font-bold'>HATE</p>
        </motion.div>

        <motion.div
          className='absolute right-6 top-12 rounded-2xl border-4 border-green-500 bg-green-500/30 p-6 text-white backdrop-blur-sm'
          style={{
            opacity: useTransform(x, [0, 50, 200], [0, 0.5, 1]),
            scale: useTransform(x, [0, 50, 200], [0.5, 0.8, 1])
          }}
        >
          <Heart className='h-8 w-8' />
          <p className='mt-2 text-sm font-bold'>LOVE</p>
        </motion.div>
      </div>

      {/* Compact Content */}
      <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
        {/* Poster and Title */}
        <div className='flex items-end gap-3'>
          <div className='relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 shadow-lg dark:bg-gray-700'>
            <img
              src={posterUrl}
              alt={media.title}
              className='h-full w-full object-cover'
              onError={(e) => {
                console.log(
                  'Swipe poster failed to load:',
                  e.currentTarget.src
                );
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            <div
              className='absolute inset-0 items-center justify-center bg-gray-200 dark:bg-gray-700'
              style={{ display: 'none' }}
            >
              <div className='text-lg text-gray-500 dark:text-gray-400'>🎬</div>
            </div>
          </div>

          <div className='min-w-0 flex-1'>
            <h2 className='mb-1 truncate text-lg font-bold'>{media.title}</h2>
            <div className='flex items-center gap-2 text-sm text-gray-300'>
              <span className='font-semibold capitalize'>
                {media.mediaType}
              </span>
              {media.releaseDate && (
                <>
                  <span>•</span>
                  <span className='font-medium'>
                    {new Date(media.releaseDate).getFullYear()}
                  </span>
                </>
              )}
              {media.voteAverage > 0 && (
                <>
                  <span>•</span>
                  <span className='font-medium'>
                    ⭐ {media.voteAverage.toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compact Overview */}
        {media.overview && (
          <p className='line-clamp-2 mt-2 text-sm leading-relaxed text-gray-200'>
            {media.overview}
          </p>
        )}

        {/* Compact AI Recommendation Info */}
        {media.reason && media.confidence && (
          <div className='mt-2 rounded-lg bg-white/20 p-2 backdrop-blur-sm'>
            <div className='mb-1 flex items-center gap-1'>
              <Sparkles className='h-3 w-3 text-amber-400' />
              <span className='text-xs font-bold text-amber-300'>
                AI ({Math.round(media.confidence * 100)}%)
              </span>
            </div>
            <p className='line-clamp-1 text-xs text-gray-200'>{media.reason}</p>
          </div>
        )}
      </div>

      {/* Compact Action Buttons */}
      {isActive && (
        <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3'>
          <button
            onClick={() => handleButtonClick('left')}
            className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-red-600'
          >
            <X className='h-5 w-5' />
          </button>

          <button
            onClick={() => handleButtonClick('middle')}
            className='flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-yellow-600'
          >
            <Meh className='h-5 w-5' />
          </button>

          <button
            onClick={() => handleButtonClick('right')}
            className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-green-600'
          >
            <Heart className='h-5 w-5' />
          </button>

          <button
            onClick={() => setShowSocialShare(true)}
            className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-600'
          >
            <Share2 className='h-5 w-5' />
          </button>
        </div>
      )}

      {/* Social Share Modal */}
      {showSocialShare && (
        <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                Share &ldquo;{media.title}&rdquo;
              </h3>
              <button
                onClick={() => setShowSocialShare(false)}
                className='rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <SocialShare
              title={`Check out "${media.title}" on Buzzwin!`}
              description={`${
                media.overview || 'A great show/movie to watch!'
              } - Discover more with AI-powered recommendations!`}
              url={typeof window !== 'undefined' ? window.location.href : ''}
              hashtags={[
                'Buzzwin',
                media.mediaType === 'movie' ? 'Movies' : 'TVShows',
                'AIRecommendations'
              ]}
              showTitle={false}
              size='sm'
              variant='default'
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
