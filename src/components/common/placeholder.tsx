import { CustomIcon } from '@components/ui/custom-icon';
import { SEO } from './seo';

export function Placeholder(): JSX.Element {
  return (
    <main className='flex min-h-screen items-center justify-center'>
      <SEO
        title='Buzzwin'
        description='Tired of searching for the right movie or show to watch? Then you are in the right place!'
        image='/home.png'
      />
      <i>
        <CustomIcon className='h-20 w-20 text-[#1DA1F2]' iconName='PinIcon' />
      </i>
    </main>
  );
}
