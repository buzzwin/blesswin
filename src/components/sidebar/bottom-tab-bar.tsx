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
  { href: '/home', label: 'Home', icon: 'HomeIcon' },
  {
    href: '/buzzes',
    label: 'Buzzes',
    icon: 'GiftIcon',
    match: (p) => p.startsWith('/buzzes')
  },
  { href: '/people', label: 'Discover', icon: 'UsersIcon' }
];

// Routes where we never show the tab bar
const HIDDEN_ROUTES = new Set([
  '/b/[token]',
  '/buzzes/[buzzId]/reveal',
  '/login',
  '/',
  '/privacy',
  '/tos'
]);

export function BottomTabBar(): JSX.Element | null {
  const { pathname } = useRouter();
  const { user } = useAuth();

  if (!user || HIDDEN_ROUTES.has(pathname)) return null;

  const profileHref = `/user/${user.username}`;

  const allTabs: Tab[] = [
    TABS[0],
    TABS[1],
    // "+" new buzzbook — center primary
    TABS[2],
    {
      href: profileHref,
      label: 'Profile',
      icon: 'UserIcon',
      match: (p) => p.startsWith('/user/')
    }
  ];

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe lg:hidden'
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <div
        className='flex items-center justify-around rounded-[28px] px-2 py-2'
        style={{
          background: 'rgba(20,15,8,0.88)',
          border: '1px solid rgba(201,169,110,0.22)',
          backdropFilter: 'blur(24px) saturate(160%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(201,169,110,0.1)'
        }}
      >
        {/* Regular tabs (Home, Buzzes) */}
        {[allTabs[0], allTabs[1]].map(({ href, label, icon, match }) => {
          const isActive = match
            ? match(pathname)
            : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link href={href} key={href}>
              <a className='relative flex flex-1 flex-col items-center gap-1 py-1 transition-colors'
                style={{ color: isActive ? '#FFB300' : 'rgba(245,239,230,0.4)' }}>
                <HeroIcon iconName={icon} className='h-[22px] w-[22px]' solid={isActive} />
                <span className='text-[10px] font-bold leading-none tracking-wide'>{label}</span>
                {isActive && (
                  <span className='absolute -bottom-0.5 h-0.5 w-4 rounded-full'
                    style={{ background: '#FFB300' }} />
                )}
              </a>
            </Link>
          );
        })}

        {/* Centre "+" create button — festive gradient pill */}
        <Link href='/buzzes/new'>
          <a
            className='mx-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95'
            style={{
              background: 'var(--bw-grad-festival-cta)',
              boxShadow: 'var(--bw-shadow-glow-marigold), 0 2px 0 rgba(0,0,0,0.3)',
              color: '#1a1108'
            }}
            aria-label='New Buzzbook'
          >
            <svg viewBox='0 0 24 24' fill='none' className='h-6 w-6' stroke='currentColor' strokeWidth={2.5} strokeLinecap='round'>
              <path d='M12 5v14M5 12h14' />
            </svg>
          </a>
        </Link>

        {/* Regular tabs (Discover, Profile) */}
        {[allTabs[2], allTabs[3]].map(({ href, label, icon, match }) => {
          const isActive = match
            ? match(pathname)
            : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link href={href} key={href}>
              <a className='relative flex flex-1 flex-col items-center gap-1 py-1 transition-colors'
                style={{ color: isActive ? '#FFB300' : 'rgba(245,239,230,0.4)' }}>
                <HeroIcon iconName={icon} className='h-[22px] w-[22px]' solid={isActive} />
                <span className='text-[10px] font-bold leading-none tracking-wide'>{label}</span>
                {isActive && (
                  <span className='absolute -bottom-0.5 h-0.5 w-4 rounded-full'
                    style={{ background: '#FFB300' }} />
                )}
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
