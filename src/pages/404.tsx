import Error from 'next/error';
import { SEO } from '@components/common/seo';
import { useState, useEffect } from 'react';

export default function NotFound(): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or system preference
    const getTheme = (): string => {
      if (typeof window === 'undefined') return 'light';
      
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) return storedTheme;
      
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    };

    const theme = getTheme();
    setIsDarkMode(['dim', 'dark'].includes(theme));
  }, []);

  return (
    <>
      <SEO
        title='Page not found / Buzzwin'
        description='Sorry we couldn’t find the page you were looking for.'
        image='/404.png'
      />
      <Error statusCode={404} withDarkMode={isDarkMode} />
    </>
  );
}
