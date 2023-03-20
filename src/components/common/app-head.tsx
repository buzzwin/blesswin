import Head from 'next/head';

export function AppHead(): JSX.Element {
  return (
    <Head>
      <title>Buzzwin</title>
      <meta name='og:title' content='Buzzwin' />
      <link rel='icon' href='/favicon.ico' />
      <link rel='manifest' href='/site.webmanifest' key='site-manifest' />
      <meta name='buzzwin:site' content='@buzzwinsite' />
      <meta name='buzzwin:card' content='summary_large_image' />
    </Head>
  );
}
