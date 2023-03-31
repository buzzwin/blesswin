import Head from 'next/head';
import Link from 'next/link';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
}

export const PublicLayout: React.FC<Props> = ({
  children,
  title,
  description,
  ogImage,
  ogUrl
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={description} />
        <meta property='og:image' content={ogImage} />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:type' content='website' />
        <meta property='og:url' content={ogUrl} />
      </Head>

      <div className='bg-gray-100'>
        <nav className='bg-white shadow'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='flex h-16 justify-between'>
              <div className='flex'>
                <div className='flex flex-shrink-0 items-center'></div>
              </div>
            </div>
          </div>
        </nav>

        <div>
          <MainHeader />
          <div>{children}</div>
        </div>
      </div>
    </>
  );
};
