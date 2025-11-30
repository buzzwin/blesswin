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
  earth: 'from-earth/10 to-earth/5 border-earth/20 hover:border-earth/40',
  sage: 'from-sage/10 to-sage/5 border-sage/20 hover:border-sage/40',
  sky: 'from-sky/10 to-sky/5 border-sky/20 hover:border-sky/40',
  terracotta: 'from-terracotta/10 to-terracotta/5 border-terracotta/20 hover:border-terracotta/40'
};

const iconBgClasses = {
  earth: 'bg-gradient-to-br from-earth/20 to-earth/10 text-earth',
  sage: 'bg-gradient-to-br from-sage/20 to-sage/10 text-sage',
  sky: 'bg-gradient-to-br from-sky/20 to-sky/10 text-sky',
  terracotta: 'bg-gradient-to-br from-terracotta/20 to-terracotta/10 text-terracotta'
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
      className={`group relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br ${colorClasses[color]} p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:from-gray-800/50 dark:to-gray-900/50 dark:border-gray-700 dark:hover:border-gray-600`}
    >
      {/* Hover glow effect */}
      <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5' />
      
      <div className='relative'>
        <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${iconBgClasses[color]} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        
        <h3 className='mb-3 text-xl font-bold leading-tight text-gray-900 dark:text-white md:text-2xl'>
          {title}
        </h3>
        
        <p className='mb-4 text-base leading-relaxed text-gray-700 dark:text-gray-300'>
          {description}
        </p>
        
        <div className='flex items-center gap-2 text-sm font-semibold text-action dark:text-hope'>
          Learn more
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        </div>
      </div>
    </button>
  );
}

