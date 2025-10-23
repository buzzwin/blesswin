import { useState } from 'react';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { ImageWithFallback } from '@components/ui/image-with-fallback';
import { Calendar, Sparkles, TrendingUp, Film, Star } from 'lucide-react';
import { useUserRecommendations } from '@lib/hooks/useUserRecommendations';
import type { Recommendation } from '@lib/types/recommendation';

interface PastRecommendationsProps {
  userId: string | null;
}

export function PastRecommendations({ userId }: PastRecommendationsProps) {
  const { history, historyLoading, historyError, refreshHistory } =
    useUserRecommendations(userId);
  const [showAll, setShowAll] = useState(false);

  // Convert history to recommendations array
  const recommendations = history;
  const displayedRecommendations = showAll
    ? recommendations
    : recommendations.slice(0, 6);

  if (historyLoading) {
    return (
      <Card className='border-0 bg-card/50 shadow-xl backdrop-blur-sm dark:bg-gray-900/50'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500'></div>
            <span className='ml-3 text-sm text-muted-foreground dark:text-gray-400'>
              Loading your recommendations...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (historyError) {
    return (
      <Card className='border-0 bg-card/50 shadow-xl backdrop-blur-sm dark:bg-gray-900/50'>
        <CardContent className='p-6'>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <TrendingUp className='mb-4 h-12 w-12 text-red-500' />
            <h3 className='mb-2 text-lg font-bold text-foreground dark:text-white'>
              Unable to Load Recommendations
            </h3>
            <p className='mb-4 text-sm text-muted-foreground dark:text-gray-400'>
              {historyError}
            </p>
            <Button
              onClick={refreshHistory}
              className='group rounded-lg border-2 border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-200'
            >
              <TrendingUp className='mr-2 h-4 w-4 group-hover:rotate-180' />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className='border-0 bg-card/50 shadow-xl backdrop-blur-sm dark:bg-gray-900/50'>
        <CardContent className='p-6'>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Sparkles className='mb-4 h-12 w-12 text-blue-500' />
            <h3 className='mb-2 text-lg font-bold text-foreground dark:text-white'>
              No Recommendations Yet
            </h3>
            <p className='text-sm text-muted-foreground dark:text-gray-400'>
              Start rating shows and movies to get personalized recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-0 bg-card/50 shadow-xl backdrop-blur-sm dark:bg-gray-900/50'>
      <CardContent className='p-0'>
        <div className='mb-6 flex items-center justify-between px-6 pt-6'>
          <div className='flex items-center gap-3'>
            <Calendar className='h-6 w-6 text-blue-500' />
            <h3 className='text-xl font-bold text-foreground dark:text-white'>
              Your Recommendations
            </h3>
          </div>
          <p className='text-sm text-muted-foreground dark:text-gray-400'>
            {recommendations.length} unique recommendation
            {recommendations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3'>
          {displayedRecommendations.map((rec, index) => (
            <div
              key={`${rec.tmdbId}-${rec.mediaType}`}
              className='group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-purple-600'
            >
              <div className='flex gap-3'>
                <div className='relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700'>
                  <ImageWithFallback
                    src={`https://image.tmdb.org/t/p/w92${rec.posterPath}`}
                    alt={rec.title}
                    width={48}
                    height={64}
                    className='h-full w-full object-cover'
                    fallback='/api/placeholder/48/64'
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <h4 className='line-clamp-1 text-sm font-medium text-foreground dark:text-white'>
                    {rec.title}
                  </h4>
                  <div className='mb-2 flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400'>
                    <Badge variant='outline' className='text-xs'>
                      {rec.mediaType === 'movie' ? 'Movie' : 'TV'}
                    </Badge>
                    <span>{rec.year}</span>
                  </div>
                  <div className='mb-2 flex items-center gap-1'>
                    <Star className='h-3 w-3 text-yellow-500' />
                    <span className='text-xs text-muted-foreground dark:text-gray-400'>
                      {Math.round(rec.confidence * 100)}% match
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='flex-1 rounded-full bg-gray-200 dark:bg-gray-600'>
                      <div
                        className='h-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500'
                        style={{
                          width: `${Math.round(rec.confidence * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='mt-3'>
                <p className='line-clamp-2 text-xs text-muted-foreground dark:text-gray-300'>
                  {rec.reason}
                </p>
                <div className='mt-2 flex items-center justify-between'>
                  <Badge variant='outline' className='text-xs'>
                    {rec.genre}
                  </Badge>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400'>
                    <Film className='h-3 w-3' />
                    <span>#{index + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 6 && (
          <div className='px-6 pb-6 text-center'>
            <Button
              onClick={() => setShowAll(!showAll)}
              className='h-8 border border-border text-xs text-foreground hover:bg-muted dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
            >
              {showAll
                ? 'Show Less'
                : `Show All ${recommendations.length} Recommendations`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
