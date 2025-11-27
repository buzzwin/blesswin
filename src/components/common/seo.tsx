import { useRouter } from 'next/router';
import Head from 'next/head';
import { siteURL } from '@lib/env';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  keywords?: string;
  author?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
};

const defaultTitle =
  'Buzzwin - A Storytelling Studio That Amplifies Good Causes';
const defaultDescription =
  'A storytelling studio that amplifies good causes. Discover wellness resources, AI-powered guidance, and inspiring content for yoga, meditation, and harmony.';
const defaultImage = `${
  siteURL || 'https://Buzzwin.com'
}/assets/wellness-og-image.jpg`;
const defaultKeywords =
  'yoga, mindfulness, meditation, world peace, AI wellness, harmony, positive vibes, mental health, spiritual growth, inner peace, wellness platform';

export function SEO({
  title = defaultTitle,
  description = defaultDescription,
  image = defaultImage,
  type = 'website',
  keywords = defaultKeywords,
  author = 'Buzzwin',
  noindex = false,
  structuredData
}: SEOProps): JSX.Element {
  const { asPath } = useRouter();
  const canonicalURL = `${siteURL || 'https://Buzzwin.com'}${
    asPath === '/' ? '' : asPath
  }`;
  const fullTitle = title.includes('Buzzwin') ? title : `${title} | Buzzwin`;

  // Default structured data for the homepage
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Buzzwin',
    description: defaultDescription,
    url: siteURL || 'https://Buzzwin.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${
          siteURL || 'https://Buzzwin.com'
        }/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const jsonLd = structuredData || defaultStructuredData;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name='title' content={fullTitle} />
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='author' content={author} />
      <meta
        name='robots'
        content={noindex ? 'noindex,nofollow' : 'index,follow'}
      />
      <meta name='language' content='English' />
      <meta name='revisit-after' content='7 days' />
      <link rel='canonical' href={canonicalURL} />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:url' content={canonicalURL} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:site_name' content='Buzzwin' />
      <meta property='og:locale' content='en_US' />

      {/* Twitter */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:url' content={canonicalURL} />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
      <meta name='twitter:creator' content='@Buzzwin' />
      <meta name='twitter:site' content='@Buzzwin' />

      {/* Additional Meta Tags */}
      <meta name='theme-color' content='#10b981' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta
        name='apple-mobile-web-app-status-bar-style'
        content='black-translucent'
      />
      <meta name='apple-mobile-web-app-title' content='Buzzwin' />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
