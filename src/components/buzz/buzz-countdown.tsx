import { useState, useEffect } from 'react';
import type { Timestamp } from 'firebase/firestore';

type Props = {
  revealAt: Timestamp;
  recipientName: string;
  onReveal: () => void;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(revealAt: Timestamp): TimeLeft {
  const diff = Math.max(0, revealAt.toMillis() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000)
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function BuzzCountdown({ revealAt, recipientName, onReveal }: Props): JSX.Element {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(revealAt));

  useEffect(() => {
    const tick = (): void => {
      const t = getTimeLeft(revealAt);
      setTimeLeft(t);
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        onReveal();
      }
    };

    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [revealAt, onReveal]);

  const revealDate = revealAt.toDate().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className='flex flex-col items-center gap-8 py-16 text-center'>
      <div>
        <span className='text-6xl'>📖</span>
        <h2 className='mt-4 text-2xl font-bold text-gray-900 dark:text-white'>
          {recipientName}&apos;s Buzzbook isn&apos;t ready yet
        </h2>
        <p className='mt-2 text-sm text-gray-500'>
          Come back on {revealDate} to see all the pages.
        </p>
      </div>

      {/* Clock */}
      <div className='flex items-end gap-3'>
        {[
          { value: timeLeft.days, label: 'days' },
          { value: timeLeft.hours, label: 'hrs' },
          { value: timeLeft.minutes, label: 'min' },
          { value: timeLeft.seconds, label: 'sec' }
        ].map(({ value, label }, i) => (
          <div key={label} className='flex items-end gap-3'>
            {i > 0 && (
              <span className='mb-3 text-2xl font-bold text-gray-300 dark:text-gray-600'>
                :
              </span>
            )}
            <div className='flex flex-col items-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700'>
                <span className='text-2xl font-bold tabular-nums text-gray-900 dark:text-white'>
                  {pad(value)}
                </span>
              </div>
              <span className='mt-1.5 text-xs text-gray-400'>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <p className='text-xs text-gray-400'>
        The page stays locked until the reveal moment.
      </p>
    </div>
  );
}
