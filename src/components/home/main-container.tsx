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
        'hover-animation flex min-h-screen w-full max-w-xl flex-col',
        'dark:bg-dark-background bg-main-background',
        'border-x-0 border-light-border dark:border-dark-border',
        'transition-colors duration-200',
        'pb-96 xs:border-x',
        className
      )}
    >
      {children}
    </main>
  );
}
