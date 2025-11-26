const footerLinks = [
  ['Blog', '/blog'],
  ['Videos', '/videos'],
  ['Terms of Service', '/tos'],
  ['Privacy Policy', '/privacy'],
  ['Disclaimer', '/disclaimer'],
  ['Cookie Policy', 'https://support.buzzwin.com/articles/cookies'],
  ['Accessibility', 'https://support.buzzwin.com/resources/accessibility']
  // ['Ads Info', 'https://business.buzzwin.com/ads']
] as const;

export function AsideFooter(): JSX.Element {
  return (
    <footer className='sticky top-16 flex flex-col gap-3 text-center text-sm text-light-secondary dark:text-dark-secondary'>
      <nav className='flex flex-wrap justify-center gap-2'>
        {footerLinks.map(([linkName, href]) => {
          const isExternal = href.startsWith('http');
          return isExternal ? (
            <a
              className='custom-underline'
              target='_blank'
              rel='noreferrer'
              href={href}
              key={href}
            >
              {linkName}
            </a>
          ) : (
            <a
              className='custom-underline'
              href={href}
              key={href}
            >
              {linkName}
            </a>
          );
        })}
      </nav>
      <p>© 2023 Buzzwin.</p>
      <div className='mt-4 text-center text-sm text-gray-500'>
        This site is powered by the TMDB API
      </div>
    </footer>
  );
}
