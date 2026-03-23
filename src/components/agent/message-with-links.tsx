import { Fragment } from 'react';

/**
 * Renders plain text with clickable http(s) URLs (for assistant messages).
 */
export function MessageWithLinks({ text }: { text: string }): JSX.Element {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/gi);

  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//i.test(part) ? (
          <a
            key={i}
            href={part}
            target='_blank'
            rel='noopener noreferrer'
            className='break-all font-medium text-purple-600 underline decoration-purple-600/40 underline-offset-2 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
