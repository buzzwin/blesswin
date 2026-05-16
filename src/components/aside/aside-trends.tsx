import { cn } from '@lib/utils';

type AsideTrendsProps = {
  inTrendsPage?: boolean;
  trendingData?: any[];
};

export function AsideTrends({
  inTrendsPage,
  trendingData
}: AsideTrendsProps): JSX.Element {
  return (
    <section className={cn('sticky top-0 py-4', inTrendsPage && 'mt-0.5')}>
      <div className='rounded-lg border border-gray-200 bg-[#faf8f4] p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
          Trending Content
        </h3>
        <p className='text-sm text-gray-600 dark:text-[#9E8B76]'>
          Trending content feature has been removed. Check out our AI
          recommendations instead!
        </p>
      </div>
    </section>
  );
}
