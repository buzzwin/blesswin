import { TrendingShows } from '@components/trending/trending-shows';
import { cn } from '@lib/utils';

type AsideTrendsProps = {
  inTrendsPage?: boolean;
};

export function AsideTrends({ inTrendsPage }: AsideTrendsProps): JSX.Element {
  return (
    <section className={cn('sticky top-0 py-4', inTrendsPage && 'mt-0.5')}>
      <TrendingShows
        limit={inTrendsPage ? 10 : 5}
        variant={inTrendsPage ? 'dark' : 'default'}
      />
    </section>
  );
}
