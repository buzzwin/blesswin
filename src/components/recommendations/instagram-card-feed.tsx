import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, X, ShoppingCart, ExternalLink, Sparkles, Film, Book, Music, Gamepad2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { ImageWithFallback } from '@components/ui/image-with-fallback';
import { Button } from '@components/ui/button-shadcn';
import type { RecommendationItem, PreferenceType, ItemType } from '@lib/types/recommendation-item';

interface InstagramCardFeedProps {
  items: RecommendationItem[];
  onPreferenceChange?: (itemId: string, preference: PreferenceType) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const getItemIcon = (itemType: ItemType) => {
  switch (itemType) {
    case 'movie':
    case 'tv':
      return Film;
    case 'product':
      return ShoppingCart;
    case 'book':
      return Book;
    case 'music':
      return Music;
    case 'game':
      return Gamepad2;
    default:
      return Package;
  }
};

export function InstagramCardFeed({
  items,
  onPreferenceChange,
  onLoadMore,
  hasMore = false,
  loading = false
}: InstagramCardFeedProps): JSX.Element {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Map<string, PreferenceType>>(new Map());
  const [visibleItems, setVisibleItems] = useState<RecommendationItem[]>(items);

  useEffect(() => {
    setVisibleItems(items);
  }, [items]);

  const handlePreference = useCallback(async (itemId: string, preference: PreferenceType) => {
    if (!user) {
      toast.error('Please sign in to like or dislike items');
      return;
    }

    setPreferences((prev) => {
      const newMap = new Map(prev);
      newMap.set(itemId, preference);
      return newMap;
    });

    // Remove item from feed after preference
    setVisibleItems((prev) => prev.filter((item) => item.id !== itemId));

    if (onPreferenceChange) {
      onPreferenceChange(itemId, preference);
    }

    // Save preference to backend
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          itemId,
          itemType: items.find((i) => i.id === itemId)?.itemType,
          preference
        })
      });
    } catch (error) {
      console.error('Failed to save preference:', error);
    }

    toast.success(preference === 'like' ? 'Added to your likes!' : 'Noted your preference');
  }, [user, items, onPreferenceChange]);

  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasMore && !loading) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loading]);

  if (loading && visibleItems.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent'></div>
          <p className='text-gray-600 dark:text-gray-400'>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Sparkles className='mx-auto mb-4 h-12 w-12 text-purple-500' />
          <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
            All caught up!
          </h3>
          <p className='mb-4 text-gray-600 dark:text-gray-400'>
            We're finding more recommendations based on your preferences.
          </p>
          {hasMore && (
            <Button onClick={handleLoadMore} disabled={loading}>
              Load More
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-2xl space-y-6 pb-8'>
      {visibleItems.map((item, index) => {
        const ItemIcon = getItemIcon(item.itemType);
        const currentPreference = preferences.get(item.id);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className='overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800'
          >
            {/* Header */}
            <div className='flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500'>
                <ItemIcon className='h-5 w-5 text-white' />
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>
                    {item.title}
                  </h3>
                  {item.confidence && (
                    <div className='flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 dark:bg-purple-900/30'>
                      <Sparkles className='h-3 w-3 text-purple-600 dark:text-purple-400' />
                      <span className='text-xs font-medium text-purple-700 dark:text-purple-300'>
                        {Math.round(item.confidence * 100)}% match
                      </span>
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                  <span className='capitalize'>{item.itemType}</span>
                  {item.brand && (
                    <>
                      <span>•</span>
                      <span>{item.brand}</span>
                    </>
                  )}
                  {item.releaseDate && (
                    <>
                      <span>•</span>
                      <span>{new Date(item.releaseDate).getFullYear()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Image */}
            <div className='relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-900'>
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.title}
                width={600}
                height={600}
                className='h-full w-full object-cover'
                fallback='/api/placeholder/600/600'
              />
              {item.reason && (
                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                  <p className='text-sm text-white'>{item.reason}</p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className='p-4'>
              {item.description && (
                <p className='mb-3 line-clamp-3 text-sm text-gray-700 dark:text-gray-300'>
                  {item.description}
                </p>
              )}

              {/* Metadata */}
              <div className='mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                {item.genres && item.genres.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {item.genres.slice(0, 3).map((genre, idx) => (
                      <span
                        key={idx}
                        className='rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700'
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                {item.voteAverage && (
                  <span className='flex items-center gap-1'>
                    ⭐ {item.voteAverage.toFixed(1)}
                  </span>
                )}
                {item.price && (
                  <span className='font-semibold text-green-600 dark:text-green-400'>
                    {item.price}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className='flex items-center gap-2'>
                <Button
                  variant={currentPreference === 'like' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handlePreference(item.id, 'like')}
                  className={`flex-1 ${
                    currentPreference === 'like'
                      ? 'bg-green-500 hover:bg-green-600'
                      : ''
                  }`}
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      currentPreference === 'like' ? 'fill-current' : ''
                    }`}
                  />
                  Like
                </Button>
                <Button
                  variant={currentPreference === 'dislike' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handlePreference(item.id, 'dislike')}
                  className={`flex-1 ${
                    currentPreference === 'dislike'
                      ? 'bg-red-500 hover:bg-red-600'
                      : ''
                  }`}
                >
                  <X className='mr-2 h-4 w-4' />
                  Pass
                </Button>
                {item.productUrl && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => window.open(item.productUrl, '_blank')}
                  >
                    <ExternalLink className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Load More */}
      {hasMore && (
        <div className='flex justify-center pt-4'>
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant='outline'
            className='w-full max-w-xs'
          >
            {loading ? 'Loading...' : 'Load More Recommendations'}
          </Button>
        </div>
      )}
    </div>
  );
}

