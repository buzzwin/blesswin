import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Award, Crown, TrendingUp, Sparkles, Flame } from 'lucide-react';
import { cn } from '@lib/utils';
import { calculateLevel } from '@lib/utils/level-calculation';
import type { LeaderboardEntry } from '@lib/types/ritual';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

type TimePeriod = 'daily' | 'weekly' | 'all-time';

const rankIcons = [
  { rank: 1, icon: Crown, color: 'text-yellow-500' },
  { rank: 2, icon: Trophy, color: 'text-gray-400' },
  { rank: 3, icon: Medal, color: 'text-orange-600' }
];

export function Leaderboard({
  entries,
  currentUserId,
  className
}: LeaderboardProps): JSX.Element {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');

  const filteredEntries = entries.slice(0, 10); // Top 10
  const currentUserEntry = entries.find(e => e.userId === currentUserId);
  const currentUserRank = currentUserEntry ? currentUserEntry.rank : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Trophy className='h-5 w-5 text-yellow-500' />
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Leaderboard
          </h3>
        </div>
      </div>

      {/* Time Period Filter */}
      <div className='flex gap-2'>
        {(['daily', 'weekly', 'all-time'] as TimePeriod[]).map(period => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium transition-colors md:px-3 md:py-1.5',
              timePeriod === period
                ? 'bg-[#C97D60] text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-[#231a10] dark:text-[#C4B5A0]'
            )}
          >
            {period === 'all-time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className='space-y-1.5 md:space-y-2'>
        {filteredEntries.length === 0 ? (
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-[#2a1d10] dark:bg-[#1c1510] md:p-8'>
            <Trophy className='mx-auto mb-2 h-8 w-8 text-gray-400 md:h-12 md:w-12' />
            <p className='text-xs text-gray-600 dark:text-[#9E8B76] md:text-sm'>
              No rankings yet. Be the first!
            </p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            const rank = index + 1;
            const RankIcon = rankIcons.find(r => r.rank === rank)?.icon;
            const rankColor = rankIcons.find(r => r.rank === rank)?.color;
            const isCurrentUser = entry.userId === currentUserId;
            const level = calculateLevel(entry.karmaPoints);

            return (
              <Link
                key={entry.userId}
                href={`/user/${entry.username}`}
              >
                <a
                  className={cn(
                    'flex items-center gap-2 rounded-lg border-2 p-2 transition-all md:gap-3 md:rounded-xl md:p-3',
                    isCurrentUser
                      ? 'border-[#C9A96E] bg-[rgba(201,169,110,0.06)] dark:border-[#C9A96E] dark:bg-[rgba(201,169,110,0.08)]'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:border-gray-600'
                  )}
                >
                  {/* Rank */}
                  <div className='flex w-8 shrink-0 items-center justify-center'>
                    {RankIcon ? (
                      <RankIcon className={cn('h-6 w-6', rankColor)} />
                    ) : (
                      <span className='text-sm font-bold text-gray-500 dark:text-[#9E8B76]'>
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className='h-8 w-8 shrink-0 overflow-hidden rounded-full md:h-10 md:w-10'>
                    <img
                      src={entry.photoURL || '/default-avatar.png'}
                      alt={entry.name}
                      className='h-full w-full object-cover'
                    />
                  </div>

                  {/* User Info */}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5 md:gap-2'>
                      <p className='truncate text-sm font-semibold text-gray-900 dark:text-white md:text-base'>
                        {entry.name}
                      </p>
                      {isCurrentUser && (
                        <span className='rounded-full bg-[rgba(201,169,110,0.1)] px-1.5 py-0.5 text-xs font-medium text-[#8a6520] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C9A96E]'>
                          You
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-1 text-xs text-gray-600 dark:text-[#9E8B76] md:gap-2'>
                      <span>@{entry.username}</span>
                      <span>•</span>
                      <span>Level {level}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className='flex shrink-0 flex-col items-end gap-0.5 md:gap-1'>
                    <div className='flex items-center gap-1'>
                      <Sparkles className='h-3 w-3 text-[#C9A96E] dark:text-[#C9A96E]' />
                      <span className='text-xs font-bold text-gray-900 dark:text-white md:text-sm'>
                        {entry.karmaPoints.toLocaleString()}
                      </span>
                    </div>
                    <div className='text-xs text-gray-600 dark:text-[#9E8B76]'>
                      {entry.totalCompleted} completed
                    </div>
                    {entry.currentStreak > 0 && (
                      <div className='flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400'>
                        <Flame className='h-3 w-3' />
                        {entry.currentStreak}
                      </div>
                    )}
                  </div>
                </a>
              </Link>
            );
          })
        )}
      </div>

      {/* Current User Rank (if not in top 10) */}
      {currentUserRank && currentUserRank > 10 && currentUserEntry && (
        <div className='rounded-xl border-2 border-[#C9A96E] bg-[rgba(201,169,110,0.06)] p-3 dark:border-[#C9A96E] dark:bg-[rgba(201,169,110,0.08)]'>
          <div className='mb-2 flex items-center gap-2'>
            <TrendingUp className='h-4 w-4 text-[#C9A96E] dark:text-[#C9A96E]' />
            <span className='text-xs font-medium text-[#8a6520] dark:text-[#C9A96E]'>
              Your Rank
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-bold text-[#8a6520] dark:text-[#C9A96E]'>
              #{currentUserRank}
            </span>
            <div className='flex-1'>
              <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                {currentUserEntry.name}
              </p>
              <div className='flex items-center gap-2 text-xs text-gray-600 dark:text-[#9E8B76]'>
                <span>{currentUserEntry.karmaPoints.toLocaleString()} karma</span>
                <span>•</span>
                <span>Level {calculateLevel(currentUserEntry.karmaPoints)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

