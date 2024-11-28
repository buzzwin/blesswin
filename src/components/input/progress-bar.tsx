import cn from 'clsx';
import { ToolTip } from '@components/ui/tooltip';

type ProgressBarProps = {
  modal?: boolean;
  inputLimit: number;
  inputLength: number;
  isCharLimitExceeded: boolean;
};

const baseOffset = [56.5487, 87.9646] as const;

const circleStyles = [
  {
    container: null,
    viewBox: '0 0 20 20',
    stroke: {
      base: 'stroke-gray-200 dark:stroke-gray-700',
      progress: 'stroke-emerald-500 dark:stroke-emerald-400',
      warning: 'stroke-yellow-500 dark:stroke-yellow-400',
      error: 'stroke-red-500 dark:stroke-red-400'
    },
    r: 9
  },
  {
    container: 'scale-150',
    viewBox: '0 0 30 30',
    stroke: {
      base: 'stroke-gray-200 dark:stroke-gray-700',
      progress: 'stroke-emerald-500 dark:stroke-emerald-400',
      warning: 'stroke-yellow-500 dark:stroke-yellow-400',
      error: 'stroke-red-500 dark:stroke-red-400'
    },
    r: 14
  }
] as const;

export function ProgressBar({
  modal,
  inputLimit,
  inputLength,
  isCharLimitExceeded
}: ProgressBarProps): JSX.Element {
  const isCloseToLimit = inputLength >= inputLimit - 20;
  const baseCircle = baseOffset[+isCloseToLimit];

  const inputPercentage = (inputLength / inputLimit) * 100;
  const circleLength = baseCircle - (baseCircle * inputPercentage) / 100;

  const remainingCharacters = inputLimit - inputLength;
  const isHittingCharLimit = remainingCharacters <= 0;
  const isNearCharLimit = remainingCharacters <= 20;

  const { container, viewBox, stroke, r } = circleStyles[+isCloseToLimit];

  return (
    <button
      className={cn(
        'group relative flex items-center justify-center',
        'outline-none focus-visible:ring-2',
        'rounded-full transition-all duration-200',
        isHittingCharLimit
          ? 'focus-visible:ring-red-500'
          : 'focus-visible:ring-emerald-500'
      )}
      type='button'
    >
      <div
        className={cn(
          'relative flex items-center justify-center',
          'transition-all duration-200',
          container,
          remainingCharacters <= -10 && 'opacity-0'
        )}
      >
        <svg
          className='overflow-visible'
          width='100%'
          height='100%'
          viewBox={viewBox}
        >
          <circle
            className={stroke.base}
            cx='50%'
            cy='50%'
            fill='none'
            strokeWidth='2'
            r={r}
          />
          <circle
            className={cn(
              'transition-all duration-200',
              isHittingCharLimit
                ? stroke.error
                : isNearCharLimit
                ? stroke.warning
                : stroke.progress
            )}
            cx='50%'
            cy='50%'
            fill='none'
            strokeWidth='2'
            r={r}
            strokeLinecap='round'
            style={{
              strokeDashoffset: !isCharLimitExceeded ? circleLength : 0,
              strokeDasharray: baseCircle
            }}
          />
        </svg>
      </div>
      <span
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'text-xs font-bold',
          'transition-all duration-200',
          'scale-0 opacity-0',
          isCloseToLimit && 'scale-100 opacity-100',
          isHittingCharLimit
            ? 'text-red-500 dark:text-red-400'
            : isNearCharLimit
            ? 'text-yellow-500 dark:text-yellow-400'
            : 'text-emerald-500 dark:text-emerald-400'
        )}
      >
        {remainingCharacters}
      </span>
      <ToolTip
        tip={
          isCharLimitExceeded
            ? 'You have exceeded the character limit'
            : `${remainingCharacters} characters remaining`
        }
        modal={modal}
      />
    </button>
  );
}
