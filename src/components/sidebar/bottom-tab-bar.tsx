import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { HeroIcon } from '@components/ui/hero-icon';
import type { IconName } from '@components/ui/hero-icon';

type Tab = {
  href: string;
  label: string;
  icon: IconName;
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
    <nav className='fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t bg-[#0f0b06] border-[#2a1d10] xs:hidden'>
      {allTabs.map(({ href, label, icon, match }) => {
        const isActive = match
          ? match(pathname)
          : pathname === href || pathname.startsWith(href + '/');

        return (
          <Link href={href} key={href}>
            <a
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-[#C9A96E]'
                  : 'text-[#6b5744]'
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
                <span className='absolute bottom-1 h-0.5 w-5 rounded-full bg-[#C9A96E]' />
              )}
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
