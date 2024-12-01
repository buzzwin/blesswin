import { TrendingShows } from '@components/trending/trending-shows';
import { cn } from '@lib/utils';

export function AsideTrends(): JSX.Element {
  return (
    <section className={cn('sticky top-0 py-4')}>
      <TrendingShows limit={5} />
    </section>
  );
}
