import { useState } from 'react';
import {
  Flower2,
  Moon,
  Waves,
  Heart
} from 'lucide-react';
import { SEO } from '@components/common/seo';
import { PublicationLayout } from '@components/layout/publication-layout';
import { BlogArchiveRow } from '@components/blog/blog-archive-row';
import { PublicationSubscribe } from '@components/blog/publication-subscribe';
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

  const filteredPosts =
    selectedCategory === 'all'
      ? allPosts
      : selectedCategory === 'meditation'
      ? allPosts.filter(
          (post) =>
            post.category === 'meditation' || post.category === 'mindfulness'
        )
      : getBlogPostsByCategory(selectedCategory);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Buzzwin Journal',
    description:
      'Wellness writing — decide and act, not just discover. Articles on yoga, mindfulness, and rhythm.',
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
    <PublicationLayout wide>
      <SEO
        title='Buzzwin Journal — wellness & rituals'
        description='Read the Buzzwin journal: practical wellness writing. Subscribe for free — no account required to read.'
        keywords='wellness blog, yoga, mindfulness, Buzzwin journal'
        structuredData={structuredData}
      />
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <header className='mb-8 border-b border-charcoal/10 pb-8 dark:border-white/10'>
        <h1 className='font-publication text-3xl font-bold tracking-tight text-charcoal dark:text-gray-100 sm:text-4xl'>
          Buzzwin Journal
        </h1>
        <p className='mt-2 max-w-xl text-sm leading-relaxed text-charcoal/70 dark:text-gray-400 sm:text-base'>
          Ideas and guides for a calmer week — readable by anyone. Sign in is
          optional if you use the Buzzwin app.
        </p>
      </header>

      <PublicationSubscribe className='mb-10' />

      <div className='mb-6 flex flex-wrap items-center gap-2'>
        <span className='w-full text-xs font-medium uppercase tracking-wide text-charcoal/45 dark:text-gray-500 sm:w-auto'>
          Filter
        </span>
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.value;
          return (
            <button
              key={category.value}
              type='button'
              onClick={() => setSelectedCategory(category.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-charcoal text-cream dark:bg-white dark:text-gray-900'
                  : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
              }`}
            >
              <Icon className='h-3 w-3' aria-hidden />
              {category.label}
            </button>
          );
        })}
      </div>

      <div>
        {filteredPosts.length > 0 ? (
          <div className='flex flex-col'>
            {filteredPosts.map((post) => (
              <BlogArchiveRow key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className='py-12 text-center text-sm text-charcoal/60 dark:text-gray-500'>
            No posts in this category yet.
          </p>
        )}
      </div>

      <PublicationSubscribe className='mt-12' />
    </PublicationLayout>
  );
}
