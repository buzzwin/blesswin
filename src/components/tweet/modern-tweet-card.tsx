import { BookOpen } from 'lucide-react';
import { cn } from '@lib/utils';
import { Card, CardContent } from '@components/ui/card';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import type { Tweet as TweetType } from '@lib/types/tweet';
import type { User } from '@lib/types/user';

type ModernTweetCardProps = {
  tweet: TweetType & { user: User };
  className?: string;
};

export function ModernTweetCard({
  tweet,
  className
}: ModernTweetCardProps): JSX.Element {
  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-lg',
        'border-amber-200 dark:border-amber-800/30',
        'hover:border-amber-300 dark:hover:border-amber-700',
        'bg-white dark:bg-gray-800',
        'dark:hover:bg-amber-950/10 hover:bg-amber-50/30',
        'group flex h-full flex-col',
        className
      )}
    >
      <CardContent className='flex flex-1 flex-col p-6'>
        <div className='mb-3 flex items-start gap-3'>
          <div className='flex-shrink-0 rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30'>
            <BookOpen className='h-4 w-4 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <Tweet {...tweet} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type ModernTweetListProps = {
  tweets: (TweetType & { user: User })[];
  loading?: boolean;
  error?: boolean;
  className?: string;
};

export function ModernTweetList({
  tweets,
  loading,
  error,
  className
}: ModernTweetListProps): JSX.Element {
  if (loading) {
    return (
      <Card className='border-amber-200 bg-white dark:border-amber-800/30 dark:bg-gray-800'>
        <CardContent className='flex min-h-[200px] items-center justify-center p-6'>
          <div className='text-center'>
            <Loading className='mt-5' />
            <p className='mt-2 text-amber-600 dark:text-amber-400'>
              Loading reviews...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error ?? !tweets) {
    return (
      <Card className='border-amber-200 bg-white dark:border-amber-800/30 dark:bg-gray-800'>
        <CardContent className='flex min-h-[200px] items-center justify-center p-6'>
          <div className='text-center'>
            <Error message='Something went wrong' />
            <p className='mt-2 text-amber-600 dark:text-amber-400'>
              Unable to load reviews
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tweets.length === 0) {
    return (
      <Card className='border-amber-200 bg-white dark:border-amber-800/30 dark:bg-gray-800'>
        <CardContent className='flex min-h-[200px] items-center justify-center p-6'>
          <div className='text-center'>
            <BookOpen className='mx-auto mb-4 h-12 w-12 text-amber-400' />
            <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              No reviews yet
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Be the first to share what you&apos;re watching!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
        className
      )}
    >
      {tweets.map((tweet) => (
        <ModernTweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}
