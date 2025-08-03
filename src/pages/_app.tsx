import '@styles/globals.scss';

import { isSupported, logEvent } from 'firebase/analytics';
import { AuthContextProvider } from '@lib/context/auth-context';
import { ThemeContextProvider } from '@lib/context/theme-context';
import { AppHead } from '@components/common/app-head';
import { GlobalLayout } from '@components/layout/global-layout';
import type { NextPage } from 'next';
import { ReactElement, ReactNode, useEffect } from 'react';
import type { AppProps } from 'next/app';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps
}: AppPropsWithLayout): ReactNode {
  const getLayout = Component.getLayout ?? ((page): ReactNode => page);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      isSupported()
        .then((supported) => {
          if (supported) {
            import('firebase/analytics')
              .then(({ getAnalytics }) => {
                const analytics = getAnalytics();
                logEvent(analytics, 'page_view');
              })
              .catch((error) => {
                // console.error('Error loading Firebase Analytics:', error);
              });
          }
        })
        .catch((error) => {
          // console.error(
          //   'Error checking for Firebase Analytics support:',
          //   error
          // );
        });
    }
  }, []);

  return (
    <>
      <AppHead />
      <AuthContextProvider>
        <ThemeContextProvider>
          <GlobalLayout>
            {getLayout(<Component {...pageProps} />)}
          </GlobalLayout>
        </ThemeContextProvider>
      </AuthContextProvider>
    </>
  );
}
