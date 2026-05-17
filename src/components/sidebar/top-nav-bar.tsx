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

// Routes that have their own full-screen header — hide the nav bar on these
const STANDALONE_ROUTES = new Set([
  '/b/[token]',
  '/buzzes/[buzzId]/reveal',
  '/login',
  '/',
  '/privacy',
  '/tos'
]);

export function TopNavBar(): JSX.Element | null {
  const { pathname } = useRouter();
  const { user } = useAuth();

  if (!user || STANDALONE_ROUTES.has(pathname)) return null;

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
      className='sticky top-0 z-50 hidden border-b border-[#e8d8c4] bg-[#faf8f4]/95 backdrop-blur-md
                 dark:border-[#2a1d10] dark:bg-[#0f0b06]/95 lg:block'
    >
      <div className='flex h-12 items-center justify-between px-3 sm:px-5'>

        {/* Logo */}
        <Link href='/home'>
          <a className='flex shrink-0 items-center gap-2'>
            <svg
              viewBox='0 0 64 64'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='h-7 w-7'
              aria-label='Buzzwin'
            >
              <path d='M32 28 Q22 24 12 28 L12 50 Q22 46 32 50 Z'
                fill='#FFB300' stroke='#7a3e20' strokeWidth='1.5' strokeLinejoin='round'/>
              <path d='M32 28 Q42 24 52 28 L52 50 Q42 46 32 50 Z'
                fill='#E5407A' stroke='#7a3e20' strokeWidth='1.5' strokeLinejoin='round'/>
              <line x1='32' y1='28' x2='32' y2='50' stroke='#7a3e20' strokeWidth='1.5' strokeLinecap='round'/>
              <line x1='17' y1='33' x2='29' y2='32' stroke='#4a2810' strokeOpacity='0.45' strokeWidth='1' strokeLinecap='round'/>
              <line x1='17' y1='37' x2='27' y2='36' stroke='#4a2810' strokeOpacity='0.45' strokeWidth='1' strokeLinecap='round'/>
              <line x1='17' y1='41' x2='29' y2='40' stroke='#4a2810' strokeOpacity='0.45' strokeWidth='1' strokeLinecap='round'/>
              <line x1='35' y1='32' x2='47' y2='33' stroke='#fff' strokeOpacity='0.55' strokeWidth='1' strokeLinecap='round'/>
              <line x1='37' y1='36' x2='47' y2='37' stroke='#fff' strokeOpacity='0.55' strokeWidth='1' strokeLinecap='round'/>
              <line x1='35' y1='40' x2='47' y2='41' stroke='#fff' strokeOpacity='0.55' strokeWidth='1' strokeLinecap='round'/>
              <path d='M32 3 L33.5 10.5 L40.5 12 L33.5 13.5 L32 21 L30.5 13.5 L23.5 12 L30.5 10.5 Z' fill='#FFB300'/>
              <path d='M48 9 L48.8 12 L52 13 L48.8 14 L48 17 L47.2 14 L44 13 L47.2 12 Z' fill='#2FB888'/>
              <path d='M14 12 L14.7 14.5 L17.5 15.5 L14.7 16.5 L14 19 L13.3 16.5 L10.5 15.5 L13.3 14.5 Z' fill='#6C7CFF'/>
              <path d='M21 23 Q23 21 25 23' stroke='#9B6FD9' strokeWidth='1.4' strokeLinecap='round' fill='none'/>
              <path d='M40 21 Q42 19 44 21' stroke='#FF8A3D' strokeWidth='1.4' strokeLinecap='round' fill='none'/>
              <circle cx='24' cy='18' r='1' fill='#E5407A'/>
              <circle cx='42' cy='25' r='0.9' fill='#FFB300'/>
              <circle cx='37' cy='20' r='0.8' fill='#2FB888'/>
              <circle cx='20' cy='13' r='0.7' fill='#FF8A3D'/>
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
