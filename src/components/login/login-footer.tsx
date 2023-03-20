const footerLinks = [
  ['About', 'https://www.buzzwin.com'],
  ['Help Center', 'https://www.buzzwin.com'],
  ['Privacy Policy', 'https://buzzwin.com/tos'],
  ['Cookie Policy', 'https://www.buzzwin.com/articles/20170514'],
  ['Accessibility', 'https://www.buzzwin.com/resources/accessibility'],
  // ['Ads Info', 'https://business.buzzwin.com/how-ads-work.html'],
  ['Blog', 'https://www.buzzwin.com'],
  ['Status', 'https://www.buzzwin.com'],
  ['Careers', 'https://www.buzzwin.com'],
  ['Brand Resources', 'https://www.buzzwin.com/press/brand-assets'],
  ['Advertising', 'https://www.buzzwin.com/'],
  ['Marketing', 'https://www.buzzwin.com'],
  ['Developers', 'https://www.buzzwin.com'],
  ['Directory', 'https://buzzwin.com/i/directory/profiles'],
  ['Settings', 'https://buzzwin.com/settings']
] as const;

export function LoginFooter(): JSX.Element {
  return (
    <footer className='hidden justify-center p-4 text-sm text-light-secondary dark:text-dark-secondary lg:flex'>
      <nav className='flex flex-wrap justify-center gap-4 gap-y-2'>
        {footerLinks.map(([linkName, href]) => (
          <a
            className='custom-underline'
            target='_blank'
            rel='noreferrer'
            href={href}
            key={linkName}
          >
            {linkName}
          </a>
        ))}
        <p>© 2022 Buzzwin, Inc.</p>
      </nav>
    </footer>
  );
}
