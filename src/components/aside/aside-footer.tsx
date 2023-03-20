const footerLinks = [
  ['Terms of Service', 'https://buzzwin.com/tos'],
  ['Privacy Policy', 'https://buzzwin.com/privacy'],
  ['Cookie Policy', 'https://support.buzzwin.com/articles/cookies'],
  ['Accessibility', 'https://support.buzzwin.com/resources/accessibility']
  // ['Ads Info', 'https://business.buzzwin.com/ads']
] as const;

export function AsideFooter(): JSX.Element {
  return (
    <footer className='sticky top-16 flex flex-col gap-3 text-center text-sm text-light-secondary dark:text-dark-secondary'>
      <nav className='flex flex-wrap justify-center gap-2'>
        {footerLinks.map(([linkName, href]) => (
          <a
            className='custom-underline'
            target='_blank'
            rel='noreferrer'
            href={href}
            key={href}
          >
            {linkName}
          </a>
        ))}
      </nav>
      <p>© 2023 Buzzwin.</p>
    </footer>
  );
}
