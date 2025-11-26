import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(): JSX.Element {
  return (
    <Html lang='en'>
      <Head>
        {/* Preconnect for performance */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        
        {/* DNS Prefetch */}
        <link rel='dns-prefetch' href='https://fonts.googleapis.com' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
