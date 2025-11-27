import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface ImpactCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: 'earth' | 'sage' | 'sky' | 'terracotta';
  onClick?: () => void;
}

const colorClasses = {
  earth: 'border-earth bg-cream text-charcoal',
  sage: 'border-sage bg-cream text-charcoal',
  sky: 'border-sky bg-cream text-charcoal',
  terracotta: 'border-terracotta bg-cream text-charcoal'
};

export function ImpactCard({
  title,
  description,
  icon,
  color,
  onClick
}: ImpactCardProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className='group w-full rounded-xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'
    >
      <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'>
        {icon}
      </div>
      <h3 className='mb-3 text-xl font-bold leading-tight text-gray-900 dark:text-white md:text-2xl'>
        {title}
      </h3>
      <p className='mb-4 text-base leading-relaxed text-gray-700 dark:text-gray-300'>
        {description}
      </p>
      <div className='flex items-center gap-2 text-sm font-semibold text-action'>
        Learn more
        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
      </div>
    </button>
  );
}

