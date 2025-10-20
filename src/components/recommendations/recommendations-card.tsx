import { useState, useEffect } from 'react';
import { Brain, Sparkles, RefreshCw, Star, Calendar, Film } from 'lucide-react';
import Link from 'next/link';
import { useRecommendations } from '@lib/hooks/useRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { ImageWithFallback } from '@components/ui/image-with-fallback';
import { SimpleSocialShare as SocialShare } from '@components/share/simple-social-share';

interface Recommendation {
  tmdbId: string;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string;
  reason: string;
  confidence: number;
  genre: string;
  year: string;
}

interface RecommendationsCardProps {
  refreshKey?: number;
}

export function RecommendationsCard({
  refreshKey
}: RecommendationsCardProps): JSX.Element {
  const { recommendations, analysis, loading, error, refetch } =
    useRecommendations();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);

  // Refresh recommendations when refreshKey changes
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      void refetch();
    }
  }, [refreshKey, refetch]);

  const handleImageError = (imageUrl: string) => {
    // console.error('Failed to load image:', imageUrl);
  };

  if (loading) {
    return (
      <Card className='border border-gray-200 dark:border-gray-700'>
        <CardContent className='p-6 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white'></div>
          </div>
          <h4 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
            Analyzing Your Preferences...
          </h4>
          <p className='text-xs text-gray-600 dark:text-gray-400'>
            Our AI is learning from your ratings to provide personalized
            recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='border border-red-200 dark:border-red-800'>
        <CardContent className='p-6 text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
            <Brain className='h-6 w-6 text-red-600 dark:text-red-400' />
          </div>
          <h4 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
            Unable to Load Recommendations
          </h4>
          <p className='mb-4 text-xs text-gray-600 dark:text-gray-400'>
            {error}
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => void refetch()}
            className='border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className='border border-gray-200 dark:border-gray-700'>
        <CardContent className='p-6 text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
            <Brain className='h-6 w-6 text-gray-400' />
          </div>
          <h4 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
            AI-Powered Recommendations
          </h4>
          <p className='mb-4 text-xs text-gray-600 dark:text-gray-400'>
            {analysis?.suggestions?.[0] ??
              'Start rating shows and movies to get AI-powered recommendations!'}
          </p>
          <Link href='/swipe'>
            <Button
              variant='outline'
              size='sm'
              className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
            >
              <Sparkles className='mr-2 h-4 w-4' />
              Start Rating
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-3'>
      {/* Compact AI Analysis Section */}
      {analysis && (
        <div className='rounded-lg bg-gray-50 p-3 dark:bg-gray-800'>
          <div className='mb-2 flex items-center gap-2'>
            <Brain className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            <h4 className='text-xs font-semibold text-gray-900 dark:text-white'>
              AI Insights
            </h4>
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400'>
            {analysis.ratingPattern}
          </p>
          {analysis.preferredGenres.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {analysis.preferredGenres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className='rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compact Recommendations List */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='text-xs font-semibold text-gray-900 dark:text-white'>
            Recommendations
          </h4>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => void refetch()}
            className='h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          >
            <RefreshCw className='h-3 w-3' />
          </Button>
        </div>

        <div className='space-y-2'>
          {recommendations.slice(0, 3).map((recommendation, index) => (
            <div
              key={index}
              className='group cursor-pointer rounded-lg border border-gray-200 bg-white p-2 transition-all duration-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
              onClick={() => setSelectedRecommendation(recommendation)}
            >
              <div className='flex gap-2'>
                <div className='relative h-12 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-200 dark:bg-gray-700'>
                  <img
                    src={`https://image.tmdb.org/t/p/w154${recommendation.posterPath}`}
                    alt={recommendation.title}
                    className='h-full w-full object-cover'
                    onError={(e) => {
                      console.log('Image failed to load:', e.currentTarget.src);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget
                        .nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className='absolute inset-0 hidden items-center justify-center bg-gray-200 dark:bg-gray-700'
                    style={{ display: 'none' }}
                  >
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      📽️
                    </div>
                  </div>
                </div>
                <div className='min-w-0 flex-1'>
                  <h5 className='line-clamp-1 text-xs font-medium text-gray-900 dark:text-white'>
                    {recommendation.title}
                  </h5>
                  <div className='mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                    <span className='font-medium'>
                      {recommendation.mediaType === 'movie' ? 'Movie' : 'TV'}
                    </span>
                    <span>•</span>
                    <span>{recommendation.year}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='flex-1 rounded-full bg-gray-200 dark:bg-gray-600'>
                      <div
                        className='h-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500'
                        style={{
                          width: `${Math.round(
                            recommendation.confidence * 100
                          )}%`
                        }}
                      />
                    </div>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {Math.round(recommendation.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 3 && (
          <div className='text-center'>
            <Link href='/recommendations'>
              <Button
                variant='outline'
                size='sm'
                className='h-7 border-gray-300 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
              >
                View All
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Simple Recommendation Detail Modal */}
      {selectedRecommendation && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800'>
            <div className='mb-4 flex items-start gap-4'>
              <div className='relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-200 dark:bg-gray-700'>
                <img
                  src={`https://image.tmdb.org/t/p/w154${selectedRecommendation.posterPath}`}
                  alt={selectedRecommendation.title}
                  className='h-full w-full object-cover'
                  onError={(e) => {
                    console.log(
                      'Modal image failed to load:',
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
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    📽️
                  </div>
                </div>
              </div>
              <div className='min-w-0 flex-1'>
                <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                  {selectedRecommendation.title}
                </h3>
                <div className='mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                  <span>
                    {selectedRecommendation.mediaType === 'movie'
                      ? 'Movie'
                      : 'TV'}
                  </span>
                  <span>•</span>
                  <span>{selectedRecommendation.year}</span>
                  <span>•</span>
                  <span>{selectedRecommendation.genre}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex-1 rounded-full bg-gray-200 dark:bg-gray-600'>
                    <div
                      className='h-1 rounded-full bg-gray-600 dark:bg-gray-400'
                      style={{
                        width: `${Math.round(
                          selectedRecommendation.confidence * 100
                        )}%`
                      }}
                    />
                  </div>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    {Math.round(selectedRecommendation.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className='mb-4'>
              <h4 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Why This is Recommended
              </h4>
              <p className='rounded bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                {selectedRecommendation.reason}
              </p>
            </div>

            <div className='space-y-3'>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => setSelectedRecommendation(null)}
                >
                  Close
                </Button>
                <Link href={`/swipe?tmdbId=${selectedRecommendation.tmdbId}`}>
                  <Button className='flex-1 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'>
                    Rate This
                  </Button>
                </Link>
              </div>

              {/* Compact Social Share */}
              <div className='border-t border-gray-200 pt-2 dark:border-gray-700'>
                <SocialShare
                  title={`Check out "${selectedRecommendation.title}" recommended by Buzzwin AI!`}
                  description={`${selectedRecommendation.reason} - Discover more AI-powered recommendations!`}
                  url={
                    typeof window !== 'undefined' ? window.location.href : ''
                  }
                  hashtags={[
                    'Buzzwin',
                    'AIRecommendations',
                    selectedRecommendation.mediaType === 'movie'
                      ? 'Movies'
                      : 'TVShows'
                  ]}
                  showTitle={false}
                  size='sm'
                  variant='compact'
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
