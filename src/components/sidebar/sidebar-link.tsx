import { useRouter } from 'next/router';
import Link from 'next/link';
import cn from 'clsx';
import { Sparkles, Clock, User, Star, Bot } from 'lucide-react';
import { preventBubbling } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import type { NavLink } from './sidebar';

type SidebarLinkProps = NavLink & {
  username?: string;
};

export function SidebarLink({
  href,
  username,
  iconName,
  linkName,
  disabled,
  canBeHidden
}: SidebarLinkProps): JSX.Element {
  const { asPath } = useRouter();
  const isActive = username ? asPath.includes(username) : asPath === href;

  const getIcon = () => {
    // Use Bot icon for Chat with Curator link
    if (href === '/curator') {
      return <Bot className='h-7 w-7' />;
    }

    switch (iconName) {
      case 'SparklesIcon':
        return <Sparkles className='h-7 w-7' />;
      case 'StarIcon':
        return <Star className='h-7 w-7' />;
      case 'ClockIcon':
        return <Clock className='h-7 w-7' />;
      case 'UserIcon':
        return <User className='h-7 w-7' />;
      default:
        return (
          <HeroIcon
            className={cn(
              'h-7 w-7',
              isActive &&
                ['Explore', 'Lists'].includes(linkName) &&
                'stroke-white'
            )}
            iconName={iconName}
            solid={isActive}
          />
        );
    }
  };

  return (
    <Link href={href}>
      <a
        className={cn(
          'group py-1 outline-none',
          canBeHidden ? 'hidden xs:flex' : 'flex',
          disabled && 'cursor-not-allowed'
        )}
        onClick={disabled ? preventBubbling() : undefined}
      >
        <div
          className={cn(
            `custom-button flex items-center justify-center gap-4 self-start p-2 text-xl transition 
             duration-200 group-hover:bg-light-primary/10 group-focus-visible:ring-2 
             group-focus-visible:ring-[#878a8c] dark:group-hover:bg-dark-primary/10 
             dark:group-focus-visible:ring-white xs:p-3 xl:pr-5`,
            isActive && 'font-bold'
          )}
        >
          {getIcon()}
          <p className='hidden xl:block'>{linkName}</p>
        </div>
      </a>
    </Link>
  );
}
