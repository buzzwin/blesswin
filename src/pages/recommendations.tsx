import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';
import { RecommendationsCard } from '@components/recommendations/recommendations-card';
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
      // console.error('Error fetching recommendations:', error);
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
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <SEO title='AI Recommendations / Buzzwin' />

      {/* Simple Header */}
      <header className='border-b border-gray-200 dark:border-gray-700'>
        <div className='mx-auto max-w-6xl px-4 py-4'>
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
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 dark:bg-white'>
                  <Sparkles className='h-4 w-4 text-white dark:text-gray-900' />
                </div>
                <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
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
                className='hidden sm:flex'
              >
                <TrendingUp className='mr-2 h-4 w-4' />
                Refresh
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => fetchRecommendations(true)}
                disabled={loading}
                className='hidden sm:flex'
              >
                <Sparkles className='mr-2 h-4 w-4' />
                Force Refresh
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => fetchRecommendations(false)}
                disabled={loading}
                className='sm:hidden'
              >
                <TrendingUp className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto max-w-6xl px-4 py-8'>
        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <div className='text-center'>
              <div className='mb-4 flex justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white'></div>
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
            {/* Simple Analysis Section */}
            <Card className='border border-gray-200 dark:border-gray-700'>
              <CardContent className='p-6'>
                <div className='mb-6 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 dark:bg-white'>
                    <Star className='h-5 w-5 text-white dark:text-gray-900' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                      Your Taste Analysis
                    </h2>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      AI insights from your preferences
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                        Preferred Genres
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {recommendations.analysis.preferredGenres.map(
                          (genre, index) => (
                            <span
                              key={index}
                              className='rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            >
                              {genre}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                        Preferred Years
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {recommendations.analysis.preferredYears.map(
                          (year, index) => (
                            <span
                              key={index}
                              className='rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            >
                              {year}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <h3 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                        Rating Pattern
                      </h3>
                      <p className='rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
                        {recommendations.analysis.ratingPattern}
                      </p>
                    </div>
                    <div>
                      <h3 className='mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                        AI Suggestions
                      </h3>
                      <ul className='space-y-1'>
                        {recommendations.analysis.suggestions.map(
                          (suggestion, index) => (
                            <li
                              key={index}
                              className='flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400'
                            >
                              <div className='mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400'></div>
                              <span>{suggestion}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Section */}
            <div>
              <div className='mb-6 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 dark:bg-white'>
                  <Sparkles className='h-5 w-5 text-white dark:text-gray-900' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Personalized Recommendations
                  </h2>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Curated just for you
                  </p>
                </div>
              </div>
              <RecommendationsCard />
            </div>
          </div>
        ) : (
          <div className='py-16 text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
                <Sparkles className='h-8 w-8 text-gray-400' />
              </div>
            </div>
            <h2 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
              No recommendations yet
            </h2>
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              Start rating shows and movies to get personalized AI
              recommendations
            </p>
            <Button
              onClick={() => router.push('/swipe')}
              className='bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
            >
              <Clock className='mr-2 h-4 w-4' />
              Start Rating Shows
            </Button>
          </div>
        )}

        {/* Social Share Section */}
        <div className='mt-8'>
          <Card className='border-0 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg dark:from-purple-900/20 dark:to-blue-900/20'>
            <CardContent className='p-6'>
              <SocialShare
                title='Check out my AI recommendations on Buzzwin!'
                description="I'm getting personalized movie and TV show recommendations powered by AI. Check out what I'm watching!"
                url={typeof window !== 'undefined' ? window.location.href : ''}
                hashtags={['Buzzwin', 'AIRecommendations', 'Movies', 'TVShows']}
                showTitle={true}
                size='md'
                variant='default'
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
