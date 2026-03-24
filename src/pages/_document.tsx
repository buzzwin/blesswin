import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(): JSX.Element {
  return (
    <Html lang='en'>
      <Head>
        {/* Preconnect for performance */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />

        {/* DNS Prefetch */}
        <link rel='dns-prefetch' href='https://fonts.googleapis.com' />

        {/* Fonts */}
        <link
          href='https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body>
        {/* Theme initialization script - prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
                  const targetTheme = theme === 'dim' ? 'dark' : theme;
                  
                  if (targetTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to dark if there's an error
                  document.documentElement.classList.add('dark');
                }
              })();
            `
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
