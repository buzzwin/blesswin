import Link from 'next/link';
import type { BlogPost } from '@lib/data/blog-posts';

const categoryLabels: Record<BlogPost['category'], string> = {
  yoga: 'Yoga',
  meditation: 'Meditation',
  mindfulness: 'Mindfulness',
  harmony: 'Harmony',
  wellness: 'Wellness'
};

type BlogArchiveRowProps = {
  post: BlogPost;
};

export function BlogArchiveRow({ post }: BlogArchiveRowProps): JSX.Element {
  const categoryLabel =
    categoryLabels[post.category] ?? categoryLabels.wellness;
  const publishedDate = new Date(post.publishedAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  );

  return (
    <Link href={`/blog/${post.slug}`}>
      <a className='group flex gap-4 border-b border-charcoal/10 py-6 transition-colors first:pt-0 last:border-b-0 hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.03] sm:gap-5'>
        {post.image ? (
          <div className='relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-charcoal/5 dark:bg-white/5 sm:h-24 sm:w-32'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=''
              className='h-full w-full object-cover'
            />
          </div>
        ) : null}
        <div className='min-w-0 flex-1'>
          <time
            dateTime={post.publishedAt}
            className='text-xs text-charcoal/50 dark:text-gray-500'
          >
            {publishedDate}
          </time>
          <h2 className='mt-1 font-publication text-lg font-semibold leading-snug text-charcoal group-hover:underline dark:text-gray-100 sm:text-xl'>
            {post.title}
          </h2>
          <p className='mt-1 line-clamp-2 text-sm leading-relaxed text-charcoal/70 dark:text-gray-400'>
            {post.excerpt}
          </p>
          <p className='mt-2 text-xs text-charcoal/45 dark:text-gray-500'>
            {categoryLabel}
            {post.author ? ` · ${post.author}` : ''}
          </p>
        </div>
      </a>
    </Link>
  );
}
