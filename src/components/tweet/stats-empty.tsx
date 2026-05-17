import cn from 'clsx';
import { EmptyStateIllustration } from '@components/ui/illustrations';

export type StatsEmptyProps = {
  title: string;
  modal?: boolean;
  description: string;
};

export function StatsEmpty({
  title,
  modal,
  description
}: StatsEmptyProps): JSX.Element {
  return (
    <div className={cn('flex justify-center p-8', modal && 'mt-[52px]')}>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col items-center gap-5'>
          <EmptyStateIllustration />
          <div className='flex flex-col gap-2 text-center'>
            <p className='text-3xl font-extrabold'>{title}</p>
            <p className='text-light-secondary dark:text-dark-secondary'>
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
