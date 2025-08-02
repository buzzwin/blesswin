import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { useRouter } from 'next/router';
import { SEO } from '@components/common/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
import { ArrowLeft, Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

interface Analysis {
  preferredGenres: string[];
  preferredYears: string[];
  ratingPattern: string;
  suggestions: string[];
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  analysis: Analysis;
  cached?: boolean;
  createdAt?: Date;
  expiresAt?: Date;
}

export default function Recommendations(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] =
    useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      void router.push('/login');
      return;
    }

    void fetchRecommendations();
  }, [user?.id, router]);

  const fetchRecommendations = async (forceRefresh = false): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          forceRefresh
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = (await response.json()) as RecommendationsResponse;
      setRecommendations(data);

      if (data.cached) {
        toast.success('Showing cached recommendations (3 days old or newer)');
      } else {
        toast.success('Generated fresh AI recommendations!');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = (): void => {
    void router.push('/');
  };

  if (!user) {
    return <div />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
      <SEO title='AI Recommendations / Buzzwin' />

      {/* Header - Desktop Only */}
      <header className='sticky top-0 z-50 hidden border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 md:block'>
        <div className='mx-auto max-w-7xl px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleBack}
                className='p-2'
              >
                <ArrowLeft className='h-5 w-5' />
              </Button>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-6 w-6 text-amber-500' />
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                  AI Recommendations
                </h1>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => fetchRecommendations(false)}
                disabled={loading}
                className='border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
              >
                <TrendingUp className='mr-2 h-4 w-4' />
                Refresh
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => fetchRecommendations(true)}
                disabled={loading}
                className='border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'
              >
                <Sparkles className='mr-2 h-4 w-4' />
                Force Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className='px-4 py-4 md:hidden'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBack}
              className='p-2'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-amber-500' />
              <h1 className='text-lg font-bold text-gray-900 dark:text-white'>
                AI Recommendations
              </h1>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => fetchRecommendations(false)}
            disabled={loading}
            className='border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
          >
            <TrendingUp className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className='mx-auto max-w-7xl px-6 py-8'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mb-4 flex justify-center'>
                <Sparkles className='h-12 w-12 animate-pulse text-amber-500' />
              </div>
              <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
                Analyzing your preferences...
              </h2>
              <p className='text-gray-600 dark:text-gray-400'>
                Our AI is learning from your ratings to find perfect
                recommendations
              </p>
            </div>
          </div>
        ) : recommendations ? (
          <div className='space-y-8'>
            {/* Analysis Section */}
            <Card className='border-amber-200 bg-white shadow-lg dark:border-amber-800/30 dark:bg-gray-800'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2 text-gray-900 dark:text-white'>
                    <Star className='h-5 w-5 text-amber-500' />
                    Your Taste Analysis
                  </CardTitle>
                  {recommendations.cached && (
                    <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                      <Clock className='h-3 w-3' />
                      <span>
                        Cached • Expires{' '}
                        {recommendations.expiresAt
                          ? new Date(
                              recommendations.expiresAt
                            ).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                      Preferred Genres
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {recommendations.analysis.preferredGenres.map(
                        (genre, index) => (
                          <span
                            key={index}
                            className='rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          >
                            {genre}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                      Preferred Years
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {recommendations.analysis.preferredYears.map(
                        (year, index) => (
                          <span
                            key={index}
                            className='rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          >
                            {year}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                    Rating Pattern
                  </h4>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {recommendations.analysis.ratingPattern}
                  </p>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                    Suggestions
                  </h4>
                  <ul className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                    {recommendations.analysis.suggestions.map(
                      (suggestion, index) => (
                        <li key={index} className='flex items-start gap-2'>
                          <span className='mt-1 h-1.5 w-1.5 rounded-full bg-amber-500' />
                          {suggestion}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Section */}
            <div>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <Sparkles className='h-6 w-6 text-amber-500' />
                Personalized Recommendations
              </h2>
              <RecommendationsCard />
            </div>
          </div>
        ) : (
          <div className='py-12 text-center'>
            <div className='mb-4 flex justify-center'>
              <Sparkles className='h-12 w-12 text-amber-500' />
            </div>
            <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
              No recommendations yet
            </h2>
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              Start rating shows and movies to get personalized AI
              recommendations
            </p>
            <Button
              onClick={() => router.push('/swipe')}
              className='bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
            >
              <Clock className='mr-2 h-4 w-4' />
              Rate Some Shows
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
