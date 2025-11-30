import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionShell } from '@components/layout/section-shell';
import { LoadingDots } from '@components/ui/loading';

interface HeroSectionProps {
  onGetInvolved: () => void;
  onSeeRealStories: () => void;
  navigating: boolean;
}

export function HeroSection({
  onGetInvolved,
  onSeeRealStories,
  navigating
}: HeroSectionProps): JSX.Element {
  return (
    <SectionShell className='relative overflow-hidden bg-gradient-to-br from-cream via-white to-sky/10'>
      {/* Decorative background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky/20 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-action/10 blur-3xl' />
      </div>

      <div className='relative mx-auto w-full max-w-4xl px-6'>
        <div className='text-center'>
          {/* Animated heading with stagger effect */}
          <h1 className='mb-6 animate-fade-in-up text-4xl font-bold leading-[1.15] tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl'>
            Empowering people.{' '}
            <span className='bg-gradient-to-r from-action via-hope to-action bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]'>
              One small action
            </span>{' '}
            at a time.
          </h1>
          
          {/* Animated description */}
          <p className='mx-auto mb-12 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl lg:text-2xl [animation-delay:150ms]'>
            We amplify stories of creativity, kindness, and community impact. 
            Join us in building a more hopeful world.
          </p>

          {/* Modern button group */}
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up [animation-delay:300ms]'>
            <button
              onClick={onGetInvolved}
              className='group relative overflow-hidden rounded-full bg-gradient-to-r from-action to-hope px-8 py-4 text-base font-semibold text-white shadow-lg shadow-action/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-action/40 active:scale-95'
            >
              <span className='relative z-10 flex items-center gap-2'>
                Get Involved
                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
              </span>
              <div className='absolute inset-0 bg-gradient-to-r from-hope to-action opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            </button>
            
            <Link href='/real-stories'>
              <a
                onClick={onSeeRealStories}
                className='group inline-flex items-center justify-center rounded-full border-2 border-gray-900/10 bg-white/80 px-8 py-4 text-base font-semibold text-gray-900 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-gray-900/20 hover:bg-white hover:shadow-lg dark:border-gray-200/10 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:border-gray-200/20 dark:hover:bg-gray-800'
              >
                {navigating ? (
                  <span className='flex items-center gap-2'>
                    <LoadingDots size='sm' />
                    Loading...
                  </span>
                ) : (
                  <>
                    See Real Stories
                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </>
                )}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
