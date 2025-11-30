import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Loader2, Sparkles, Bookmark } from 'lucide-react';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { StoryActionFlow } from '@components/stories/story-action-flow';
import { StoryBookmarkButton } from '@components/stories/story-bookmark-button';
import { StoryShareButton } from '@components/stories/story-share-button';
import { useAuth } from '@lib/context/auth-context';
import { query, getDocs, orderBy } from 'firebase/firestore';
import { userStoryBookmarksCollection } from '@lib/firebase/collections';
import { siteURL } from '@lib/env';
import Head from 'next/head';
import type { RealStory } from '@lib/types/real-story';
import type { StoryBookmark } from '@lib/types/story-bookmark';

// RealStory type imported from @lib/types/real-story

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
  const { user } = useAuth();
  const [stories, setStories] = useState<RealStory[]>([]);
  const [allStories, setAllStories] = useState<RealStory[]>([]);
  const [bookmarkedStoryIds, setBookmarkedStoryIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'my'>('all');

  // Fetch all stories
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
        
        const fetchedStories = data.stories || [];
        setAllStories(fetchedStories);
        setStories(fetchedStories);
      } catch (err) {
        console.error('Error fetching real stories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stories');
      } finally {
        setLoading(false);
      }
    }

    void fetchStories();
  }, []);

  // Fetch user's bookmarked stories
  const fetchBookmarkedStories = async (): Promise<void> => {
    if (!user?.id) {
      setBookmarkedStoryIds(new Set());
      return;
    }

    try {
      const bookmarksRef = userStoryBookmarksCollection(user.id);
      const snapshot = await getDocs(query(bookmarksRef, orderBy('createdAt', 'desc')));
      const bookmarks = snapshot.docs.map(doc => doc.data());
      const storyIds = new Set(bookmarks.map(b => b.storyId));
      setBookmarkedStoryIds(storyIds);
    } catch (error) {
      console.error('Error fetching bookmarked stories:', error);
    }
  };

  useEffect(() => {
    void fetchBookmarkedStories();
  }, [user?.id]);

  // Listen for bookmark changes
  useEffect(() => {
    const handleBookmarkChange = (): void => {
      void fetchBookmarkedStories();
    };

    window.addEventListener('storyBookmarked', handleBookmarkChange);
    window.addEventListener('storyUnbookmarked', handleBookmarkChange);

    return () => {
      window.removeEventListener('storyBookmarked', handleBookmarkChange);
      window.removeEventListener('storyUnbookmarked', handleBookmarkChange);
    };
  }, [user?.id]);

  // Filter stories based on selected filter
  useEffect(() => {
    if (filter === 'my' && user?.id) {
      // Show only bookmarked stories
      const filtered = allStories.filter(story => bookmarkedStoryIds.has(story.title));
      setStories(filtered);
    } else {
      // Show all stories
      setStories(allStories);
    }
  }, [filter, allStories, bookmarkedStoryIds, user?.id]);

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
    '@type': 'CollectionPage',
    name: 'Real Stories of Good | Buzzwin',
    description: 'Inspiring real stories of people and communities making a positive impact in the world.',
    url: `${siteURL || 'https://Buzzwin.com'}/real-stories`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: stories.slice(0, 10).map((story, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          headline: story.title,
          description: story.description,
          url: story.url || `${siteURL || 'https://Buzzwin.com'}/real-stories#${story.title.toLowerCase().replace(/\s+/g, '-')}`,
          datePublished: story.date || new Date().toISOString(),
          author: {
            '@type': 'Organization',
            name: story.source || 'Buzzwin'
          }
        }
      }))
    }
  };

  return (
    <HomeLayout>
      <SEO
        title='Real Stories of Good | Buzzwin'
        description='Discover inspiring real stories of people and communities making a positive impact in the world.'
        keywords='real stories, social good, community impact, positive change, inspiring stories, people doing good'
        image={`${siteURL || 'https://Buzzwin.com'}/assets/og-stories.jpg`}
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

          {/* Filter Tabs */}
          {user && (
            <div className='mb-6 flex justify-center gap-2'>
              <button
                onClick={() => setFilter('all')}
                className={`rounded-lg px-6 py-2.5 text-base font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All Stories
              </button>
              <button
                onClick={() => setFilter('my')}
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-base font-semibold transition-colors ${
                  filter === 'my'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Bookmark className='h-4 w-4' />
                My Stories ({bookmarkedStoryIds.size})
              </button>
            </div>
          )}
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
              {filter === 'my' ? (
                <>
                  <Bookmark className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                  <p className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
                    No Bookmarked Stories Yet
                  </p>
                  <p className='mb-4 text-lg text-gray-600 dark:text-gray-400'>
                    Start bookmarking inspiring stories to see them here!
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className='rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-base font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
                  >
                    Browse All Stories
                  </button>
                </>
              ) : (
                <p className='text-lg text-gray-600 dark:text-gray-400'>
                  No stories found at this time. Please check back later.
                </p>
              )}
            </div>
          ) : (
            <div className='space-y-5 pb-4'>
              {stories.map((story, index) => {
                const hasValidUrl = isValidUrl(story.url);
                const categoryColor = categoryColors[story.category] || categoryColors.community;
                const categoryLabel = categoryLabels[story.category] || 'Community';

                return (
                  <article
                    key={index}
                    className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 md:p-6'
                  >
                    {/* Story Content - Clickable if URL exists */}
                    {hasValidUrl ? (
                      <a
                        href={story.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block transition-opacity hover:opacity-90'
                      >
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
                          {story.date && formatDate(story.date) && (
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
                      </a>
                    ) : (
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
                          {story.date && formatDate(story.date) && (
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
                      </>
                    )}

                    {/* Action Buttons */}
                    <div 
                      className='mt-4 flex flex-wrap items-center gap-3'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StoryActionFlow story={story} />
                      <StoryBookmarkButton story={story} />
                      <StoryShareButton story={story} />
                      {hasValidUrl && (
                        <a
                          href={story.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          onClick={(e) => e.stopPropagation()}
                          className='inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        >
                          Read Full Story
                          <ExternalLink className='h-5 w-5' />
                        </a>
                      )}
                    </div>
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

