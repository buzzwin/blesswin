import Link from 'next/link';
import cn from 'clsx';
import { NextImage } from '@components/ui/next-image';
import { DefaultAvatar } from '@components/ui/default-avatar';

type UserAvatarProps = {
  src: string;
  alt: string;
  size?: number;
  username?: string;
  className?: string;
};

export function UserAvatar({
  src,
  alt,
  size,
  username,
  className
}: UserAvatarProps): JSX.Element {
  const pictureSize = size ?? 48;

  return (
    <Link href={username ? `/user/${username}` : '#'}>
      <div
        className={cn(
          'flex self-start',
          !username && 'pointer-events-none',
          className
        )}
        tabIndex={username ? 0 : -1}
      >
        {src ? (
          <NextImage
            useSkeleton
            imgClassName='rounded-full'
            width={pictureSize}
            height={pictureSize}
            src={src}
            alt={alt}
            key={src}
          />
        ) : (
          <DefaultAvatar
            className={cn(
              'rounded-full',
              'h-[48px] w-[48px]',
              size && `w-[${size}px] h-[${size}px]`
            )}
          />
        )}
      </div>
    </Link>
  );
}
