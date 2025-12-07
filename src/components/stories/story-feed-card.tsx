import { useState } from 'react';
import { useRouter } from 'next/router';
import { ExternalLink, Calendar, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { StoryActionFlow } from './story-action-flow';
import { StoryBookmarkButton } from './story-bookmark-button';
import { StoryShareButton } from './story-share-button';
import type { RealStory } from '@lib/types/real-story';

interface StoryFeedCardProps {
  story: RealStory;
  index: number;
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

export function StoryFeedCard({ story, index }: StoryFeedCardProps): JSX.Element {
  const router = useRouter();
  
  const hasValidUrl = isValidUrl(story.url);
  const categoryColor = categoryColors[story.category] || categoryColors.community;
  const categoryLabel = categoryLabels[story.category] || 'Community';
  const formattedDate = formatDate(story.date);

  return (
    <>
      {/* Ad-like container with distinct styling */}
      <div className='my-3 px-2 md:px-0'>
        <article className='relative overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 shadow-lg transition-shadow hover:shadow-xl dark:border-purple-800/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20'>
          {/* Featured Story Badge */}
          <div className='absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-purple-700 shadow-md backdrop-blur-sm dark:bg-gray-800/90 dark:text-purple-300'>
            <TrendingUp className='h-3 w-3' />
            <span>Featured Story</span>
          </div>

          <div className='p-5 md:p-6'>
            {/* Story Header */}
            <div className='mb-3 flex items-start justify-between gap-3 pr-20'>
              <div className='flex-1'>
                <div className='mb-2 flex flex-wrap items-center gap-2'>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}>
                    {categoryLabel}
                  </span>
                  {story.location && (
                    <span className='flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300'>
                      <MapPin className='h-3 w-3' />
                      {story.location}
                    </span>
                  )}
                  {formattedDate && (
                    <span className='flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300'>
                      <Calendar className='h-3 w-3' />
                      {formattedDate}
                    </span>
                  )}
                </div>
                
                {/* Story Title - Clickable if URL exists */}
                {hasValidUrl ? (
                  <a
                    href={story.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block transition-opacity hover:opacity-90'
                  >
                    <h3 className='mb-2 text-xl font-bold leading-tight text-gray-900 dark:text-white md:text-2xl'>
                      {story.title}
                    </h3>
                  </a>
                ) : (
                  <h3 className='mb-2 text-xl font-bold leading-tight text-gray-900 dark:text-white md:text-2xl'>
                    {story.title}
                  </h3>
                )}
                
                {/* Story Description */}
                <p className='mb-3 text-base leading-relaxed text-gray-800 dark:text-gray-200'>
                  {story.description}
                </p>
                
                {story.source && (
                  <p className='mb-3 text-xs font-medium text-gray-600 dark:text-gray-400'>
                    Source: <span className='font-semibold'>{story.source}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div 
              className='flex flex-wrap items-center gap-2'
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
                  className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
                >
                  Read Full Story
                  <ExternalLink className='h-4 w-4' />
                </a>
              )}
            </div>
          </div>

          {/* Decorative gradient overlay at bottom */}
          <div className='h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400'></div>
        </article>
      </div>
    </>
  );
}

