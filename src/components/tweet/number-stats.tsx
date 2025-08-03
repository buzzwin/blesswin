import { motion } from 'framer-motion';
import { getStatsMove } from '@lib/utils';
import { formatNumber } from '@lib/date';

type NumberStatsProps = {
  move: number;
  stats: number;
  alwaysShowStats?: boolean;
};

export function NumberStats({
  move,
  stats,
  alwaysShowStats
}: NumberStatsProps): JSX.Element {
  return (
    <div className='overflow-hidden'>
      {(alwaysShowStats ?? !!stats) && (
        <motion.p className='text-sm' {...getStatsMove(move)} key={stats}>
          {formatNumber(stats)}
        </motion.p>
      )}
    </div>
  );
}
