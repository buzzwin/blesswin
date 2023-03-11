import Link from 'next/link';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';

interface Props {
  children: React.ReactNode;
  title?: string;
}

export const PublicLayout: React.FC<Props> = ({
  children,
  title = 'My Site'
}) => {
  return (
    <>
      <div className='bg-gray-100'>
        <nav className='bg-white shadow'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='flex h-16 justify-between'>
              <div className='flex'>
                <div className='flex flex-shrink-0 items-center'>
                  <Link href='/'>
                    <a className='text-2xl font-bold'>My Site</a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main>{children}</main>
      </div>
    </>
  );
};
