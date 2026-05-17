import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { fetchJSON } from '@lib/fetch';
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
    <SWRConfig value={{ fetcher: fetchJSON }}>
      <div className='w-full'>{children}</div>
      <Toaster position='bottom-center' toastOptions={toastOptions} />
    </SWRConfig>
  );
}
