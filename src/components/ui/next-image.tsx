import { useState } from 'react';
import Image from 'next/image';
import cn from 'clsx';
import type { ReactNode } from 'react';
import { FallbackImage } from './fallback-image';
import type { ImageProps } from 'next/image';

type NextImageProps = {
  alt: string;
  width?: string | number;
  children?: ReactNode;
  useSkeleton?: boolean;
  imgClassName?: string;
  previewCount?: number;
  blurClassName?: string;
  mediaType?: 'movie' | 'tv';
} & ImageProps;

/**
 *
 * @description Must set width and height, if not add layout='fill'
 * @param useSkeleton add background with pulse animation, don't use it if image is transparent
 */
export function NextImage({
  src,
  alt,
  width,
  height,
  children,
  className,
  useSkeleton,
  imgClassName,
  previewCount,
  blurClassName,
  mediaType = 'movie',
  ...rest
}: NextImageProps): JSX.Element {
  const [loading, setLoading] = useState(!!useSkeleton);
  const [error, setError] = useState(false);

  const handleLoad = (): void => setLoading(false);
  const handleError = (): void => {
    setError(true);
    setLoading(false);
  };

  // If there's an error, show fallback
  if (error) {
    return (
      <figure style={{ width }} className={className}>
        <FallbackImage mediaType={mediaType} className={imgClassName} />
        {children}
      </figure>
    );
  }

  return (
    <figure style={{ width }} className={className}>
      <Image
        className={cn(
          imgClassName,
          loading
            ? blurClassName ??
                'animate-pulse bg-light-secondary dark:bg-dark-secondary'
            : previewCount === 1
            ? '!h-auto !min-h-0 !w-auto !min-w-0 rounded-lg object-contain'
            : 'object-cover'
        )}
        src={src}
        width={width}
        height={height}
        alt={alt}
        onLoadingComplete={handleLoad}
        onError={handleError}
        layout='responsive'
        {...rest}
      />
      {children}
    </figure>
  );
}
