import { useState, useEffect } from 'react';
import { Brain, Sparkles, RefreshCw, Star, Calendar, Film } from 'lucide-react';
import Link from 'next/link';
import { useRecommendations } from '@lib/hooks/useRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { NextImage } from '@components/ui/next-image';

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

interface MobileRecommendationsCardProps {
  refreshKey?: number;
}

export function MobileRecommendationsCard({
  refreshKey
}: MobileRecommendationsCardProps): JSX.Element {
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

  // Helper function to construct image URL from posterPath
  const getImageUrl = (posterPath: string): string => {
    if (!posterPath) return '/api/placeholder/32/48';

    // If it's already a full URL, return as-is
    if (posterPath.startsWith('http')) {
      return posterPath;
    }

    // If it's a placeholder path, return as-is (it's already a valid relative URL)
    if (posterPath.startsWith('/api/placeholder')) {
      return posterPath;
    }

    // Otherwise, assume it's a TMDB path and construct the full URL
    return `https://image.tmdb.org/t/p/w92${posterPath}`;
  };

  if (loading) {
    return (
      <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <Brain className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            <CardTitle className='text-base'>AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='py-6 text-center'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
            <Brain className='h-6 w-6 animate-pulse text-purple-600 dark:text-purple-400' />
          </div>
          <h4 className='mb-1 text-sm font-medium text-gray-900 dark:text-white'>
            Analyzing Your Preferences...
          </h4>
          <p className='text-xs text-gray-600 dark:text-gray-400'>
            Our AI is learning from your ratings
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='border-red-200 bg-white shadow-lg dark:border-red-800/30 dark:bg-gray-800'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <Brain className='h-4 w-4 text-red-600 dark:text-red-400' />
            <CardTitle className='text-base'>AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='py-6 text-center'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
            <Brain className='h-6 w-6 text-red-600 dark:text-red-400' />
          </div>
          <h4 className='mb-1 text-sm font-medium text-gray-900 dark:text-white'>
            Unable to Load Recommendations
          </h4>
          <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
            {error}
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => void refetch()}
            className='border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20'
          >
            <RefreshCw className='mr-2 h-3 w-3' />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <Brain className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            <CardTitle className='text-base'>AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='py-6 text-center'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
            <Brain className='h-6 w-6 text-purple-600 dark:text-purple-400' />
          </div>
          <h4 className='mb-1 text-sm font-medium text-gray-900 dark:text-white'>
            AI-Powered Recommendations
          </h4>
          <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
            {analysis?.suggestions?.[0] ??
              'Start rating shows and movies to get AI-powered recommendations!'}
          </p>
          <Link href='/swipe'>
            <Button
              variant='outline'
              size='sm'
              className='border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
            >
              <Sparkles className='mr-2 h-3 w-3' />
              Start Rating
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-3'>
      {/* AI Analysis Section - Compact */}
      {analysis && (
        <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
          <CardHeader className='pb-2'>
            <div className='flex items-center gap-2'>
              <Brain className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              <CardTitle className='text-base'>AI Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div>
              <h5 className='mb-1 flex items-center gap-1 text-xs font-medium text-gray-900 dark:text-white'>
                <Sparkles className='h-3 w-3 text-yellow-500' />
                AI Insights
              </h5>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                {analysis.ratingPattern}
              </p>
            </div>

            {analysis.preferredGenres.length > 0 && (
              <div>
                <h5 className='mb-1 text-xs font-medium text-gray-900 dark:text-white'>
                  Your Preferences
                </h5>
                <div className='flex flex-wrap gap-1'>
                  {analysis.preferredGenres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className='inline-block rounded bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations Section - Mobile Optimized */}
      <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Brain className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              <CardTitle className='text-base'>AI Recommendations</CardTitle>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => void refetch()}
              className='text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
            >
              <RefreshCw className='h-3 w-3' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-2'>
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <div
                key={index}
                className='group cursor-pointer rounded-lg border border-gray-200 p-2 transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:hover:border-purple-600'
                onClick={() => setSelectedRecommendation(recommendation)}
              >
                <div className='flex gap-2'>
                  <div className='relative h-12 w-8 flex-shrink-0 overflow-hidden rounded'>
                    <NextImage
                      src={getImageUrl(recommendation.posterPath)}
                      alt={recommendation.title}
                      width={32}
                      height={48}
                      className='h-full w-full object-cover'
                      onError={() =>
                        handleImageError(recommendation.posterPath)
                      }
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='line-clamp-1 mb-1 text-sm font-medium text-gray-900 dark:text-white'>
                      {recommendation.title}
                    </h4>
                    <div className='mb-1 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400'>
                      <div className='flex items-center gap-1'>
                        <Film className='h-3 w-3 flex-shrink-0' />
                        <span className='whitespace-nowrap'>
                          {recommendation.mediaType === 'movie'
                            ? 'Movie'
                            : 'TV Show'}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3 flex-shrink-0' />
                        <span className='whitespace-nowrap'>
                          {recommendation.year}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Star className='h-3 w-3 flex-shrink-0 text-yellow-500' />
                        <span className='whitespace-nowrap'>
                          {Math.round(recommendation.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className='line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400'>
                      {recommendation.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='text-center'>
            <Link href='/recommendations'>
              <Button
                variant='outline'
                size='sm'
                className='w-full border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
              >
                <Sparkles className='mr-2 h-3 w-3' />
                View All Recommendations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
