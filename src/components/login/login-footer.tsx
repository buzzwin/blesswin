const footerLinks = [
  ['About', 'https://about.buzzwin.com'],
  ['Help Center', 'https://help.buzzwin.com'],
  ['Privacy Policy', 'https://buzzwin.com/tos'],
  ['Cookie Policy', 'https://support.buzzwin.com/articles/20170514'],
  ['Accessibility', 'https://help.buzzwin.com/resources/accessibility'],
  ['Ads Info', 'https://business.buzzwin.com/how-ads-work.html'],
  ['Blog', 'https://blog.buzzwin.com'],
  ['Status', 'https://status.buzzwin.us'],
  ['Careers', 'https://careers.buzzwin.com'],
  ['Brand Resources', 'https://about.buzzwin.com/press/brand-assets'],
  ['Advertising', 'https://ads.buzzwin.com/'],
  ['Marketing', 'https://marketing.buzzwin.com'],
  ['Twitter for Business', 'https://business.buzzwin.com'],
  ['Developers', 'https://developer.buzzwin.com'],
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
        <p>© 2022 Twitter, Inc.</p>
      </nav>
    </footer>
  );
}
