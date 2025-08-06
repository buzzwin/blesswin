import { cn } from '@lib/utils';
import { TrendingShows } from '@components/trending/trending-shows';

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
      <TrendingShows
        trendingData={trendingData}
        limit={inTrendsPage ? 10 : 5}
        variant={inTrendsPage ? 'dark' : 'default'}
        useFirestore={!trendingData || trendingData.length === 0}
      />
    </section>
  );
}
