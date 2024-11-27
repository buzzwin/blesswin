import { useAuth } from '@lib/context/auth-context';
import ActivityFeed from '@components/activity/activity';
import JustLogin from './justlogin';

export function LoginMain(): JSX.Element {
  const { signInWithGoogle, signInWithFacebook } = useAuth();

  return (
    <div className='min-h-screen bg-[#1a1f35]'>
      {/* Hero Section */}
      <div className='relative min-h-[30vh] w-full overflow-hidden'>
        <ActivityFeed />

        {/* Overlay Content */}
        <div className='absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
          <div className='mx-auto max-w-4xl px-4 text-center'>
            <div className='mb-2'>
              <h2 className='text-2xl font-bold text-emerald-400 md:text-3xl lg:text-4xl'>
                Welcome to Buzzwin
              </h2>
            </div>
            <h1 className='text-3xl font-bold text-white md:text-4xl lg:text-5xl xl:text-6xl'>
              Your Next Favorite Show Awaits
            </h1>
            <p className='mx-auto mt-4 max-w-2xl text-lg text-gray-200 md:text-xl lg:text-2xl'>
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
          <div className='hidden space-y-6 lg:block'>
            <div className='rounded-2xl bg-white/5 p-6 backdrop-blur-sm'>
              <h2 className='text-2xl font-bold text-white'>
                Track Your Shows
              </h2>
              <p className='mt-2 text-gray-300'>
                Keep a record of everything you watch and discover new content
                based on your taste.
              </p>
            </div>
            <div className='rounded-2xl bg-white/5 p-6 backdrop-blur-sm'>
              <h2 className='text-2xl font-bold text-white'>
                Join the Community
              </h2>
              <p className='mt-2 text-gray-300'>
                Connect with other TV enthusiasts, share recommendations, and
                discuss your favorite shows.
              </p>
            </div>
            <div className='rounded-2xl bg-white/5 p-6 backdrop-blur-sm'>
              <h2 className='text-2xl font-bold text-white'>
                Personalized Experience
              </h2>
              <p className='mt-2 text-gray-300'>
                Get tailored recommendations and stay updated with what your
                friends are watching.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className='rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg'>
            <JustLogin />
          </div>
        </div>
      </div>
    </div>
  );
}
