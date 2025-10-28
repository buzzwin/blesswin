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
        'relative overflow-hidden transition-colors duration-200',
        variantStyles[variant],
        className
      )}
    >
      {/* Subtle fade transitions */}
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-white/10' />
      <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-white/5' />
      {children}
    </section>
  );
}
