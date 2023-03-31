import { useAuth } from '@lib/context/auth-context';
import { NextImage } from '@components/ui/next-image';
import { CustomIcon } from '@components/ui/custom-icon';
import { Button } from '@components/ui/button';
import LogoIcon from '@components/ui/logo';
import ActivityFeed from '@components/activity/activity';
import { FacebookIcon } from 'next-share';

export function LoginMain(): JSX.Element {
  const { signInWithGoogle } = useAuth();
  const { signInWithFacebook } = useAuth();

  return (
    <main className='grid grid-cols-1 gap-4 md:grid-cols-12'>
      <div className='md:col-span-1'></div>
      <div className='light:text-gray-700 bg-gray-800 md:col-span-4'>
        <div className='flex w-full flex-col items-center'>
          <div className='pt-16 pb-2 text-center text-2xl text-gray-400'>
            Tired of trying to find the right movie or show to watch?
          </div>
          <div className='pb-2 text-center text-2xl text-gray-300'>
            Then you are are in the right place!{' '}
          </div>
          <div className='mt-4'>
            <LogoIcon></LogoIcon>
          </div>

          <div className=' flex max-w-xs flex-col [&_button]:py-2'>
            <div className='grid gap-3 font-bold'>
              <Button
                className='flex justify-center gap-2 border border-light-line-reply font-bold text-dark-primary transition
                         hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white dark:text-dark-secondary
                         dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
                onClick={signInWithGoogle}
              >
                <CustomIcon iconName='GoogleIcon' /> Sign In or Sign Up with
                Google
              </Button>
              <Button
                className='flex justify-center gap-2 border border-light-line-reply font-bold text-dark-primary transition
                         hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white dark:text-dark-secondary
                         dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
                onClick={signInWithFacebook}
              >
                <FacebookIcon className='h-7 w-7' />
                Sign In or Sign Up with Facebook
              </Button>
              {/* <Button
              className='flex cursor-not-allowed justify-center gap-2 border border-light-line-reply font-bold text-light-primary
                         transition hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0
                         dark:bg-white dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
            >
              <CustomIcon iconName='AppleIcon' /> Sign up with Apple
            </Button>
            <div className='grid w-full grid-cols-[1fr,auto,1fr] items-center gap-2'>
              <i className='border-b border-light-border dark:border-dark-border' />
              <p>or</p>
              <i className='border-b border-light-border dark:border-dark-border' />
            </div>
            <Button
              className='cursor-not-allowed bg-accent-green text-white transition hover:brightness-90
                         focus-visible:!ring-accent-green/80 focus-visible:brightness-90 active:brightness-75'
            >
              Sign up with phone or email
            </Button> */}
              <p className='inner:custom-underline text-center text-xs text-light-secondary inner:text-accent-green dark:text-dark-secondary'>
                By signing up, you agree to the{' '}
                <a
                  href='https://buzzwin.com/tos'
                  target='_blank'
                  rel='noreferrer'
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href='https://buzzwin.com/privacy'
                  target='_blank'
                  rel='noreferrer'
                >
                  Privacy Policy
                </a>
                , including{' '}
                <a
                  href='https://help.buzzwin.com/rules-and-policies/twitter-cookies'
                  target='_blank'
                  rel='noreferrer'
                >
                  Cookie Use
                </a>
                .
              </p>
            </div>
            {/* <div className='flex flex-col items-center justify-center'>
              <p className='pt-4 pb-4 font-bold'>Already have an account? </p>
              <Button
                className='w-1/2 border border-light-line-reply font-bold text-accent-green
                         hover:bg-accent-yellow/10 focus-visible:bg-accent-green/10 focus-visible:!ring-accent-green/80
                         active:bg-accent-green/20 dark:border-light-secondary'
                onClick={signInWithGoogle}
              >
                Sign in
              </Button>
            </div> */}
          </div>
        </div>
      </div>

      <div className='light:bg-gray-600 col-span-6 mx-auto mt-4 h-2/3 items-center justify-items-center dark:bg-gray-900'>
        {/* <div className='pt-1 pb-2 text-center text-yellow-100'>
          Find out what others are watching.
        </div>
        <div className='pt-1 pb-2 text-center light:text-gray-700 dark:text-yellow-100'>
          Follow your friends or other like-minded people.
        </div>
        <div className='pt-1 pb-2 text-center text-gray-400 light:text-gray-700'>
          Coming Soon ! - Get recommendations based on your interests, tastes or
          mood.
        </div> */}
        <ActivityFeed />
      </div>
      <div className='col-span-1'>
        <div className='bg-image'>
          <NextImage
            imgClassName='object-cover'
            blurClassName='bg-accent-blue'
            src='/assets/background.jpg'
            alt='banner'
            layout='fill'
            blurDataURL='data:image/svg+xml;base64,[...]'
          />
        </div>
      </div>
    </main>
  );
}
