import { useState } from 'react';
import {
  Flower2,
  Moon,
  Waves,
  Heart
} from 'lucide-react';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { BlogCard } from '@components/blog/blog-card';
import {
  blogPosts,
  getBlogPostsByCategory,
  type BlogPost
} from '@lib/data/blog-posts';
import { siteURL } from '@lib/env';
import Head from 'next/head';

const categories: Array<{
  value: BlogPost['category'] | 'all';
  label: string;
  icon: React.ElementType;
}> = [
  { value: 'all', label: 'All', icon: Heart },
  { value: 'yoga', label: 'Yoga', icon: Flower2 },
  { value: 'meditation', label: 'Meditation', icon: Moon },
  { value: 'harmony', label: 'Harmony', icon: Waves },
  { value: 'wellness', label: 'Wellness', icon: Heart }
];

export default function BlogPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<
    BlogPost['category'] | 'all'
  >('all');

  const allPosts = [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Filter posts
  const filteredPosts =
    selectedCategory === 'all'
      ? allPosts
      : selectedCategory === 'meditation'
      ? allPosts.filter(
          (post) => post.category === 'meditation' || post.category === 'mindfulness'
        )
      : getBlogPostsByCategory(selectedCategory);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Buzzwin Wellness Blog',
    description:
      'Wellness articles about yoga, mindfulness, meditation, harmony, and world peace',
    url: `${siteURL || 'https://Buzzwin.com'}/blog`,
    blogPost: blogPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      author: {
        '@type': 'Organization',
        name: post.author
      }
    }))
  };

  return (
    <HomeLayout>
      <SEO
        title='Wellness Blog - Articles on Yoga, Mindfulness & Peace | Buzzwin'
        description='Discover wellness articles, insights, and tips on yoga, mindfulness, meditation, harmony, and world peace. Learn practical tips for your wellness journey.'
        keywords='wellness blog, yoga articles, mindfulness tips, meditation AI pal, harmony, world peace, wellness content'
        structuredData={structuredData}
      />
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* Simple Header */}
      <SectionShell className='py-12 sm:py-16'>
        <div className='mx-auto max-w-6xl px-4 sm:px-6'>
          <div className='mb-6 text-center sm:mb-8'>
            <h1 className='mb-2 text-3xl font-light text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
              Wellness Blog
            </h1>
            <p className='mx-auto max-w-2xl text-base font-light text-gray-600 dark:text-gray-300 sm:text-lg'>
              Articles and insights for your wellness journey
            </p>
          </div>

          {/* Category Filters */}
          <div className='mb-6 flex flex-wrap items-center justify-center gap-2 sm:mb-8'>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className='h-3 w-3' />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </SectionShell>

      {/* Posts Grid */}
      <SectionShell className='py-8 sm:py-12'>
        <div className='mx-auto max-w-6xl px-4 sm:px-6'>
          {filteredPosts.length > 0 ? (
            <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {filteredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className='py-20 text-center'>
              <p className='text-lg text-gray-600 dark:text-gray-400'>
                No articles found.
              </p>
            </div>
          )}
        </div>
      </SectionShell>
    </HomeLayout>
  );
}
