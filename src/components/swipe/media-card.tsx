import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { X, Heart, Meh, Sparkles } from 'lucide-react';
import type { MediaCard } from '@lib/types/rating';
import { getTMDBImageUrl } from '@lib/utils';
import { FallbackImage } from '@components/ui/fallback-image';

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
  const backdropUrl = getTMDBImageUrl(media.backdropPath, 'w780');
  const posterUrl = getTMDBImageUrl(media.posterPath, 'w154');

  return (
    <motion.div
      className='relative h-full w-full overflow-hidden rounded-2xl bg-gray-900 shadow-2xl'
      style={{ x, y, rotate, opacity }}
      drag={isActive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
    >
      {/* Backdrop Image */}
      <div className='absolute inset-0'>
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt={media.title}
            layout='fill'
            className='object-cover'
            sizes='100vw'
          />
        ) : (
          <div className='h-full w-full bg-gradient-to-br from-gray-800 to-gray-900' />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
      </div>

      {/* Swipe Indicators */}
      <div className='pointer-events-none absolute inset-0'>
        <motion.div
          className='absolute left-4 top-8 rounded-lg border-4 border-red-500 bg-red-500/20 p-4 text-white'
          style={{
            opacity: useTransform(x, [-200, -50, 0], [1, 0.5, 0]),
            scale: useTransform(x, [-200, -50, 0], [1, 0.8, 0.5])
          }}
        >
          <X className='h-8 w-8' />
          <p className='mt-2 text-sm font-bold'>HATE</p>
        </motion.div>

        <motion.div
          className='absolute right-4 top-8 rounded-lg border-4 border-green-500 bg-green-500/20 p-4 text-white'
          style={{
            opacity: useTransform(x, [0, 50, 200], [0, 0.5, 1]),
            scale: useTransform(x, [0, 50, 200], [0.5, 0.8, 1])
          }}
        >
          <Heart className='h-8 w-8' />
          <p className='mt-2 text-sm font-bold'>LOVE</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
        {/* Poster and Title */}
        <div className='flex items-end gap-4'>
          {posterUrl ? (
            <div className='relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-lg'>
              <Image
                src={posterUrl}
                alt={media.title}
                layout='fill'
                className='object-cover'
                sizes='64px'
              />
            </div>
          ) : (
            <FallbackImage
              mediaType={media.mediaType}
              className='h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-lg'
            />
          )}

          <div className='min-w-0 flex-1'>
            <h2 className='mb-1 truncate text-xl font-bold'>{media.title}</h2>
            <div className='flex items-center gap-2 text-sm text-gray-300'>
              <span className='capitalize'>{media.mediaType}</span>
              {media.releaseDate && (
                <>
                  <span>•</span>
                  <span>{new Date(media.releaseDate).getFullYear()}</span>
                </>
              )}
              {media.voteAverage > 0 && (
                <>
                  <span>•</span>
                  <span>⭐ {media.voteAverage.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overview */}
        {media.overview && (
          <p className='line-clamp-3 mt-3 text-sm text-gray-200'>
            {media.overview}
          </p>
        )}

        {/* Genres */}
        {media.genres && media.genres.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {media.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className='rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm'
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* AI Recommendation Info */}
        {media.reason && media.confidence && (
          <div className='mt-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-3 backdrop-blur-sm'>
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='h-4 w-4 text-amber-400' />
              <span className='text-xs font-semibold text-amber-300'>
                AI Recommendation ({Math.round(media.confidence * 100)}% match)
              </span>
            </div>
            <p className='text-xs text-gray-200 line-clamp-2'>
              {media.reason}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isActive && (
        <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-4'>
          <button
            onClick={() => handleButtonClick('left')}
            className='flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600'
          >
            <X className='h-6 w-6' />
          </button>

          <button
            onClick={() => handleButtonClick('middle')}
            className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-yellow-600'
          >
            <Meh className='h-6 w-6' />
          </button>

          <button
            onClick={() => handleButtonClick('right')}
            className='flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-green-600'
          >
            <Heart className='h-6 w-6' />
          </button>
        </div>
      )}
    </motion.div>
  );
}
