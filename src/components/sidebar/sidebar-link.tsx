import { useRouter } from 'next/router';
import Link from 'next/link';
import cn from 'clsx';
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
            `custom-button flex items-center justify-center gap-4 self-start p-2 text-xl
             transition duration-200 xs:p-3 xl:pr-5`,
            isActive
              ? 'font-bold text-[#C9A96E]'
              : 'text-[#9E8B76] group-hover:text-[#C9A96E] group-hover:bg-[rgba(201,169,110,0.08)]'
          )}
        >
          <HeroIcon
            className='h-7 w-7'
            iconName={iconName}
            solid={isActive}
          />
          <p className='hidden xl:block'>{linkName}</p>
        </div>
      </a>
    </Link>
  );
}
