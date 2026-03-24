import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { SEO } from '@components/common/seo';
import { PublicationLayout } from '@components/layout/publication-layout';
import {
  blogPosts,
  getBlogPostBySlug,
  getRecentBlogPosts,
  type BlogPost
} from '@lib/data/blog-posts';
import { siteURL } from '@lib/env';
import Head from 'next/head';
import { PublicationSubscribe } from '@components/blog/publication-subscribe';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

const categoryLabels: Record<string, string> = {
  yoga: 'Yoga',
  meditation: 'Meditation',
  mindfulness: 'Mindfulness',
  harmony: 'Harmony',
  wellness: 'Wellness'
};

function formatContent(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      if (line.startsWith('# ')) {
        return `<h1 class="font-publication text-3xl font-bold text-charcoal dark:text-gray-100 mb-4 mt-10 first:mt-0 sm:text-4xl">${line.substring(
          2
        )}</h1>`;
      }
      if (line.startsWith('## ')) {
        return `<h2 class="font-publication text-2xl font-semibold text-charcoal dark:text-gray-100 mb-3 mt-10 sm:text-3xl">${line.substring(
          3
        )}</h2>`;
      }
      if (line.startsWith('### ')) {
        return `<h3 class="font-publication text-xl font-semibold text-charcoal dark:text-gray-100 mb-2 mt-8 sm:text-2xl">${line.substring(
          4
        )}</h3>`;
      }
      let processed = line;
      processed = processed.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-charcoal dark:text-gray-100">$1</strong>'
      );
      processed = processed.replace(
        /\*(.*?)\*/g,
        '<em class="italic text-charcoal/90 dark:text-gray-300">$1</em>'
      );
      if (processed.trim() === '') {
        return '<br />';
      }
      return `<p class="font-publication mb-5 text-lg leading-[1.75] text-charcoal/90 dark:text-gray-300">${processed}</p>`;
    })
    .join('');
}

export default function BlogPostPage({
  post,
  relatedPosts
}: BlogPostPageProps): JSX.Element {
  const categoryLabel =
    categoryLabels[post.category] ?? categoryLabels.wellness ?? 'Wellness';

  const publishedDate = new Date(post.publishedAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  );

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
    <PublicationLayout>
      <SEO
        title={`${post.title} | Buzzwin Journal`}
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

      <Link href='/blog'>
        <a className='mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/60 transition-colors hover:text-charcoal dark:text-gray-500 dark:hover:text-gray-200'>
          <ArrowLeft className='h-3.5 w-3.5' aria-hidden />
          All posts
        </a>
      </Link>

      <article>
        <header className='mb-10'>
          <p className='text-sm text-charcoal/50 dark:text-gray-500'>
            <span className='rounded-full bg-charcoal/5 px-2 py-0.5 text-xs font-medium text-charcoal/70 dark:bg-white/10 dark:text-gray-400'>
              {categoryLabel}
            </span>
          </p>
          <h1 className='mt-3 font-publication text-3xl font-bold leading-tight tracking-tight text-charcoal dark:text-gray-100 sm:text-4xl sm:leading-tight'>
            {post.title}
          </h1>
          <div className='mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-charcoal/55 dark:text-gray-500'>
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <span className='inline-flex items-center gap-1'>
              <Calendar className='h-3.5 w-3.5' aria-hidden />
              <time dateTime={post.publishedAt}>{publishedDate}</time>
            </span>
            <span aria-hidden>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </header>

        {post.image ? (
          <div className='mb-10 overflow-hidden rounded-lg border border-charcoal/10 dark:border-white/10'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=''
              className='w-full object-cover'
            />
          </div>
        ) : null}

        <div
          className='article-body max-w-none'
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        <PublicationSubscribe className='mt-14' />
      </article>

      {relatedPosts.length > 0 ? (
        <section className='mt-16 border-t border-charcoal/10 pt-10 dark:border-white/10'>
          <h2 className='font-display text-sm font-semibold uppercase tracking-wide text-charcoal/50 dark:text-gray-500'>
            More from the journal
          </h2>
          <ul className='mt-4 space-y-3'>
            {relatedPosts.map((relatedPost) => (
              <li key={relatedPost.slug}>
                <Link href={`/blog/${relatedPost.slug}`}>
                  <a className='group block font-publication text-base font-medium text-charcoal transition-colors hover:underline dark:text-gray-200'>
                    {relatedPost.title}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PublicationLayout>
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

  const relatedPosts = blogPosts
    .filter((p) => {
      if (p.slug === post.slug) return false;
      if (post.category === 'meditation') {
        return p.category === 'meditation' || p.category === 'mindfulness';
      }
      return p.category === post.category;
    })
    .slice(0, 3);

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
