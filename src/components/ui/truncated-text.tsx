import { useState } from 'react';
import { Button } from './button-shadcn';
import { cn } from '@lib/utils';

type TruncatedTextProps = {
  text: string;
  maxLength?: number;
  className?: string;
  showSeeMore?: boolean;
};

export function TruncatedText({
  text,
  maxLength = 200,
  className,
  showSeeMore = true
}: TruncatedTextProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength) + '...';

  if (!shouldTruncate) {
    return (
      <p
        className={cn(
          'text-[15px] leading-relaxed text-gray-600 dark:text-gray-400',
          className
        )}
      >
        {text}
      </p>
    );
  }

  return (
    <div className='space-y-2'>
      <p
        className={cn(
          'text-[15px] leading-relaxed text-gray-600 dark:text-gray-400',
          className
        )}
      >
        {displayText}
      </p>
      {showSeeMore && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className='h-auto p-0 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300'
        >
          {isExpanded ? 'See less' : 'See more'}
        </Button>
      )}
    </div>
  );
}
