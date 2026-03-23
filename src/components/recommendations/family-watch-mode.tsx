import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, Smile, Calendar, Moon, Film } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { ImageWithFallback } from '@components/ui/image-with-fallback';
import { BounceButton } from '@components/animations/bounce-button';
import { cn } from '@lib/utils';

interface MoodRecommendation {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  reason: string;
  runtime?: number;
  episodeRuntime?: number;
  rating?: string;
  genres?: string[];
}

type MoodType = 'family-night' | 'light-relief' | 'teen-safe' | 'date-night' | 'solo-chill';

interface MoodOption {
  id: MoodType;
  label: string;
  icon: JSX.Element;
  description: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  {
    id: 'family-night',
    label: 'Family Night',
    icon: <Users className='h-5 w-5' />,
    description: '20–30 min shows we can watch together tonight',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'light-relief',
    label: 'Light Relief',
    icon: <Smile className='h-5 w-5' />,
    description: 'Something light after a hard day',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'teen-safe',
    label: 'Teen Safe',
    icon: <Heart className='h-5 w-5' />,
    description: 'Teen-safe but not boring',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'date-night',
    label: 'Date Night',
    icon: <Calendar className='h-5 w-5' />,
    description: 'Perfect for couples',
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'solo-chill',
    label: 'Solo Chill',
    icon: <Moon className='h-5 w-5' />,
    description: 'Just for me',
    color: 'from-indigo-500 to-purple-600'
  }
];

export function FamilyWatchMode(): JSX.Element {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [recommendations, setRecommendations] = useState<MoodRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (mood: MoodType): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to get recommendations');
      return;
    }

    setLoading(true);
    setSelectedMood(mood);
    
    try {
      const response = await fetch('/api/mood-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mood,
          context: moodOptions.find(m => m.id === mood)?.description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching mood recommendations:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (posterPath: string): string => {
    if (!posterPath || posterPath.startsWith('/api/placeholder')) {
      return '/api/placeholder/154/231';
    }
    if (posterPath.startsWith('http')) {
      return posterPath;
    }
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const formatRuntime = (rec: MoodRecommendation): string => {
    if (rec.mediaType === 'tv' && rec.episodeRuntime) {
      return `${rec.episodeRuntime} min/episode`;
    }
    if (rec.runtime) {
      return `${rec.runtime} min`;
    }
    return '';
  };

  return (
    <div className='rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6'>
      <div className='mb-4'>
        <div className='mb-2 flex items-center gap-2'>
          <Film className='h-5 w-5 text-purple-600 dark:text-purple-400' />
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Family Watch Mode 🎬
          </h2>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Curate by mood, not catalog. Get fewer, better recommendations.
        </p>
      </div>

      {/* Mood Selection */}
      <div className='mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5'>
        {moodOptions.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => void fetchRecommendations(mood.id)}
            disabled={loading}
            className={cn(
              'relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all',
              selectedMood === mood.id
                ? `border-purple-500 bg-gradient-to-br ${mood.color} shadow-lg text-white`
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className={cn(
              'mb-2',
              selectedMood === mood.id ? 'text-white' : 'text-gray-900 dark:text-white'
            )}>
              {mood.icon}
            </div>
            <div className={cn(
              'text-sm font-semibold',
              selectedMood === mood.id ? 'text-white' : 'text-gray-900 dark:text-white'
            )}>
              {mood.label}
            </div>
            <div className={cn(
              'mt-1 text-xs',
              selectedMood === mood.id ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
            )}>
              {mood.description}
            </div>
            {selectedMood === mood.id && loading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Recommendations */}
      <AnimatePresence mode='wait'>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='space-y-4'
          >
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {moodOptions.find(m => m.id === selectedMood)?.label} Picks
            </h3>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.tmdbId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className='group cursor-pointer space-y-2'
                >
                  <div className='relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700'>
                    <ImageWithFallback
                      src={getImageUrl(rec.posterPath)}
                      alt={rec.title}
                      width={154}
                      height={231}
                      className='h-48 w-full object-cover transition-transform group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                    <div className='absolute bottom-2 left-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
                      <p className='text-xs font-medium text-white line-clamp-2'>
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className='text-sm font-semibold text-gray-900 dark:text-white line-clamp-1'>
                      {rec.title}
                    </h4>
                    <div className='mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400'>
                      {rec.mediaType === 'tv' ? (
                        <span className='rounded bg-blue-100 px-1.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                          TV
                        </span>
                      ) : (
                        <span className='rounded bg-purple-100 px-1.5 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
                          Movie
                        </span>
                      )}
                      {formatRuntime(rec) && (
                        <span>{formatRuntime(rec)}</span>
                      )}
                      {rec.rating && (
                        <span className='rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700'>
                          {rec.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedMood && recommendations.length === 0 && !loading && (
        <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
          <p>No recommendations found. Try selecting a different mood.</p>
        </div>
      )}
    </div>
  );
}
