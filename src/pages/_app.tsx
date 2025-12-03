import '@styles/globals.scss';

import { isSupported, logEvent } from 'firebase/analytics';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthContextProvider } from '@lib/context/auth-context';
import { ThemeContextProvider } from '@lib/context/theme-context';
import { AppHead } from '@components/common/app-head';
import { GlobalLayout } from '@components/layout/global-layout';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function AppContent({ Component, pageProps }: AppPropsWithLayout): JSX.Element {
  const router = useRouter();
  const getLayout = Component.getLayout ?? ((page): ReactNode => page);

  useEffect(() => {
    // Skip analytics on login page to avoid interfering with auth flow
    // Also skip if on mobile Safari to avoid ITP blocking issues
    if (typeof window === 'undefined') return;

    const isLoginPage = router.pathname === '/login';
    const isMobileSafari =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      /Safari/i.test(navigator.userAgent) &&
      !/Chrome|CriOS|FxiOS/i.test(navigator.userAgent);

    // Skip analytics on login page or mobile Safari to prevent interference
    if (isLoginPage || isMobileSafari) {
      return;
    }

    // Delay analytics initialization to ensure auth is ready first
    // This prevents analytics from interfering with auth flow
    const timer = setTimeout(() => {
      isSupported()
        .then((supported) => {
          if (supported) {
            import('firebase/analytics')
              .then(({ getAnalytics }) => {
                const analytics = getAnalytics();
                logEvent(analytics, 'page_view');
              })
              .catch((error) => {
                // Silently fail - analytics should not block app functionality
                // console.error('Error loading Firebase Analytics:', error);
              });
          }
        })
        .catch((error) => {
          // Silently fail - analytics should not block app functionality
          // console.error('Error checking for Firebase Analytics support:', error);
        });
    }, 1000); // Delay by 1 second to let auth initialize first

    return () => clearTimeout(timer);
  }, [router.pathname]);

  return getLayout(<Component {...pageProps} />) as JSX.Element;
}

export default function App(props: AppPropsWithLayout): JSX.Element {
  return (
    <>
      <AppHead />
      <AuthContextProvider>
        <ThemeContextProvider>
          <GlobalLayout>
            <AppContent {...props} />
          </GlobalLayout>
        </ThemeContextProvider>
      </AuthContextProvider>
    </>
  );
}
