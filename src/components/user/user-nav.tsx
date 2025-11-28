import { motion } from 'framer-motion';
import cn from 'clsx';
import { variants } from '@components/user/user-header';
import { UserNavLink } from './user-nav-link';

type UserNavProps = {
  follow?: boolean;
};

const allNavs = [
  [
    // Removed Buzz and Boosts tabs
  ],
  [
    { name: 'Fan', path: 'following' },
    { name: 'Fans', path: 'followers' }
  ]
] as const;

export function UserNav({ follow }: UserNavProps): JSX.Element {
  const userNav = allNavs[+!!follow];

  // Don't render nav if there are no tabs
  if (userNav.length === 0) {
    return <></>;
  }

  return (
    <motion.nav
      className={cn(
        `hover-animation flex justify-between overflow-y-auto
         border-b border-light-border dark:border-dark-border`,
        follow && 'mt-1 mb-0.5'
      )}
      {...variants}
      exit={undefined}
    >
      {userNav.map(({ name, path }) => (
        <UserNavLink name={name} path={path} key={name} />
      ))}
    </motion.nav>
  );
}
