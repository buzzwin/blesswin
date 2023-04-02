import { FacebookIcon } from 'next-share';
import { useAuth } from '@lib/context/auth-context';
import { NextImage } from '@components/ui/next-image';
import { CustomIcon } from '@components/ui/custom-icon';
import { Button } from '@components/ui/button';
import LogoIcon from '@components/ui/logo';
import ActivityFeed from '@components/activity/activity';
import JustLogin from './justlogin';

export function LoginMain(): JSX.Element {
  const { signInWithGoogle } = useAuth();
  const { signInWithFacebook } = useAuth();

  return (
    <main className='w-full bg-gray-800 md:grid md:grid-cols-12'>
      <div className='mx-auto flex items-center justify-center md:col-span-6'>
        <JustLogin />
      </div>

      <div className='mx-auto flex items-center justify-center bg-gray-800 md:col-span-6'>
        <div className='md:mt-12'>
          <ActivityFeed />
        </div>
      </div>
    </main>
  );
}
