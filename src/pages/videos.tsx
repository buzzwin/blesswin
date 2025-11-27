import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Youtube, Flower2, Moon } from 'lucide-react';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { YouTubeVideos } from '@components/home/youtube-videos';
import { Button } from '@components/ui/button-shadcn';
import { siteURL } from '@lib/env';
import Head from 'next/head';
import Link from 'next/link';

export default function VideosPage(): JSX.Element {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'yoga' | 'meditation' | 'all'>('all');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Trending Yoga & Meditation Videos | Buzzwin',
    description:
      'Discover trending YouTube videos for yoga and meditation practices.',
    url: `${siteURL || 'https://Buzzwin.com'}/videos`
  };

  return (
    <HomeLayout>
      <SEO
        title='Trending Yoga & Meditation Videos | Buzzwin'
        description='Discover trending YouTube videos for yoga and meditation practices. Find guided sessions, tutorials, and inspiration for your wellness journey.'
        keywords='yoga videos, meditation videos, YouTube wellness, trending videos, guided meditation, yoga tutorials'
        structuredData={structuredData}
      />
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* Header */}
      <SectionShell className='py-8 sm:py-12'>
        <div className='mx-auto max-w-6xl px-4 sm:px-6'>
          <Link href='/'>
            <a className='mb-4 inline-flex items-center gap-1.5 text-xs text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:mb-6 sm:text-sm'>
              <ArrowLeft className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
              <span>Back</span>
            </a>
          </Link>

          <div className='mb-6 flex flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-center sm:gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg sm:h-16 sm:w-16 sm:rounded-2xl'>
              <Youtube className='h-6 w-6 text-white sm:h-8 sm:w-8' />
            </div>
            <div>
              <h1 className='mb-1 text-2xl font-light text-gray-900 dark:text-white sm:mb-2 sm:text-3xl md:text-4xl'>
                Trending Videos
              </h1>
              <p className='text-sm font-light text-gray-600 dark:text-gray-300 sm:text-base md:text-lg'>
                Yoga & Meditation videos from YouTube
              </p>
            </div>
          </div>

          {/* Category Filter */}
          <div className='flex flex-wrap gap-2'>
            <Button
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size='sm'
              className={
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white'
                  : ''
              }
            >
              All Videos
            </Button>
            <Button
              onClick={() => setSelectedCategory('yoga')}
              variant={selectedCategory === 'yoga' ? 'default' : 'outline'}
              size='sm'
              className={
                selectedCategory === 'yoga'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : ''
              }
            >
              <Flower2 className='mr-2 h-4 w-4' />
              Yoga
            </Button>
            <Button
              onClick={() => setSelectedCategory('meditation')}
              variant={selectedCategory === 'meditation' ? 'default' : 'outline'}
              size='sm'
              className={
                selectedCategory === 'meditation'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                  : ''
              }
            >
              <Moon className='mr-2 h-4 w-4' />
              Meditation
            </Button>
          </div>
        </div>
      </SectionShell>

      {/* Videos Grid */}
      <SectionShell className='py-8 sm:py-12'>
        <div className='mx-auto max-w-6xl px-4 sm:px-6'>
          <YouTubeVideos category={selectedCategory} limit={12} />
        </div>
      </SectionShell>
    </HomeLayout>
  );
}

