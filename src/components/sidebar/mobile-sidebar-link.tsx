import Link from 'next/link';
import cn from 'clsx';
import { Sparkles, Clock, User } from 'lucide-react';
import { preventBubbling } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import type { MobileNavLink } from '@components/modal/mobile-sidebar-modal';

type MobileSidebarLinkProps = MobileNavLink & {
  bottom?: boolean;
};

export function MobileSidebarLink({
  href,
  bottom,
  linkName,
  iconName,
  disabled
}: MobileSidebarLinkProps): JSX.Element {
  const getIcon = () => {
    switch (iconName) {
      case 'SparklesIcon':
        return <Sparkles className={bottom ? 'h-4 w-4' : 'h-5 w-5'} />;
      case 'ClockIcon':
        return <Clock className={bottom ? 'h-4 w-4' : 'h-5 w-5'} />;
      case 'UserIcon':
        return <User className={bottom ? 'h-4 w-4' : 'h-5 w-5'} />;
      default:
        return (
          <HeroIcon
            className={bottom ? 'h-4 w-4' : 'h-5 w-5'}
            iconName={iconName}
          />
        );
    }
  };

  return (
    <Link href={href} key={href}>
      <a
        className={cn(
          `custom-button accent-tab accent-bg-tab flex items-center rounded-lg font-medium 
           transition hover:bg-light-primary/10 focus-visible:ring-2 first:focus-visible:ring-[#878a8c]
           dark:hover:bg-dark-primary/10 dark:focus-visible:ring-white`,
          bottom ? 'gap-2 p-2 text-sm' : 'gap-3 p-3 text-base',
          disabled && 'cursor-not-allowed'
        )}
        onClick={disabled ? preventBubbling() : undefined}
      >
        {getIcon()}
        {linkName}
      </a>
    </Link>
  );
}
