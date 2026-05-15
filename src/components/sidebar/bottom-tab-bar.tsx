import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { HeroIcon } from '@components/ui/hero-icon';
import type { IconName } from '@components/ui/hero-icon';

type Tab = {
  href: string;
  label: string;
  icon: IconName;
  emoji?: string;
  match?: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  {
    href: '/home',
    label: 'Home',
    icon: 'HomeIcon'
  },
  {
    href: '/buzzes',
    label: 'Buzzbook',
    icon: 'GiftIcon',
    match: (p) => p.startsWith('/buzzes') || p.startsWith('/b/')
  },
  {
    href: '/ask',
    label: 'Ask',
    icon: 'ChatBubbleLeftRightIcon'
  },
  {
    href: '/people',
    label: 'Discover',
    icon: 'UsersIcon'
  }
];

export function BottomTabBar(): JSX.Element {
  const { pathname } = useRouter();
  const { user } = useAuth();

  const profileHref = user ? `/user/${user.username}` : '/home';

  const allTabs: Tab[] = [
    ...TABS,
    {
      href: profileHref,
      label: 'Profile',
      icon: 'UserIcon',
      match: (p) => p.startsWith('/user/')
    }
  ];

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 xs:hidden'>
      {allTabs.map(({ href, label, icon, match }) => {
        const isActive = match
          ? match(pathname)
          : pathname === href || pathname.startsWith(href + '/');

        return (
          <Link href={href} key={href}>
            <a
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-emerald-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <HeroIcon
                iconName={icon}
                className='h-5 w-5'
                solid={isActive}
              />
              <span className='text-[10px] font-semibold leading-none'>
                {label}
              </span>
              {isActive && (
                <span className='absolute bottom-1 h-0.5 w-5 rounded-full bg-emerald-500' />
              )}
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
