import cn from 'clsx';
import { useTheme } from '@lib/context/theme-context';
import type { Accent } from '@lib/types/theme';
import { HeroIcon } from '@components/ui/hero-icon';

type InputAccentRadioProps = {
  type: Accent;
};

type InputAccentData = Record<
  Accent,
  {
    background: string;
    ring: string;
    hover: string;
    active: string;
  }
>;

const InputColors: Readonly<InputAccentData> = {
  yellow: {
    background: 'bg-accent-yellow',
    ring: 'ring-accent-yellow/30',
    hover: 'hover:ring-accent-yellow/50',
    active: 'active:ring-accent-yellow/70'
  },
  blue: {
    background: 'bg-accent-blue',
    ring: 'ring-accent-blue/30',
    hover: 'hover:ring-accent-blue/50',
    active: 'active:ring-accent-blue/70'
  },
  pink: {
    background: 'bg-accent-pink',
    ring: 'ring-accent-pink/30',
    hover: 'hover:ring-accent-pink/50',
    active: 'active:ring-accent-pink/70'
  },
  purple: {
    background: 'bg-accent-purple',
    ring: 'ring-accent-purple/30',
    hover: 'hover:ring-accent-purple/50',
    active: 'active:ring-accent-purple/70'
  },
  orange: {
    background: 'bg-accent-orange',
    ring: 'ring-accent-orange/30',
    hover: 'hover:ring-accent-orange/50',
    active: 'active:ring-accent-orange/70'
  },
  green: {
    background: 'bg-accent-green',
    ring: 'ring-accent-green/30',
    hover: 'hover:ring-accent-green/50',
    active: 'active:ring-accent-green/70'
  }
};

export function InputAccentRadio({ type }: InputAccentRadioProps): JSX.Element {
  const { accent, changeAccent } = useTheme();
  const { background, ring, hover, active } = InputColors[type];
  const isChecked = type === accent;

  return (
    <label
      className={cn(
        'group relative flex h-12 w-12 cursor-pointer items-center justify-center',
        'rounded-xl transition-all duration-200',
        background,
        'ring-1',
        ring,
        hover,
        active,
        isChecked && 'ring-2 ring-offset-2 dark:ring-offset-black'
      )}
      htmlFor={type}
    >
      <input
        className='peer absolute inset-0 cursor-pointer opacity-0'
        id={type}
        type='radio'
        name='accent'
        value={type}
        checked={isChecked}
        onChange={changeAccent}
      />
      <HeroIcon
        className={cn(
          'h-6 w-6 text-white',
          'transition-all duration-200',
          'scale-75 opacity-0',
          'group-hover:scale-90 group-hover:opacity-50',
          isChecked && 'scale-100 opacity-100'
        )}
        iconName='CheckIcon'
      />
    </label>
  );
}
