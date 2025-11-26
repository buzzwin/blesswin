import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@lib/data/blog-posts';

interface BlogCardProps {
  post: BlogPost;
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

export function BlogCard({ post }: BlogCardProps): JSX.Element {
  // Map mindfulness to meditation
  const category = post.category === 'mindfulness' ? 'meditation' : post.category;
  const gradient = categoryColors[category as keyof typeof categoryColors] || categoryColors.wellness;
  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || 'Wellness';
  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className='group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'>
        {/* Content */}
        <div className='relative p-5'>
          {/* Category Badge */}
          <div className='mb-3'>
            <span
              className={`inline-block rounded-full bg-gradient-to-r ${gradient} px-3 py-1 text-xs font-medium text-white`}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h2 className='mb-2 text-lg font-semibold leading-tight text-gray-900 transition-colors group-hover:text-opacity-80 dark:text-white'>
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className='mb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2'>
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              <span>{publishedDate}</span>
            </div>
          </div>

          {/* Read More */}
          <div className='mt-4 flex items-center gap-1 text-xs font-medium text-gray-700 transition-colors group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white'>
            <span>Read</span>
            <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
          </div>
        </div>
      </article>
    </Link>
  );
}

