import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { NextImage } from '@components/ui/next-image';
import { useRecommendations } from '@lib/hooks/useRecommendations';
import { Brain, Sparkles, RefreshCw, Star, Calendar, Film } from 'lucide-react';
import Link from 'next/link';

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

export function RecommendationsCard(): JSX.Element {
  const { recommendations, analysis, loading, error, cached, refetch } =
    useRecommendations();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);

  const handleImageError = (imageUrl: string) => {
    console.error('Failed to load image:', imageUrl);
  };

  if (loading) {
    return (
      <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Brain className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            <CardTitle className='text-lg'>AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='py-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
            <Brain className='h-8 w-8 animate-pulse text-purple-600 dark:text-purple-400' />
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
      <Card className='border-red-200 bg-white shadow-lg dark:border-red-800/30 dark:bg-gray-800'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Brain className='h-5 w-5 text-red-600 dark:text-red-400' />
            <CardTitle className='text-lg'>AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='py-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
            <Brain className='h-8 w-8 text-red-600 dark:text-red-400' />
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
      <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Brain className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            <CardTitle className='text-lg'>AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='py-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
            <Brain className='h-8 w-8 text-purple-600 dark:text-purple-400' />
          </div>
          <h4 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
            AI-Powered Recommendations
          </h4>
          <p className='mb-4 text-xs text-gray-600 dark:text-gray-400'>
            {analysis?.suggestions?.[0] ||
              'Start rating shows and movies to get AI-powered recommendations!'}
          </p>
          <Link href='/swipe'>
            <Button
              variant='outline'
              size='sm'
              className='border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
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
    <div className='space-y-4'>
      {/* AI Analysis Section */}
      {analysis && (
        <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Brain className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              <CardTitle className='text-lg'>AI Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <h5 className='mb-1 flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white'>
                <Sparkles className='h-3 w-3 text-yellow-500' />
                AI Insights
              </h5>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                {analysis.ratingPattern}
              </p>
            </div>

            {analysis.preferredGenres.length > 0 && (
              <div>
                <h5 className='mb-1 text-sm font-medium text-gray-900 dark:text-white'>
                  AI-Detected Preferences
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

      {/* AI Recommendations Section */}
      <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Brain className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              <CardTitle className='text-lg'>AI Recommendations</CardTitle>
              {cached && (
                <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300'>
                  Cached
                </span>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => void refetch()}
              className='text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='scrollbar-hide flex gap-4 overflow-x-auto pb-2'>
            {recommendations.slice(0, 4).map((recommendation, index) => (
              <div
                key={index}
                className='group flex-shrink-0 cursor-pointer rounded-lg border border-gray-200 p-3 transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:hover:border-purple-600'
                style={{ minWidth: '260px', maxWidth: '260px' }}
                onClick={() => setSelectedRecommendation(recommendation)}
              >
                <div className='flex gap-3'>
                  <div className='relative h-16 w-12 flex-shrink-0 overflow-hidden rounded'>
                    <NextImage
                      src={`https://image.tmdb.org/t/p/w92${recommendation.posterPath}`}
                      alt={recommendation.title}
                      width={48}
                      height={64}
                      className='h-full w-full object-cover'
                      onError={() =>
                        handleImageError(recommendation.posterPath)
                      }
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='line-clamp-1 mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                      {recommendation.title}
                    </h4>
                    <div className='mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400'>
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
                className='border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
              >
                View All Recommendations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='relative h-20 w-14 overflow-hidden rounded'>
                <NextImage
                  src={`https://image.tmdb.org/t/p/w154${selectedRecommendation.posterPath}`}
                  alt={selectedRecommendation.title}
                  width={56}
                  height={80}
                  className='h-full w-full object-cover'
                  onError={() =>
                    handleImageError(selectedRecommendation.posterPath)
                  }
                />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {selectedRecommendation.title}
                </h3>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <span>
                    {selectedRecommendation.mediaType === 'movie'
                      ? 'Movie'
                      : 'TV Show'}
                  </span>
                  <span>•</span>
                  <span>{selectedRecommendation.year}</span>
                  <span>•</span>
                  <span>{selectedRecommendation.genre}</span>
                </div>
              </div>
            </div>

            <div className='mb-4'>
              <h4 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Why This is Recommended
              </h4>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {selectedRecommendation.reason}
              </p>
            </div>

            <div className='mb-4'>
              <h4 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                AI Confidence
              </h4>
              <div className='flex items-center gap-2'>
                <div className='flex-1 rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-2 rounded-full bg-purple-600'
                    style={{
                      width: `${Math.round(
                        selectedRecommendation.confidence * 100
                      )}%`
                    }}
                  />
                </div>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  {Math.round(selectedRecommendation.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => setSelectedRecommendation(null)}
              >
                Close
              </Button>
              <Link href={`/swipe?tmdbId=${selectedRecommendation.tmdbId}`}>
                <Button className='flex-1 bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'>
                  Rate This
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
