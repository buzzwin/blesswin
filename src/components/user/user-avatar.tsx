import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@lib/utils';
import { DefaultAvatar } from '@components/ui/default-avatar';

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
          'blur-picture flex shrink-0 self-start',
          !username && 'pointer-events-none',
          className
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={48}
            height={48}
            className='rounded-full object-cover'
            layout='fixed'
          />
        ) : (
          <DefaultAvatar className='h-12 w-12 rounded-full' />
        )}
      </a>
    </Link>
  );
}
