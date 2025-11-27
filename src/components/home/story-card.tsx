import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface StoryCardProps {
  title: string;
  excerpt: string;
  author: string;
  image?: string;
  href?: string;
}

export function StoryCard({
  title,
  excerpt,
  author,
  image,
  href
}: StoryCardProps): JSX.Element {
  const content = (
    <div className='group h-full rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'>
      {image && (
        <div className='relative mb-4 aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700'>
          <Image
            src={image}
            alt={title}
            layout='fill'
            objectFit='cover'
            className='transition-transform group-hover:scale-105'
          />
        </div>
      )}
      <h3 className='mb-3 text-lg font-bold leading-tight text-gray-900 dark:text-white md:text-xl'>
        {title}
      </h3>
      <p className='mb-4 text-base leading-relaxed text-gray-700 dark:text-gray-300 line-clamp-3'>
        {excerpt}
      </p>
      <div className='flex items-center justify-between'>
        <span className='text-sm text-gray-600 dark:text-gray-400'>{author}</span>
        <ArrowRight className='h-4 w-4 text-action transition-transform group-hover:translate-x-1' />
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className='block'>
        {content}
      </a>
    );
  }

  return content;
}

