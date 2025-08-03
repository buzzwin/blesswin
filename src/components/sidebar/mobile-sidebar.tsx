import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { Button } from '@components/ui/button';
import { Modal } from '@components/modal/modal';
import { MobileSidebarModal } from '@components/modal/mobile-sidebar-modal';
import type { Variants } from 'framer-motion';
import { HeroIcon } from '@components/ui/hero-icon';

const variant: Variants = {
  initial: { x: '100%', opacity: 0.8 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', duration: 0.6 }
  },
  exit: { x: '100%', opacity: 0.8, transition: { duration: 0.3 } }
};

export function MobileSidebar(): JSX.Element {
  const { user } = useAuth();
  const { open, openModal, closeModal } = useModal();

  return (
    <>
      <Modal
        className='p-0'
        modalAnimation={variant}
        modalClassName='pb-4 pr-2 min-h-screen w-72 bg-main-background right-0'
        open={open}
        closeModal={closeModal}
      >
        <MobileSidebarModal
          {...(user ?? {
            name: 'Guest',
            username: 'guest',
            verified: false,
            photoURL: '',
            following: [],
            followers: [],
            coverPhotoURL: ''
          })}
          closeModal={closeModal}
        />
      </Modal>
      <Button className='accent-tab p-0 md:hidden' onClick={openModal}>
        <HeroIcon className='h-6 w-6' iconName='Bars3Icon' />
      </Button>
    </>
  );
}
