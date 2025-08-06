import cn from 'clsx';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { InputThemeRadio } from '@components/input/input-theme-radio';
import { Button } from '@components/ui/button';
import { InputAccentRadio } from '@components/input/input-accent-radio';
import type { Theme, Accent } from '@lib/types/theme';

type DisplayModalProps = {
  closeModal: () => void;
};

const themes: Readonly<[Theme, string][]> = [
  ['light', 'Light'],
  ['dim', 'Dim'],
  ['dark', 'Lights out']
];

const accentsColor: Readonly<Accent[]> = [
  'blue',
  'yellow',
  'pink',
  'purple',
  'orange',
  'green'
];

export function DisplayModal({ closeModal }: DisplayModalProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-6',
        'mx-auto w-full max-w-2xl',
        'p-6 md:p-8',
        'transition-all duration-200'
      )}
    >
      <div className='flex flex-col gap-3 text-center'>
        <h2
          className={cn(
            'text-2xl font-bold',
            'text-gray-900 dark:text-white',
            'transition-colors duration-200'
          )}
        >
          Customize your view
        </h2>
        <p
          className={cn(
            'text-gray-600 dark:text-gray-400',
            'transition-colors duration-200'
          )}
        >
          These settings affect all the Buzzwin accounts on this browser.
        </p>
      </div>
      <article
        className={cn(
          'w-full overflow-hidden',
          'rounded-2xl',
          'bg-white dark:bg-gray-800',
          'border border-gray-100 dark:border-gray-700',
          'shadow-sm dark:shadow-gray-900/10',
          'transition-all duration-200',
          'hover:shadow-md dark:hover:shadow-gray-900/20',
          'p-4 md:p-6'
        )}
      >
        <div className='grid grid-cols-[auto,1fr] gap-4'>
          <UserAvatar
            className='bg-gray-900'
            src='/logo.PNG'
            alt='buzzwin'
            username='buzzwin'
          />
          <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <UserName verified name='Buzzwin' />
              <div
                className={cn(
                  'flex items-center gap-1',
                  'text-gray-500 dark:text-gray-400',
                  'transition-colors duration-200'
                )}
              >
                <span>·</span>
                <span>26m</span>
              </div>
            </div>
            <p
              className={cn(
                'whitespace-pre-line break-words',
                'text-gray-700 dark:text-gray-300',
                'transition-colors duration-200'
              )}
            >
              Buzzwin is a social media platform that allows you to connect with
              like-minded people and share what you are watching with the world.
            </p>
          </div>
        </div>
      </article>
      <div className='flex w-full flex-col gap-3'>
        <p
          className={cn(
            'text-sm font-semibold',
            'text-gray-600 dark:text-gray-400',
            'transition-colors duration-200'
          )}
        >
          Color
        </p>
        <div
          className={cn(
            'grid grid-cols-3 xs:grid-cols-6',
            'gap-3 p-4',
            'rounded-2xl',
            'bg-gray-50 dark:bg-gray-800/50',
            'transition-colors duration-200'
          )}
        >
          {accentsColor.map((accentColor) => (
            <InputAccentRadio type={accentColor} key={accentColor} />
          ))}
        </div>
      </div>
      <div className='flex w-full flex-col gap-3'>
        <p
          className={cn(
            'text-sm font-semibold',
            'text-gray-600 dark:text-gray-400',
            'transition-colors duration-200'
          )}
        >
          Background
        </p>
        <div
          className={cn(
            'grid grid-rows-3 xs:grid-cols-3 xs:grid-rows-none',
            'gap-3 p-4',
            'rounded-2xl',
            'bg-gray-50 dark:bg-gray-800/50',
            'transition-colors duration-200'
          )}
        >
          {themes.map(([themeType, label]) => (
            <InputThemeRadio type={themeType} label={label} key={themeType} />
          ))}
        </div>
      </div>
      <Button
        className={cn(
          'px-8 py-2',
          'font-semibold',
          'rounded-full',
          'bg-emerald-500 dark:bg-emerald-600',
          'text-white',
          'transition-all duration-200',
          'hover:bg-emerald-600 dark:hover:bg-emerald-700',
          'active:bg-emerald-700 dark:active:bg-emerald-800',
          'focus-visible:ring-2 focus-visible:ring-emerald-500/50'
        )}
        onClick={closeModal}
      >
        Done
      </Button>
    </div>
  );
}
