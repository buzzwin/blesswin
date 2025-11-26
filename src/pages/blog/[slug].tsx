import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Flower2,
  Moon,
  Waves,
  Heart
} from 'lucide-react';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import {
  blogPosts,
  getBlogPostBySlug,
  getRecentBlogPosts,
  type BlogPost
} from '@lib/data/blog-posts';
import { siteURL } from '@lib/env';
import Head from 'next/head';
import { BlogCard } from '@components/blog/blog-card';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

const categoryColors = {
  yoga: 'from-green-500 to-emerald-600',
  meditation: 'from-purple-500 to-violet-600',
  harmony: 'from-teal-500 to-cyan-600',
  wellness: 'from-pink-500 to-rose-600'
};

const categoryLabels = {
  yoga: 'Yoga',
  meditation: 'Meditation',
  harmony: 'Harmony',
  wellness: 'Wellness'
};

export default function BlogPostPage({
  post,
  relatedPosts
}: BlogPostPageProps): JSX.Element {
  // Map mindfulness to meditation
  const category = post.category === 'mindfulness' ? 'meditation' : post.category;
  const gradient = categoryColors[category as keyof typeof categoryColors] || categoryColors.wellness;
  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || 'Wellness';

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Convert markdown-like content to HTML (simple implementation)
  const formatContent = (content: string): string => {
    return content
      .split('\n')
      .map((line) => {
        // Headers
        if (line.startsWith('# ')) {
          return `<h1 class="text-4xl font-black text-gray-900 dark:text-white mb-6 mt-8">${line.substring(
            2
          )}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-8">${line.substring(
            3
          )}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-6">${line.substring(
            4
          )}</h3>`;
        }
        // Bold text
        line = line.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>'
        );
        // Italic text
        line = line.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        // Empty lines
        if (line.trim() === '') {
          return '<br />';
        }
        // Regular paragraphs
        return `<p class="mb-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">${line}</p>`;
      })
      .join('');
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image || `${siteURL || 'https://Buzzwin.com'}/logo192.png`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Buzzwin',
      logo: {
        '@type': 'ImageObject',
        url: `${siteURL || 'https://Buzzwin.com'}/logo192.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteURL || 'https://Buzzwin.com'}/blog/${post.slug}`
    }
  };

  return (
    <HomeLayout>
      <SEO
        title={`${post.title} | Buzzwin Blog`}
        description={post.excerpt}
        keywords={post.tags.join(', ')}
        structuredData={structuredData}
      />
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* Simple Header */}
      <SectionShell className='py-8'>
        <div className='mx-auto max-w-3xl px-6'>
          <Link href='/blog'>
            <a className='mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
              <ArrowLeft className='h-3.5 w-3.5' />
              <span>Back</span>
            </a>
          </Link>

          {/* Category Badge */}
          <div className='mb-4'>
            <span
              className={`inline-block rounded-full bg-gradient-to-r ${gradient} px-3 py-1 text-xs font-medium text-white`}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h1 className='mb-4 text-3xl font-light leading-tight text-gray-900 dark:text-white sm:text-4xl'>
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className='mb-8 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              <span>{publishedDate}</span>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* Article Content */}
      <SectionShell className='py-8'>
        <article className='mx-auto max-w-3xl px-6'>
          <div
            className='prose prose-lg dark:prose-invert max-w-none'
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
        </article>
      </SectionShell>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <SectionShell variant='dark' className='py-12'>
          <div className='mx-auto max-w-6xl px-6'>
            <h2 className='mb-6 text-xl font-light text-gray-900 dark:text-white'>
              Related Articles
            </h2>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </SectionShell>
      )}
    </HomeLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = blogPosts.map((post) => ({
    params: { slug: post.slug }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      notFound: true
    };
  }

  // Get related posts (same category, excluding current post)
  // Also include mindfulness posts when looking for meditation posts
  const relatedPosts = blogPosts
    .filter((p) => {
      if (p.slug === post.slug) return false;
      if (post.category === 'meditation') {
        return p.category === 'meditation' || p.category === 'mindfulness';
      }
      return p.category === post.category;
    })
    .slice(0, 3);

  // If not enough related posts, add recent posts
  if (relatedPosts.length < 3) {
    const recentPosts = getRecentBlogPosts(3 - relatedPosts.length).filter(
      (p) =>
        p.slug !== post.slug && !relatedPosts.some((rp) => rp.slug === p.slug)
    );
    relatedPosts.push(...recentPosts);
  }

  return {
    props: {
      post,
      relatedPosts: relatedPosts.slice(0, 3)
    }
  };
};
