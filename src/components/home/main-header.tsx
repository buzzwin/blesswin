import cn from 'clsx';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import type { ReactNode } from 'react';
import type { IconName } from '@components/ui/hero-icon';

type HomeHeaderProps = {
  tip?: string;
  title?: string;
  children?: ReactNode;
  iconName?: IconName;
  className?: string;
  disableSticky?: boolean;
  useActionButton?: boolean;
  useMobileSidebar?: boolean;
  action?: () => void;
};

export function MainHeader({
  tip,
  title,
  children,
  iconName,
  className,
  disableSticky,
  useActionButton,
  action
}: HomeHeaderProps): JSX.Element {
  return (
    <header
      className={cn(
        'hover-animation z-10 backdrop-blur-md',
        'bg-main-background/85 border-b border-light-border dark:border-dark-border',
        // Mobile: stick to top (no top nav). Desktop: stick below the 48px top nav bar.
        !disableSticky && 'sticky top-0 lg:top-12',
        // Default flex row with px — let children override via className
        className ?? 'flex min-h-[52px] items-center gap-2 px-2 py-1'
      )}
    >
      {useActionButton && (
        <Button
          className='dark-bg-tab group relative h-10 w-10 rounded-full p-2 hover:bg-light-primary/10 active:bg-light-primary/20 dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
          onClick={action}
        >
          <HeroIcon className='h-5 w-5' iconName={iconName ?? 'HomeIcon'} />
          <ToolTip tip={tip ?? 'Back'} />
        </Button>
      )}
      {title && (
        <div className='flex flex-1 items-center justify-between px-2'>
          <h2 className='font-display text-[17px] font-bold tracking-tight lg:text-xl' key={title}>
            {title}
          </h2>
        </div>
      )}
      {children}
    </header>
  );
}
