import { Loading } from '@components/ui/loading';
import { SEO } from './seo';

export function Placeholder(): JSX.Element {
  return (
    <main className='flex min-h-screen items-center justify-center bg-[#f5f1ea] dark:bg-[#110d07]'>
      <SEO title='Buzzwin' />
      <Loading />
    </main>
  );
}
