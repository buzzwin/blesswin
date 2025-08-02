import { Film, Tv } from 'lucide-react';

interface FallbackImageProps {
  mediaType: 'movie' | 'tv';
  className?: string;
}

export function FallbackImage({
  mediaType,
  className = ''
}: FallbackImageProps) {
  const Icon = mediaType === 'movie' ? Film : Tv;

  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded bg-gray-200 dark:bg-gray-700 ${className}`}
    >
      <Icon className='h-6 w-6 text-gray-400' />
    </div>
  );
}
