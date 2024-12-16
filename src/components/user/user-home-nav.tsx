import Link from 'next/link';
import { useRouter } from 'next/router';
import cn from 'clsx';

type UserNavLink = {
  href: string;
  name: string;
  default?: boolean;
};

// Update user navigation to include Reviews
const userNavLinks: Readonly<UserNavLink[]> = [
  {
    href: '',
    name: 'Buzz',
    default: true
  },
  {
    href: '/reviews',
    name: 'Reviews'
  },
  {
    href: '/likes',
    name: 'Likes'
  },
  {
    href: '/watchlists',
    name: 'Watchlists'
  }
];

export function UserHomeNav(): JSX.Element {
  const { pathname } = useRouter();
  const currentPage = pathname.split('/').pop() ?? '';

  return (
    <nav className='flex gap-4'>
      {userNavLinks.map(({ href, name, default: isDefault }) => {
        const isActive = isDefault
          ? currentPage === '[id]'
          : href.includes(currentPage);

        return (
          <Link href={href} key={href}>
            <a
              className={cn(
                'flex flex-col gap-2 border-b-2 pb-2 hover:bg-light-primary/10 dark:hover:bg-dark-primary/10',
                isActive
                  ? 'border-main-accent text-light-primary dark:text-dark-primary'
                  : 'border-transparent text-light-secondary dark:text-dark-secondary'
              )}
            >
              {name}
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
