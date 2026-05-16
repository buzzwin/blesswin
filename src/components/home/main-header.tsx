import cn from 'clsx';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { MobileSidebar } from '@components/sidebar/mobile-sidebar';
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
  useMobileSidebar,
  action
}: HomeHeaderProps): JSX.Element {
  return (
    <header
      className={cn(
        'hover-animation z-10 py-2 backdrop-blur-md',
        'bg-main-background/80 border-b border-light-border dark:border-dark-border',
        !disableSticky && 'sticky top-0',
        className ?? 'flex items-center gap-6'
      )}
    >
      {useActionButton && (
        <Button
          className='dark-bg-tab group relative p-2 hover:bg-light-primary/10 active:bg-light-primary/20 dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
          onClick={action}
        >
          <HeroIcon className='h-5 w-5' iconName={iconName ?? 'HomeIcon'} />
          <ToolTip tip={tip ?? 'Back'} />
        </Button>
      )}
      {title && (
        <div className='flex flex-1 items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h2 className='font-display text-xl font-bold' key={title}>
              {title}
            </h2>
          </div>
          {useMobileSidebar && <MobileSidebar />}
        </div>
      )}
      {children}
    </header>
  );
}
