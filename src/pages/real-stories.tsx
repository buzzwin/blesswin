import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Loader2 } from 'lucide-react';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { siteURL } from '@lib/env';
import Head from 'next/head';

interface RealStory {
  title: string;
  description: string;
  location?: string;
  date?: string;
  source?: string;
  url?: string;
  category: 'community' | 'environment' | 'education' | 'health' | 'social-justice' | 'innovation';
}

const categoryColors = {
  community: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  environment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  education: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'social-justice': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  innovation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
};

const categoryLabels = {
  community: 'Community',
  environment: 'Environment',
  education: 'Education',
  health: 'Health',
  'social-justice': 'Social Justice',
  innovation: 'Innovation'
};

export default function RealStoriesPage(): JSX.Element {
  const router = useRouter();
  const [stories, setStories] = useState<RealStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/real-stories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setStories(data.stories || []);
      } catch (err) {
        console.error('Error fetching real stories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stories');
      } finally {
        setLoading(false);
      }
    }

    void fetchStories();
  }, []);

  const formatDate = (dateString?: string): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return null;
      // Check if date is not too far in the future (likely invalid)
      const now = new Date();
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      if (date > oneYearFromNow) return null;
      // Check if date is not too old (more than 5 years ago, likely not "current")
      const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      if (date < fiveYearsAgo) return null;
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return null;
    }
  };

  const isValidUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Real Stories of Good | Buzzwin',
    description: 'Inspiring real stories of people and communities making a positive impact in the world.',
    url: `${siteURL || 'https://Buzzwin.com'}/real-stories`
  };

  return (
    <HomeLayout>
      <SEO
        title='Real Stories of Good | Buzzwin'
        description='Discover inspiring real stories of people and communities making a positive impact in the world.'
        keywords='real stories, social good, community impact, positive change, inspiring stories, people doing good'
        structuredData={structuredData}
      />
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* Header */}
      <SectionShell className='min-h-0'>
        <div className='mx-auto w-full max-w-3xl px-6 py-6'>
          <Link href='/'>
            <a className='mb-3 inline-flex items-center gap-2 text-base text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
              <ArrowLeft className='h-5 w-5' />
              Back to Home
            </a>
          </Link>

          <div className='mb-4 text-center'>
            <h1 className='mb-2 text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl'>
              Real Stories of Good
            </h1>
            <p className='mx-auto max-w-2xl text-xl leading-relaxed text-gray-700 dark:text-gray-300'>
              Inspiring stories of people and communities making a positive impact in the world.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* Stories Section */}
      <SectionShell variant='dark' className='min-h-0'>
        <div className='mx-auto w-full max-w-3xl px-6 py-6'>
          {loading ? (
            <div className='py-8 text-center'>
              <Loader2 className='mx-auto mb-3 h-10 w-10 animate-spin text-action' />
              <p className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
                Loading Inspiring Stories
              </p>
              <p className='mb-3 text-base text-gray-600 dark:text-gray-400'>
                Fetching real stories of people making a difference...
              </p>
              {/* Progress bar */}
              <div className='mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <div className='h-full animate-pulse bg-action' style={{ width: '60%' }} />
              </div>
            </div>
          ) : error ? (
            <div className='py-8 text-center'>
              <p className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
                Unable to Load Stories
              </p>
              <p className='mb-3 text-base text-gray-600 dark:text-gray-400'>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className='rounded-lg bg-action px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90'
              >
                Try Again
              </button>
            </div>
          ) : stories.length === 0 ? (
            <div className='py-8 text-center'>
              <p className='text-lg text-gray-600 dark:text-gray-400'>
                No stories found at this time. Please check back later.
              </p>
            </div>
          ) : (
            <div className='space-y-5 pb-4'>
              {stories.map((story, index) => {
                const hasValidUrl = isValidUrl(story.url);
                const categoryColor = categoryColors[story.category] || categoryColors.community;
                const categoryLabel = categoryLabels[story.category] || 'Community';

                const content = (
                  <>
                    <div className='mb-3 flex flex-wrap items-center gap-3'>
                      <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${categoryColor}`}>
                        {categoryLabel}
                      </span>
                      {story.location && (
                        <span className='flex items-center gap-2 text-base text-gray-600 dark:text-gray-400'>
                          <MapPin className='h-4 w-4' />
                          {story.location}
                        </span>
                      )}
                      {formatDate(story.date) && (
                        <span className='flex items-center gap-2 text-base text-gray-600 dark:text-gray-400'>
                          <Calendar className='h-4 w-4' />
                          {formatDate(story.date)}
                        </span>
                      )}
                    </div>
                    <h2 className='mb-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white md:text-3xl'>
                      {story.title}
                    </h2>
                    <p className='mb-3 text-lg leading-relaxed text-gray-700 dark:text-gray-300'>
                      {story.description}
                    </p>
                    {story.source && (
                      <p className='mb-2 text-base text-gray-600 dark:text-gray-400'>
                        Source: <span className='font-medium'>{story.source}</span>
                      </p>
                    )}
                    {hasValidUrl && (
                      <div className='mt-3'>
                        <a
                          href={story.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-2 rounded-lg bg-action px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90'
                        >
                          Read Full Story
                          <ExternalLink className='h-5 w-5' />
                        </a>
                      </div>
                    )}
                  </>
                );

                return (
                  <article
                    key={index}
                    className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 md:p-6'
                  >
                    {hasValidUrl ? (
                      <a
                        href={story.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block transition-opacity hover:opacity-90'
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </SectionShell>
    </HomeLayout>
  );
}

