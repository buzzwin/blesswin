import cn from 'clsx';
import { formatDate } from '@lib/date';
import { ToolTip } from '@components/ui/tooltip';
import type { Timestamp } from 'firebase/firestore';

type TweetDateProps = {
  createdAt: Timestamp;
  viewTweet?: boolean;
};

export function TweetDate({
  createdAt,
  viewTweet
}: TweetDateProps): JSX.Element {
  return (
    <div className={cn('flex gap-1', viewTweet && 'py-2')}>
      {!viewTweet && <i>·</i>}
      <div className='group relative'>
        <span
          className={cn(
            'whitespace-nowrap px-8',
            'text-sm',
            viewTweet
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {formatDate(createdAt, viewTweet ? 'full' : 'tweet')}
        </span>
        <ToolTip
          className='translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:delay-200'
          tip={formatDate(createdAt, 'full')}
        />
      </div>
    </div>
  );
}
