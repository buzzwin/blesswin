import type { ReactNode } from 'react';
import cn from 'clsx';

type SectionShellProps = {
  children: ReactNode;
  variant?: 'default' | 'dark' | 'darker' | 'gradient';
  className?: string;
};

export function SectionShell({
  children,
  variant = 'default',
  className
}: SectionShellProps): JSX.Element {
  const variantStyles = {
    default:
      'bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-purple-950 dark:to-slate-900',
    dark: 'bg-gray-50 dark:bg-gradient-to-b dark:from-slate-950 dark:to-black',
    darker:
      'bg-gray-100 dark:bg-gradient-to-b dark:from-black dark:via-slate-950 dark:to-black',
    gradient:
      'bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-slate-900'
  };

  return (
    <section
      className={cn(
        'relative w-full min-h-screen flex flex-col items-center justify-center transition-colors duration-200',
        variantStyles[variant],
        className
      )}
    >
      <div className='w-full'>
        {children}
      </div>
    </section>
  );
}
