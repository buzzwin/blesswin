import Head from 'next/head';

export function AppHead(): JSX.Element {
  return (
    <Head>
      {/* Default meta tags - can be overridden by SEO component */}
      <meta charSet='utf-8' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
      />
      <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
      {/* iOS Safari specific */}
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      <meta name='format-detection' content='telephone=no' />

      {/* Favicon and Icons */}
      <link rel='icon' href='/favicon.ico' />
      <link rel='apple-touch-icon' sizes='180x180' href='/logo192.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/logo192.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/logo128.png' />
      <link rel='manifest' href='/site.webmanifest' key='site-manifest' />

      {/* Preconnect for performance */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />

      {/* DNS Prefetch */}
      <link rel='dns-prefetch' href='https://fonts.googleapis.com' />
    </Head>
  );
}
