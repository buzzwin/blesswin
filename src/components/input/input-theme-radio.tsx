import cn from 'clsx';
import { useTheme } from '@lib/context/theme-context';
import type { Theme } from '@lib/types/theme';
import { HeroIcon } from '@components/ui/hero-icon';

type InputThemeRadioProps = {
  type: Theme;
  label: string;
};

type InputThemeData = Record<
  Theme,
  {
    textColor: string;
    backgroundColor: string;
    ringColor: string;
    hoverRingColor: string;
    activeRingColor: string;
  }
>;

const inputThemeData: Readonly<InputThemeData> = {
  light: {
    textColor: 'text-gray-900',
    backgroundColor: 'bg-white',
    ringColor: 'ring-gray-200',
    hoverRingColor: 'hover:ring-gray-300',
    activeRingColor: 'active:ring-gray-400'
  },
  dim: {
    textColor: 'text-gray-100',
    backgroundColor: 'bg-[#15202B]',
    ringColor: 'ring-gray-700',
    hoverRingColor: 'hover:ring-gray-600',
    activeRingColor: 'active:ring-gray-500'
  },
  dark: {
    textColor: 'text-white',
    backgroundColor: 'bg-black',
    ringColor: 'ring-gray-800',
    hoverRingColor: 'hover:ring-gray-700',
    activeRingColor: 'active:ring-gray-600'
  }
};

export function InputThemeRadio({
  type,
  label
}: InputThemeRadioProps): JSX.Element {
  const { theme, changeTheme } = useTheme();

  const {
    textColor,
    backgroundColor,
    ringColor,
    hoverRingColor,
    activeRingColor
  } = inputThemeData[type];

  const isChecked = type === theme;

  return (
    <label
      className={cn(
        'group relative flex cursor-pointer items-center gap-3 rounded-xl p-4',
        'transition-all duration-200',
        backgroundColor,
        textColor,
        'ring-1',
        ringColor,
        hoverRingColor,
        activeRingColor,
        isChecked && 'ring-2 ring-emerald-500'
      )}
      htmlFor={type}
    >
      <div
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full',
          'transition-all duration-200',
          'ring-1',
          ringColor,
          'group-hover:ring-2',
          isChecked && 'ring-2 ring-emerald-500'
        )}
      >
        <input
          className='peer absolute inset-0 cursor-pointer opacity-0'
          id={type}
          type='radio'
          name='theme'
          value={type}
          checked={isChecked}
          onChange={changeTheme}
        />
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full',
            'transition-all duration-200',
            'ring-1',
            ringColor,
            isChecked && 'bg-emerald-500 ring-0'
          )}
        >
          <HeroIcon
            className={cn(
              'h-4 w-4 text-white',
              'transition-all duration-200',
              'opacity-0',
              isChecked && 'opacity-100'
            )}
            iconName='CheckIcon'
          />
        </div>
      </div>
      <span className='text-lg font-medium'>{label}</span>
    </label>
  );
}
