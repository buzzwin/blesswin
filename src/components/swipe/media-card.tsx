import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Meh } from 'lucide-react';
import { cn } from '@lib/utils';
import type { MediaCard, RatingType } from '@lib/types/rating';

interface MediaCardProps {
  media: MediaCard;
  onSwipe: (rating: RatingType) => void;
  isActive: boolean;
}

export function SwipeableMediaCard({
  media,
  onSwipe,
  isActive
}: MediaCardProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);

  // Transform hooks for swipe indicators
  const loveOpacity = useTransform(x, [0, 100], [0, 1]);
  const hateOpacity = useTransform(x, [-100, 0], [1, 0]);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any, info: PanInfo): void => {
    setIsDragging(false);
    const swipeThreshold = 100;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'love' : 'hate';
      onSwipe(direction as RatingType);
    } else {
      // Reset position if not swiped far enough
      x.set(0);
      y.set(0);
    }
  };

  const handleButtonClick = (rating: RatingType): void => {
    onSwipe(rating);
  };

  const getRatingIcon = (rating: RatingType) => {
    switch (rating) {
      case 'love':
        return <Heart className='h-8 w-8 fill-red-500 text-red-500' />;
      case 'hate':
        return <X className='h-8 w-8 text-gray-500' />;
      case 'meh':
        return <Meh className='h-8 w-8 text-yellow-500' />;
    }
  };

  const getRatingText = (rating: RatingType) => {
    switch (rating) {
      case 'love':
        return 'Love it!';
      case 'hate':
        return 'Hate it';
      case 'meh':
        return 'Not so much';
    }
  };

  return (
    <div className='relative mx-auto w-full max-w-sm'>
      <motion.div
        ref={cardRef}
        className={cn(
          'relative h-96 w-full cursor-grab overflow-hidden rounded-2xl bg-white shadow-xl active:cursor-grabbing',
          isActive ? 'z-10' : 'z-0'
        )}
        style={{
          x,
          y,
          rotate,
          opacity,
          scale,
          zIndex: isActive ? 10 : 0
        }}
        drag={isActive ? 'x' : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: isActive ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Background Image */}
        <div className='relative h-full w-full'>
          {media.backdropPath && media.backdropPath !== 'null' ? (
            <Image
              src={`https://image.tmdb.org/t/p/original${media.backdropPath}`}
              alt={media.title}
              layout='fill'
              className='object-cover'
              priority
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          ) : (
            <div className='h-full w-full bg-gradient-to-br from-purple-400 to-pink-400' />
          )}

          {/* Gradient Overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

          {/* Content */}
          <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
            {/* Poster and Title */}
            <div className='flex items-end gap-4'>
              {media.posterPath && media.posterPath !== 'null' ? (
                <div className='relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-lg'>
                  <Image
                    src={`https://image.tmdb.org/t/p/w154${media.posterPath}`}
                    alt={media.title}
                    layout='fill'
                    className='object-cover'
                    sizes='64px'
                  />
                </div>
              ) : (
                <div className='relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-300 shadow-lg dark:bg-gray-600' />
              )}

              <div className='min-w-0 flex-1'>
                <h2 className='mb-1 truncate text-xl font-bold'>
                  {media.title}
                </h2>
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
              <div className='mt-3 flex flex-wrap gap-1'>
                {media.genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className='rounded-full bg-white/20 px-2 py-1 text-xs text-white'
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      {isActive && (
        <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-4'>
          <button
            onClick={() => handleButtonClick('hate')}
            className='rounded-full bg-white p-3 shadow-lg transition-shadow hover:shadow-xl'
            disabled={isDragging}
          >
            <X className='h-6 w-6 text-gray-500' />
          </button>

          <button
            onClick={() => handleButtonClick('meh')}
            className='rounded-full bg-white p-3 shadow-lg transition-shadow hover:shadow-xl'
            disabled={isDragging}
          >
            <Meh className='h-6 w-6 text-yellow-500' />
          </button>

          <button
            onClick={() => handleButtonClick('love')}
            className='rounded-full bg-white p-3 shadow-lg transition-shadow hover:shadow-xl'
            disabled={isDragging}
          >
            <Heart className='h-6 w-6 text-red-500' />
          </button>
        </div>
      )}

      {/* Swipe Indicators */}
      {isActive && (
        <>
          {/* Love Indicator */}
          <motion.div
            className='absolute top-4 right-4 rounded-full bg-green-500 px-4 py-2 font-bold text-white opacity-0'
            style={{
              opacity: loveOpacity
            }}
          >
            {getRatingIcon('love')} {getRatingText('love')}
          </motion.div>

          {/* Hate Indicator */}
          <motion.div
            className='absolute top-4 left-4 rounded-full bg-red-500 px-4 py-2 font-bold text-white opacity-0'
            style={{
              opacity: hateOpacity
            }}
          >
            {getRatingIcon('hate')} {getRatingText('hate')}
          </motion.div>
        </>
      )}
    </div>
  );
}
