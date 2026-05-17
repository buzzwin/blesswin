import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { HeroIcon } from '@components/ui/hero-icon';
import type { IconName } from '@components/ui/hero-icon';

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  match?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/home',
    label: 'Home',
    icon: 'HomeIcon'
  },
  {
    href: '/buzzes',
    label: 'My Buzzes',
    icon: 'GiftIcon',
    match: (p) => p.startsWith('/buzzes') || p.startsWith('/b/')
  },
  {
    href: '/people',
    label: 'Discover',
    icon: 'UsersIcon'
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: 'CogIcon'
  }
];

export function TopNavBar(): JSX.Element | null {
  const { pathname } = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  const profileHref = `/user/${user.username}`;

  const allItems: NavItem[] = [
    ...NAV_ITEMS,
    {
      href: profileHref,
      label: 'Profile',
      icon: 'UserIcon',
      match: (p) => p.startsWith('/user/')
    }
  ];

  return (
    <nav
      className='sticky top-0 z-50 border-b border-[#e8d8c4] bg-[#faf8f4]/95 backdrop-blur-md
                 dark:border-[#2a1d10] dark:bg-[#0f0b06]/95'
    >
      <div className='flex h-12 items-center justify-between px-3 sm:px-5'>

        {/* Logo */}
        <Link href='/home'>
          <a className='flex shrink-0 items-center gap-2'>
            <svg
              viewBox='0 0 28 22'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-8'
              aria-hidden='true'
            >
              {/* mini open book mark */}
              <rect x='1' y='3' width='11' height='16' rx='2.5'
                fill='rgba(201,169,110,0.18)' stroke='rgba(201,169,110,0.7)' strokeWidth='1.4' />
              <rect x='14' y='3' width='11' height='16' rx='2.5'
                fill='rgba(201,169,110,0.18)' stroke='rgba(201,169,110,0.7)' strokeWidth='1.4' />
              <rect x='12' y='1.5' width='4' height='19' rx='2'
                fill='rgba(181,96,60,0.85)' />
              <rect x='4' y='8' width='5' height='1.5' rx='0.75' fill='rgba(201,169,110,0.6)' />
              <rect x='4' y='11.5' width='7' height='1.5' rx='0.75' fill='rgba(201,169,110,0.4)' />
              <rect x='17' y='8' width='5' height='1.5' rx='0.75' fill='rgba(201,169,110,0.6)' />
              <rect x='17' y='11.5' width='7' height='1.5' rx='0.75' fill='rgba(201,169,110,0.4)' />
            </svg>
            <span className='hidden font-display text-[15px] font-bold text-[#1a1108] dark:text-[#F5EFE6] sm:block'>
              Buzzwin
            </span>
          </a>
        </Link>

        {/* Nav items */}
        <div className='flex items-center gap-0.5 sm:gap-1'>
          {allItems.map(({ href, label, icon, match }) => {
            const isActive = match
              ? match(pathname)
              : pathname === href || pathname.startsWith(href + '/');

            return (
              <Link href={href} key={href}>
                <a
                  className={`relative flex flex-col items-center justify-center gap-0.5
                              rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors
                              ${isActive
                                ? 'text-[#C9A96E]'
                                : 'text-[#6b5744] hover:text-[#C9A96E] dark:text-[#9E8B76] dark:hover:text-[#C9A96E]'
                              }`}
                >
                  <HeroIcon
                    iconName={icon}
                    className='h-[18px] w-[18px] sm:h-5 sm:w-5'
                    solid={isActive}
                  />
                  <span className='hidden text-[9px] font-semibold leading-none sm:block'>
                    {label}
                  </span>
                  {isActive && (
                    <span className='absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[#C9A96E]' />
                  )}
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
