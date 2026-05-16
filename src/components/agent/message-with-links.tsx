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
            className='break-all font-medium text-[#C9A96E] underline decoration-purple-600/40 underline-offset-2 hover:text-[#8a6520] dark:text-[#C9A96E] dark:hover:text-purple-300'
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
