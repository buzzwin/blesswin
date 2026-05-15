import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { fetchJSON } from '@lib/fetch';
import { BottomTabBar } from '@components/sidebar/bottom-tab-bar';
import type { DefaultToastOptions } from 'react-hot-toast';
import type { ReactNode } from 'react';

const toastOptions: DefaultToastOptions = {
  style: {
    color: 'white',
    borderRadius: '4px',
    backgroundColor: 'rgb(var(--main-accent))'
  },
  success: { duration: 4000 }
};

export function MainLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className='w-full'>
      <SWRConfig value={{ fetcher: fetchJSON }}>{children}</SWRConfig>
      <BottomTabBar />
      <Toaster
        position='bottom-center'
        toastOptions={toastOptions}
        containerClassName='mb-20 xs:mb-0'
      />
    </div>
  );
}
