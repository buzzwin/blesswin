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
        'mx-auto flex min-h-screen w-full flex-col',
        'bg-main-background',
        'lg:max-w-2xl lg:border-x lg:border-[#e8d8c4] dark:lg:border-[#2a1d10]',
        'transition-colors duration-150',
        'relative',
        // bottom padding: extra on mobile for floating tab bar, less on desktop
        'pb-28 lg:pb-10',
        className
      )}
    >
      <div className='w-full px-4 lg:px-3'>{children}</div>
    </main>
  );
}
