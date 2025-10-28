import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { Button } from '@components/ui/button';
import { Modal } from '@components/modal/modal';
import { MobileSidebarModal } from '@components/modal/mobile-sidebar-modal';
import { HeroIcon } from '@components/ui/hero-icon';
import type { Variants } from 'framer-motion';

const variant: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', duration: 0.4, damping: 25, stiffness: 200 }
  },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } }
};

export function MobileSidebar(): JSX.Element {
  const { user } = useAuth();
  const { open, openModal, closeModal } = useModal();

  // Ensure we have a valid user object with all required properties
  const userData = user
    ? {
        name: user.name ?? 'User',
        username: user.username ?? 'user',
        verified: user.verified ?? false,
        photoURL: user.photoURL ?? '',
        following: user.following ?? [],
        followers: user.followers ?? [],
        coverPhotoURL: user.coverPhotoURL ?? ''
      }
    : {
        name: 'Guest',
        username: 'guest',
        verified: false,
        photoURL: '',
        following: [],
        followers: [],
        coverPhotoURL: ''
      };

  return (
    <>
      <Modal
        className='p-0'
        modalAnimation={variant}
        modalClassName='h-full w-full bg-white dark:bg-gray-900 right-0 sm:w-96'
        open={open}
        closeModal={closeModal}
      >
        <MobileSidebarModal {...userData} closeModal={closeModal} />
      </Modal>
      <Button className='accent-tab p-0 md:hidden' onClick={openModal}>
        <HeroIcon className='h-6 w-6' iconName='Bars3Icon' />
      </Button>
    </>
  );
}
