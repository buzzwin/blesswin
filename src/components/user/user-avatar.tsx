import Link from 'next/link';
import { NextImage } from '@components/ui/next-image';
import { DefaultAvatar } from '@components/ui/default-avatar';
import { cn } from '@lib/utils';

type UserAvatarProps = {
  src: string;
  alt: string;
  username?: string;
  className?: string;
};

export function UserAvatar({
  src,
  alt,
  username = 'user',
  className
}: UserAvatarProps): JSX.Element {
  if (src === 'default-avatar') {
    src = '';
  }

  return (
    <Link href={username ? `/user/${username}` : '#'}>
      <a
        className={cn(
          'blur-picture flex self-start',
          !username && 'pointer-events-none',
          className
        )}
      >
        {src ? (
          <NextImage
            useSkeleton
            imgClassName='rounded-full'
            width={48}
            height={48}
            src={src}
            alt={alt}
            key={src}
          />
        ) : (
          <DefaultAvatar className={cn('h-12 w-12', 'rounded-full')} />
        )}
      </a>
    </Link>
  );
}
