import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Loader2, Sparkles } from 'lucide-react';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { StoryReactions } from '@components/stories/story-reactions';
import { StoryBookmarkButton } from '@components/stories/story-bookmark-button';
import { StoryShareButton } from '@components/stories/story-share-button';
import { StoryInspirationModal } from '@components/stories/story-inspiration-modal';
import { useModal } from '@lib/hooks/useModal';
import { siteURL } from '@lib/env';
import Head from 'next/head';
import type { RealStory } from '@lib/types/real-story';

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

const formatDate = (dateString?: string | null): string | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    if (date > oneYearFromNow) return null;
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

export default function StoryPage(): JSX.Element {
  const router = useRouter();
  const { title } = router.query;
  const [story, setStory] = useState<RealStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { open: inspirationModalOpen, openModal: openInspirationModal, closeModal: closeInspirationModal } = useModal();
  const [selectedStory, setSelectedStory] = useState<RealStory | null>(null);

  useEffect(() => {
    async function fetchStory() {
      if (!title || typeof title !== 'string') {
        setLoading(false);
        return;
      }

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
        
        const stories = data.stories || [];
        const decodedTitle = decodeURIComponent(title);
        const foundStory = stories.find((s: RealStory) => s.title === decodedTitle);
        
        if (!foundStory) {
          setError('Story not found');
        } else {
          setStory(foundStory);
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        setLoading(false);
      }
    }

    void fetchStory();
  }, [title]);

  if (loading) {
    return (
      <HomeLayout>
        <SEO title='Loading Story...' />
        <SectionShell className='min-h-screen'>
          <div className='mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-12'>
            <Loader2 className='mb-4 h-10 w-10 animate-spin text-purple-600' />
            <p className='text-lg text-gray-600 dark:text-gray-400'>Loading story...</p>
          </div>
        </SectionShell>
      </HomeLayout>
    );
  }

  if (error || !story) {
    return (
      <HomeLayout>
        <SEO title='Story Not Found' />
        <SectionShell className='min-h-screen'>
          <div className='mx-auto max-w-3xl px-6 py-12'>
            <h1 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>Story Not Found</h1>
            <p className='mb-6 text-lg text-gray-600 dark:text-gray-400'>
              {error || 'The story you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link href='/real-stories'>
              <a className='inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700'>
                <ArrowLeft className='h-5 w-5' />
                Back to Stories
              </a>
            </Link>
          </div>
        </SectionShell>
      </HomeLayout>
    );
  }

  const hasValidUrl = isValidUrl(story.url);
  const categoryColor = categoryColors[story.category] || categoryColors.community;
  const categoryLabel = categoryLabels[story.category] || 'Community';
  const formattedDate = formatDate(story.date);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: story.title,
    description: story.description,
    datePublished: story.date || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: story.source || 'Buzzwin'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Buzzwin',
      logo: {
        '@type': 'ImageObject',
        url: `${siteURL || 'https://buzzwin.com'}/logo.PNG`
      }
    }
  };

  return (
    <HomeLayout>
      <SEO
        title={`${story.title} | Buzzwin`}
        description={story.description}
        keywords={`${story.category}, ${story.location || ''}, real stories, positive impact`}
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
          <Link href='/real-stories'>
            <a className='mb-6 inline-flex items-center gap-2 text-base text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
              <ArrowLeft className='h-5 w-5' />
              Back to Stories
            </a>
          </Link>
        </div>
      </SectionShell>

      {/* Story Content */}
      <SectionShell variant='dark' className='min-h-0'>
        <div className='mx-auto w-full max-w-3xl px-6 py-6'>
          <article className='rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 md:p-8'>
            {/* Category and Metadata */}
            <div className='mb-4 flex flex-wrap items-center gap-3'>
              <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${categoryColor}`}>
                {categoryLabel}
              </span>
              {story.location && (
                <span className='flex items-center gap-2 text-base text-gray-600 dark:text-gray-400'>
                  <MapPin className='h-4 w-4' />
                  {story.location}
                </span>
              )}
              {formattedDate && (
                <span className='flex items-center gap-2 text-base text-gray-600 dark:text-gray-400'>
                  <Calendar className='h-4 w-4' />
                  {formattedDate}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className='mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl'>
              {story.title}
            </h1>

            {/* Description */}
            <div className='mb-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300'>
              <p>{story.description}</p>
            </div>

            {/* Source */}
            {story.source && (
              <p className='mb-6 text-base text-gray-600 dark:text-gray-400'>
                Source: <span className='font-medium'>{story.source}</span>
              </p>
            )}

            {/* Action Buttons */}
            <div className='mb-6 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6 dark:border-gray-700'>
              <StoryReactions
                storyId={story.title}
                storyTitle={story.title}
              />
              <StoryBookmarkButton story={story} />
              <StoryShareButton story={story} />
              <button
                onClick={() => {
                  setSelectedStory(story);
                  openInspirationModal();
                }}
                className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-base font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
              >
                <Sparkles className='h-5 w-5' />
                Get Inspired
              </button>
              {hasValidUrl && (
                <a
                  href={story.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  Read Full Story
                  <ExternalLink className='h-5 w-5' />
                </a>
              )}
            </div>
          </article>
        </div>
      </SectionShell>

      {/* Story Inspiration Modal */}
      {selectedStory && (
        <StoryInspirationModal
          story={selectedStory}
          open={inspirationModalOpen}
          closeModal={() => {
            closeInspirationModal();
            setSelectedStory(null);
          }}
          onSuccess={() => {
            // Optionally refresh or show success message
          }}
        />
      )}
    </HomeLayout>
  );
}

