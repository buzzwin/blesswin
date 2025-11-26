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
      <SectionShell className='py-12'>
        <div className='mx-auto max-w-6xl px-6'>
          <Link href='/'>
            <a className='mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
              <ArrowLeft className='h-3.5 w-3.5' />
              <span>Back</span>
            </a>
          </Link>

          <div className='mb-8 flex items-center gap-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg'>
              <Youtube className='h-8 w-8 text-white' />
            </div>
            <div>
              <h1 className='mb-2 text-4xl font-light text-gray-900 dark:text-white'>
                Trending Videos
              </h1>
              <p className='text-lg font-light text-gray-600 dark:text-gray-300'>
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
      <SectionShell className='py-12'>
        <div className='mx-auto max-w-6xl px-6'>
          <YouTubeVideos category={selectedCategory} limit={12} />
        </div>
      </SectionShell>
    </HomeLayout>
  );
}

