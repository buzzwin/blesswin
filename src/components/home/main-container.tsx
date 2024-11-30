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
        'flex min-h-screen w-full max-w-xl flex-col',
        'dark:bg-dark-background bg-main-background',
        'border-x border-light-border dark:border-dark-border',
        'transition-colors duration-200',
        'relative',
        'pb-96',
        className
      )}
    >
      {children}
    </main>
  );
}
