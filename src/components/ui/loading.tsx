import cn from 'clsx';

interface LoadingProps {
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'book' | 'spinner' | 'dots' | 'pulse';
}

/** Animated open book — page flips right → left → right in the warm bohemian palette. */
function BookLoader({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        viewBox='0 0 128 86'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='h-16 w-24'
        aria-label='Loading'
        role='img'
      >
        <style>{`
          @keyframes bw-flip {
            0%        { transform: scaleX(1); }
            35%       { transform: scaleX(0); }
            50%, 60%  { transform: scaleX(-1); }
            85%       { transform: scaleX(0); }
            100%      { transform: scaleX(1); }
          }
          @keyframes bw-glow {
            0%, 100% { opacity: 0; }
            32%, 38% { opacity: 0.4; }
            82%, 88% { opacity: 0.4; }
          }
          .bw-flip-page {
            transform-box: fill-box;
            transform-origin: 0% 50%;
            animation: bw-flip 2.2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
          }
          .bw-glow {
            animation: bw-glow 2.2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
          }
        `}</style>

        {/* Left page — static */}
        <rect x='8' y='13' width='50' height='60' rx='4'
          fill='rgba(201,169,110,0.1)' stroke='rgba(201,169,110,0.38)' strokeWidth='1.5' />
        <rect x='16' y='25' width='30' height='3' rx='1.5' fill='rgba(201,169,110,0.28)' />
        <rect x='16' y='33' width='22' height='3' rx='1.5' fill='rgba(201,169,110,0.2)' />
        <rect x='16' y='41' width='26' height='3' rx='1.5' fill='rgba(201,169,110,0.14)' />
        <rect x='16' y='49' width='18' height='3' rx='1.5' fill='rgba(201,169,110,0.1)' />
        <circle cx='35' cy='61' r='5' fill='rgba(156,175,136,0.2)' />

        {/* Spine */}
        <rect x='57' y='11' width='14' height='64' rx='4' fill='rgba(181,96,60,0.72)' />
        <rect x='61' y='15' width='3' height='56' rx='1.5' fill='rgba(181,96,60,0.32)' />
        {/* spine flash when page passes */}
        <rect x='57' y='11' width='14' height='64' rx='4'
          fill='rgba(245,210,140,0.55)' className='bw-glow' />

        {/* Right page — static base (dimmer) */}
        <rect x='70' y='13' width='50' height='60' rx='4'
          fill='rgba(201,169,110,0.05)' stroke='rgba(201,169,110,0.25)' strokeWidth='1.5' />

        {/* Flipping page */}
        <g className='bw-flip-page'>
          <rect x='70' y='13' width='50' height='60' rx='4'
            fill='rgba(250,246,240,0.96)' stroke='rgba(201,169,110,0.58)' strokeWidth='1.2' />
          <rect x='78' y='25' width='32' height='3' rx='1.5' fill='rgba(201,169,110,0.46)' />
          <rect x='78' y='33' width='24' height='3' rx='1.5' fill='rgba(201,169,110,0.32)' />
          <rect x='78' y='41' width='28' height='3' rx='1.5' fill='rgba(201,169,110,0.22)' />
          <rect x='78' y='49' width='18' height='3' rx='1.5' fill='rgba(201,169,110,0.15)' />
          <circle cx='89' cy='61' r='5' fill='rgba(181,96,60,0.3)' />
        </g>
      </svg>

      <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9E8B76]'>
        Loading
      </p>
    </div>
  );
}

// ── Legacy variants ──────────────────────────────────────────────────────────

const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
const dotSizes    = { sm: 'h-1.5 w-1.5', md: 'h-2.5 w-2.5', lg: 'h-3.5 w-3.5' };

function GradientSpinner({ size = 'md', className = '', iconClassName = '' }: LoadingProps): JSX.Element {
  const sizeClass = iconClassName || sizeClasses[size];
  return (
    <div className={cn('relative', sizeClass, className)}>
      <div className='absolute inset-0 rounded-full border-2 border-gray-200 dark:border-[#2a1d10]' />
      <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#C9A96E] border-r-[#C97D60]' />
    </div>
  );
}

function DotsLoader({ size = 'md', className = '' }: LoadingProps): JSX.Element {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn(dotSizes[size], 'animate-bounce rounded-full bg-[#C9A96E] [animation-delay:-0.3s]')} />
      <div className={cn(dotSizes[size], 'animate-bounce rounded-full bg-[#C97D60] [animation-delay:-0.15s]')} />
      <div className={cn(dotSizes[size], 'animate-bounce rounded-full bg-[#9CAF88]')} />
    </div>
  );
}

function PulseLoader({ size = 'md', className = '', iconClassName = '' }: LoadingProps): JSX.Element {
  const sizeClass = iconClassName || sizeClasses[size];
  return (
    <div className={cn('relative', sizeClass, className)}>
      <div className='absolute inset-0 animate-ping rounded-full bg-[#C9A96E] opacity-75' />
      <div className='relative h-full w-full rounded-full bg-[#C97D60]' />
    </div>
  );
}

// ── Public API ───────────────────────────────────────────────────────────────

export function Loading({
  className = '',
  iconClassName = '',
  size = 'md',
  variant = 'book'
}: LoadingProps): JSX.Element {
  if (iconClassName) return <GradientSpinner size={size} className={className} iconClassName={iconClassName} />;
  if (variant === 'spinner') return <GradientSpinner size={size} className={className} />;
  if (variant === 'dots')    return <DotsLoader size={size} className={className} />;
  if (variant === 'pulse')   return <PulseLoader size={size} className={className} iconClassName={iconClassName} />;
  return <BookLoader className={className} />;
}

export function LoadingSpinner(props: Omit<LoadingProps, 'variant'>): JSX.Element {
  return <Loading {...props} variant='spinner' />;
}
export function LoadingDots(props: Omit<LoadingProps, 'variant'>): JSX.Element {
  return <Loading {...props} variant='dots' />;
}
export function LoadingPulse(props: Omit<LoadingProps, 'variant'>): JSX.Element {
  return <Loading {...props} variant='pulse' />;
}
