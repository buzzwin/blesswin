import { useAuth } from '@lib/context/auth-context';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';

export default function VerifyEmail(): JSX.Element {
  const { sendVerificationEmail, userEmail } = useAuth();

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-main-background p-4'>
      <div className='w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900'>
        <div className='text-center'>
          <HeroIcon
            iconName='EnvelopeIcon'
            className='mx-auto h-12 w-12 text-emerald-500'
          />
          <h2 className='mt-6 text-3xl font-bold text-gray-900 dark:text-white'>
            Verify your email
          </h2>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            We sent a verification email to {userEmail}
          </p>
        </div>

        <div className='space-y-4'>
          <Button className='w-full' onClick={sendVerificationEmail}>
            Resend verification email
          </Button>
          <p className='text-center text-sm text-gray-500'>
            Didn&apos;t receive the email? Check your spam folder
          </p>
        </div>
      </div>
    </div>
  );
}
