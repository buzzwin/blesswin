import cn from 'clsx';
import type { ReactNode } from 'react';

type MainContainerProps = {
  children: ReactNode;
  className?: string;
};

export function MainContainer({
  children,
  className
}: MainContainerProps): JSX.Element {
  return (
    <main
      className={cn(
        'mx-auto flex min-h-screen w-full max-w-2xl flex-col',
        'bg-main-background',
        'border-x-0 border-light-border dark:border-dark-border sm:border-x',
        'transition-colors duration-200',
        'relative',
        'pb-96',
        className
      )}
    >
      <div className='w-full px-2 sm:px-3'>{children}</div>
    </main>
  );
}
