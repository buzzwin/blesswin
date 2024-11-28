import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDocument } from '@lib/hooks/useDocument';
import { tweetsCollection } from '@lib/firebase/collections';
import { Tweet } from '@components/tweet/tweet';
import cn from 'clsx';
import type { RefObject } from 'react';

type ViewParentTweetProps = {
  parentId: string;
  viewTweetRef: RefObject<HTMLElement>;
};

export function ViewParentTweet({
  parentId,
  viewTweetRef
}: ViewParentTweetProps): JSX.Element | null {
  const { data, loading } = useDocument(doc(tweetsCollection, parentId), {
    includeUser: true,
    allowNull: true
  });

  useEffect(() => {
    if (!loading) viewTweetRef.current?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, loading]);

  if (loading) return null;
  if (!data)
    return (
      <div className={cn('p-4', 'transition-all duration-200')}>
        <div
          className={cn(
            'rounded-2xl',
            'p-4',
            'bg-gray-50 dark:bg-gray-800/50',
            'border border-gray-100 dark:border-gray-700',
            'transition-all duration-200'
          )}
        >
          <p
            className={cn(
              'text-gray-600 dark:text-gray-400',
              'transition-colors duration-200'
            )}
          >
            This Buzz was deleted.{' '}
            <a
              className={cn(
                'text-emerald-500 dark:text-emerald-400',
                'hover:text-emerald-600 dark:hover:text-emerald-500',
                'underline',
                'transition-colors duration-200'
              )}
              href='https://help.buzzwin.com/rules-and-policies/notices-on-twitter'
              target='_blank'
              rel='noreferrer'
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    );

  return <Tweet parentTweet {...data} />;
}
