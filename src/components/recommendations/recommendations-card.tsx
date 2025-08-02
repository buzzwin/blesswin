import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { Loading } from '@components/ui/loading';
import {
  RefreshCw,
  TrendingUp,
  Film,
  Tv,
  Star,
  Brain,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useRecommendations } from '@lib/hooks/useRecommendations';
import { getTMDBImageUrl } from '@lib/utils';
import { FallbackImage } from '@components/ui/fallback-image';

export function RecommendationsCard(): JSX.Element {
  const { recommendations, loading, error, refetch } = useRecommendations();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setImageErrors((prev) => new Set(prev).add(imageUrl));
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
          <Loading className='mx-auto mb-4 h-8 w-8 text-purple-600 dark:text-purple-400' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            AI is analyzing your preferences...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Brain className='h-5 w-5 text-purple-600 dark:text-purple-400' />
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

  if (!recommendations || recommendations.recommendations.length === 0) {
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
            {recommendations?.analysis?.suggestions?.[0] ||
              'Start rating shows and movies to get AI-powered recommendations!'}
          </p>
          <Button
            variant='outline'
            size='sm'
            className='border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
          >
            <Sparkles className='mr-2 h-4 w-4' />
            Start Rating
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* AI Analysis Section */}
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
              {recommendations.analysis.ratingPattern}
            </p>
          </div>

          {recommendations.analysis.preferredGenres.length > 0 && (
            <div>
              <h5 className='mb-1 text-sm font-medium text-gray-900 dark:text-white'>
                AI-Detected Preferences
              </h5>
              <div className='flex flex-wrap gap-1'>
                {recommendations.analysis.preferredGenres
                  .slice(0, 3)
                  .map((genre, index) => (
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

      {/* AI Recommendations Section */}
      <Card className='border-purple-200 bg-white shadow-lg dark:border-purple-800/30 dark:bg-gray-800'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Brain className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              <CardTitle className='text-lg'>AI Recommendations</CardTitle>
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
        <CardContent className='space-y-3'>
          {recommendations.recommendations.slice(0, 3).map((rec, index) => {
            const imageUrl = getTMDBImageUrl(rec.posterPath, 'w92');
            const hasImageError = imageUrl ? imageErrors.has(imageUrl) : true;

            return (
              <div
                key={rec.tmdbId}
                className='flex gap-3 rounded-lg border border-purple-100 p-3 transition-colors hover:bg-purple-50 dark:border-purple-800/30 dark:hover:bg-purple-900/10'
              >
                {/* Poster */}
                <div className='relative h-16 w-12 flex-shrink-0'>
                  {imageUrl && !hasImageError ? (
                    <Image
                      src={imageUrl}
                      alt={rec.title}
                      width={48}
                      height={64}
                      className='rounded object-cover'
                      onError={() => handleImageError(imageUrl)}
                    />
                  ) : (
                    <FallbackImage mediaType={rec.mediaType} />
                  )}
                </div>

                {/* Content */}
                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <h4 className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                      {rec.title}
                    </h4>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      ({rec.year})
                    </span>
                  </div>

                  <div className='mb-1 flex items-center gap-2'>
                    <span className='rounded bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'>
                      {rec.genre}
                    </span>
                    <div className='flex items-center gap-1'>
                      <Brain className='h-3 w-3 text-purple-500' />
                      <span className='text-xs text-gray-600 dark:text-gray-400'>
                        {Math.round(rec.confidence * 100)}% AI match
                      </span>
                    </div>
                  </div>

                  <p className='line-clamp-2 text-xs text-gray-600 dark:text-gray-400'>
                    {rec.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
