import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SectionShell } from '@components/layout/section-shell';
import { StoryCard } from '@components/home/story-card';

export function RealStoriesSection(): JSX.Element {
  const featuredStories = [
    {
      title: 'How One Community Transformed Their Neighborhood',
      excerpt: 'A small group of neighbors came together to create a community garden, bringing fresh food and hope to their area.',
      author: 'Sarah Chen',
      href: '/blog'
    },
    {
      title: 'The Power of Small Acts of Kindness',
      excerpt: 'Discover how simple gestures can create ripple effects of positivity and change.',
      author: 'Marcus Johnson',
      href: '/blog'
    },
    {
      title: 'Finding Purpose Through Service',
      excerpt: 'One person\'s journey from feeling lost to finding meaning through helping others.',
      author: 'Elena Rodriguez',
      href: '/blog'
    }
  ];

  return (
    <SectionShell variant='dark'>
      <div className='mx-auto w-full max-w-6xl px-6'>
        <div className='mb-12 text-center'>
          <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
            <Sparkles className='h-8 w-8 text-purple-600 dark:text-purple-400' />
          </div>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
            Real Stories, Real Impact
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300'>
            Discover inspiring stories of people creating positive change. Get inspired and turn that inspiration into action.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {featuredStories.map((story, index) => (
            <StoryCard
              key={index}
              title={story.title}
              excerpt={story.excerpt}
              author={story.author}
              href={story.href}
            />
          ))}
        </div>

        {/* Feature Highlights */}
        <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* Get Inspired Feature */}
          <div className='rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600'>
                <Sparkles className='h-6 w-6 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                Get Inspired & Take Action
              </h3>
            </div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              Every story has a "Get Inspired" button. Click it to create a ritual and share how the story motivates you to make a difference. Turn inspiration into ritual participation and earn bonus karma points!
            </p>
            <Link href='/real-stories'>
              <a className='inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:underline dark:text-purple-300'>
                Explore Stories
                <ArrowRight className='h-4 w-4' />
              </a>
            </Link>
          </div>

          {/* Story Reactions Feature */}
          <div className='rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600'>
                <span className='text-2xl'>✨</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                React & Engage
              </h3>
            </div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              Show your appreciation with story reactions: Inspired ✨, Want to Try 🎯, Sharing 📢, or This Matters to Me 💚. See how many people were moved by each story and build community around positive change.
            </p>
            <Link href='/real-stories'>
              <a className='inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300'>
                See Reactions
                <ArrowRight className='h-4 w-4' />
              </a>
            </Link>
          </div>
        </div>

        <div className='mt-8 text-center'>
          <Link href='/real-stories'>
            <a className='inline-flex items-center gap-2 text-base font-semibold text-action hover:underline'>
              View All Stories
              <ArrowRight className='h-4 w-4' />
            </a>
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}
