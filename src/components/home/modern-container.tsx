import cn from 'clsx';
import type { ReactNode } from 'react';

type ModernContainerProps = {
  children: ReactNode;
  className?: string;
};

export function ModernContainer({
  children,
  className
}: ModernContainerProps): JSX.Element {
  return (
    <main
      className={cn(
        'flex min-h-screen w-full flex-col',
        'dark:from-amber-950/5 bg-gradient-to-b from-amber-50/30 to-gray-50 dark:to-gray-900',
        'relative',
        'pb-20',
        className
      )}
    >
      {children}
    </main>
  );
}
