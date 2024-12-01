import { useAuth } from '@lib/context/auth-context';
import ActivityFeed from '@components/activity/activity';
import { TrendingShows } from '@components/trending/trending-shows';
import JustLogin from './justlogin';
import cn from 'clsx';

export function LoginMain(): JSX.Element {
  const { signInWithGoogle, signInWithFacebook } = useAuth();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1f35] to-gray-900 dark:from-black dark:via-gray-900 dark:to-black'>
      {/* Hero Section */}
      <div className='relative min-h-[30vh] w-full overflow-hidden'>
        <ActivityFeed />

        {/* Overlay Content */}
        <div className='absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm dark:bg-black/60'>
          <div className='mx-auto max-w-4xl px-4 text-center'>
            <div className='mb-2 transform transition-all duration-700 hover:scale-105'>
              <h2 className='bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-2xl font-bold text-transparent md:text-3xl lg:text-4xl'>
                Welcome to Buzzwin
              </h2>
            </div>
            <h1 className='text-3xl font-bold text-white transition-all duration-700 hover:text-emerald-400 md:text-4xl lg:text-5xl xl:text-6xl'>
              Your Next Favorite Show Awaits
            </h1>
            <p className='mx-auto mt-4 max-w-2xl text-lg text-gray-300 transition-colors duration-500 hover:text-white md:text-xl lg:text-2xl'>
              Join thousands of TV enthusiasts discovering and sharing their
              watching experience.
            </p>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className='relative mx-auto -mt-20 w-full max-w-screen-2xl px-4 pb-12 md:-mt-32'>
        <div className='grid gap-8 lg:grid-cols-2'>
          {/* Left Side - Features */}
          <div className='space-y-6'>
            {/* Add TrendingShows component */}
            <div className='transform transition-all duration-500 hover:scale-[1.02]'>
              <TrendingShows limit={5} variant='dark' />
            </div>

            <div className='hidden space-y-6 lg:block'>
              {[
                {
                  title: 'Track Your Shows',
                  description:
                    'Keep a record of everything you watch and discover new content based on your taste.'
                },
                {
                  title: 'Join the Community',
                  description:
                    'Connect with other TV enthusiasts, share recommendations, and discuss your favorite shows.'
                },
                {
                  title: 'Personalized Experience',
                  description:
                    'Get tailored recommendations and stay updated with what your friends are watching.'
                }
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className={cn(
                    'group rounded-2xl p-6 transition-all duration-500',
                    'bg-white/5 hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/40',
                    'backdrop-blur-sm hover:backdrop-blur-lg',
                    'border border-white/5 hover:border-emerald-500/20',
                    'transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10'
                  )}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <h2 className='text-2xl font-bold text-white transition-colors duration-500 group-hover:text-emerald-400'>
                    {feature.title}
                  </h2>
                  <p className='mt-2 text-gray-400 transition-colors duration-500 group-hover:text-gray-300'>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div
            className={cn(
              'transform transition-all duration-700 hover:scale-[1.02]',
              'rounded-2xl p-8',
              'bg-white/5 hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/40',
              'backdrop-blur-lg',
              'border border-white/10 hover:border-emerald-500/20',
              'shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10'
            )}
          >
            <JustLogin />
          </div>
        </div>
      </div>
    </div>
  );
}
