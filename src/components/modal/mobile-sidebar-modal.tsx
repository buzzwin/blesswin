import { useRouter } from 'next/router';
import { LogOut } from 'lucide-react';
import { useModal } from '@lib/hooks/useModal';
import { useAuth } from '@lib/context/auth-context';
import { Button } from '@components/ui/button';
import { UserAvatar } from '@components/user/user-avatar';
import { NextImage } from '@components/ui/next-image';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { MainHeader } from '@components/home/main-header';
import { MobileSidebarLink } from '@components/sidebar/mobile-sidebar-link';
import { HeroIcon } from '@components/ui/hero-icon';
import { Modal } from './modal';
import type { NavLink } from '@components/sidebar/sidebar';
import { DisplayModal } from './display-modal';
import type { User } from '@lib/types/user';

export type MobileNavLink = Omit<NavLink, 'canBeHidden'>;

const getTopNavLinks = (username: string): Readonly<MobileNavLink[]> => [
  {
    href: '/recommendations',
    linkName: 'AI Recommendations',
    iconName: 'SparklesIcon',
    disabled: false
  },
  {
    href: '/ratings',
    linkName: 'Ratings & Reviews',
    iconName: 'StarIcon',
    disabled: false
  },
  {
    href: '/reviews',
    linkName: 'Recent Reviews',
    iconName: 'ClockIcon',
    disabled: false
  },
  {
    href: `/user/${username}`,
    linkName: 'Profile',
    iconName: 'UserIcon',
    disabled: false
  }
];

const bottomNavLinks: Readonly<MobileNavLink[]> = [
  // {
  //   href: '/settings',
  //   linkName: 'Settings and privacy',
  //   iconName: 'Cog8ToothIcon',
  //   disabled: false
  // },
  // {
  //   href: '/help-center',
  //   linkName: 'Help center',
  //   iconName: 'QuestionMarkCircleIcon',
  //   disabled: false
  // }
];

type Stats = [string, string, number];

type MobileSidebarModalProps = Pick<
  User,
  | 'name'
  | 'username'
  | 'verified'
  | 'photoURL'
  | 'following'
  | 'followers'
  | 'coverPhotoURL'
> & {
  closeModal: () => void;
};

export function MobileSidebarModal({
  name,
  username,
  verified,
  photoURL,
  following,
  followers,
  coverPhotoURL,
  closeModal
}: MobileSidebarModalProps): JSX.Element {
  const { signOut } = useAuth();
  const router = useRouter();

  const {
    open: displayOpen,
    openModal: displayOpenModal,
    closeModal: displayCloseModal
  } = useModal();

  const topNavLinks = getTopNavLinks(username);

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      closeModal();
      void router.push('/');
    } catch (error) {
      // console.error('Logout error:', error);
    }
  };

  const allStats: Readonly<Stats[]> = [
    ['following', 'Following', following.length],
    ['followers', 'Followers', followers.length]
  ];

  return (
    <>
      <Modal
        className='items-center justify-center xs:flex'
        modalClassName='max-w-xl bg-main-background w-full p-8 rounded-2xl hover-animation'
        open={displayOpen}
        closeModal={displayCloseModal}
      >
        <DisplayModal closeModal={displayCloseModal} />
      </Modal>
      <MainHeader
        useActionButton
        className='mb-4 flex flex-row-reverse items-center justify-between'
        iconName='XMarkIcon'
        title='Menu'
        tip='Close'
        action={closeModal}
      />
      <section className='flex flex-col gap-4 px-4'>
        <div className='blur-picture relative h-20 rounded-md'>
          {coverPhotoURL ? (
            <NextImage
              useSkeleton
              imgClassName='rounded-md'
              src={coverPhotoURL}
              alt={name}
              layout='fill'
            />
          ) : (
            <div className='h-full rounded-md bg-light-line-reply dark:bg-dark-line-reply' />
          )}
        </div>
        <div className='mb-6 ml-2 -mt-4'>
          <UserAvatar
            className='h-[60px] w-[60px]'
            username={username}
            src={photoURL}
            alt={name}
          />
        </div>
        <div className='mb-4 flex flex-col gap-4 rounded-xl bg-main-sidebar-background p-4'>
          <div className='flex flex-col'>
            <UserName
              name={name}
              username={username}
              verified={verified}
              className='-mb-1'
            />
            <UserUsername username={username} />
          </div>
          <div className='flex gap-4 text-secondary'>
            {allStats.map(([id, label, stat]) => (
              <div key={id} className='flex h-4 items-center gap-1'>
                <p className='font-bold'>{stat}</p>
                <p className='text-light-secondary dark:text-dark-secondary'>
                  {label}
                </p>
              </div>
            ))}
          </div>
          <i className='h-0.5 bg-light-line-reply dark:bg-dark-line-reply' />
          <nav className='flex flex-col gap-1'>
            {topNavLinks.map((linkData) => (
              <MobileSidebarLink {...linkData} key={linkData.href} />
            ))}
          </nav>
          <i className='h-0.5 bg-light-line-reply dark:bg-dark-line-reply' />
          <nav className='flex flex-col gap-1'>
            {bottomNavLinks.map((linkData) => (
              <MobileSidebarLink bottom {...linkData} key={linkData.href} />
            ))}
            <Button
              className='accent-tab accent-bg-tab flex items-center gap-2 rounded-md p-1.5 font-bold transition
                         hover:bg-light-primary/10 focus-visible:ring-2 first:focus-visible:ring-[#878a8c] 
                         dark:hover:bg-dark-primary/10 dark:focus-visible:ring-white'
              onClick={displayOpenModal}
            >
              <HeroIcon className='h-5 w-5' iconName='PaintBrushIcon' />
              Display
            </Button>
            <Button
              className='accent-tab accent-bg-tab flex items-center gap-2 rounded-md p-1.5 font-bold text-red-600
                         transition hover:bg-light-primary/10 hover:text-red-700 
                         focus-visible:ring-2 first:focus-visible:ring-[#878a8c] dark:hover:bg-dark-primary/10 dark:focus-visible:ring-white'
              onClick={handleLogout}
            >
              <LogOut className='h-5 w-5' />
              Sign Out
            </Button>
          </nav>
        </div>
      </section>
    </>
  );
}
