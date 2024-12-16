import { useEffect } from 'react';
import TextArea from 'react-textarea-autosize';
import { motion } from 'framer-motion';
import { useModal } from '@lib/hooks/useModal';
import { Modal } from '@components/modal/modal';
import { ActionModal } from '@components/modal/action-modal';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';
import ViewingActivityForm from '@components/activity/ViewingActivityForm';

import type { ReactNode, RefObject, ChangeEvent, KeyboardEvent } from 'react';
import type { Variants } from 'framer-motion';

type InputFormProps = {
  modal?: boolean;
  replyModal?: boolean;
  reply?: boolean;
  formId: string;
  inputRef: RefObject<HTMLTextAreaElement>;
  inputValue: string;
  handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: () => Promise<void>;
  handleFocus: () => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isValidTweet: boolean;
  isUploadingImages: boolean;
  visited: boolean;
  loading: boolean;
  children: ReactNode;
};

const variants: Variants[] = [
  {
    initial: { y: -25, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring' } }
  },
  {
    initial: { x: 25, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: 'spring' } }
  }
];

export const [fromTop, fromBottom] = variants;

export function InputForm({
  modal,
  replyModal,
  reply = false,
  formId,
  inputRef,
  inputValue,
  handleChange,
  handleSubmit,
  handleFocus,
  handleImageUpload,
  isValidTweet,
  isUploadingImages,
  visited,
  loading,
  children
}: InputFormProps): JSX.Element {
  const { open, openModal, closeModal } = useModal();

  useEffect(() => {
    handleShowHideNav(true)();
  }, []);

  const handleKeyboardShortcut = ({
    key,
    ctrlKey
  }: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (!modal && key === 'Escape') {
      if (isValidTweet) {
        inputRef.current?.blur();
        openModal();
      }
    } else if (ctrlKey && key === 'Enter' && isValidTweet) {
      void handleSubmit();
    }
  };

  const handleShowHideNav = (blur?: boolean) => (): void => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    if (blur) {
      setTimeout(() => {
        sidebar.style.opacity = '';
      }, 200);
      return;
    }

    if (window.innerWidth < 500) {
      sidebar.style.opacity = '0';
    }
  };

  const handleFormFocus = (): void => {
    handleShowHideNav()();
    handleFocus();
  };

  const isVisibilityShown = visited && !reply && !replyModal && !loading;

  return (
    <div className='flex min-h-[48px] w-full flex-col justify-center gap-4'>
      <Modal
        modalClassName='max-w-xs bg-main-background w-full p-8 rounded-2xl'
        open={open}
        closeModal={closeModal}
      >
        <ActionModal
          title='Discard Buzz?'
          description="This can't be undone and you'll lose your draft."
          mainBtnClassName='bg-accent-red hover:bg-accent-red/90 active:bg-accent-red/75'
          mainBtnLabel='Discard'
          action={closeModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className='flex flex-col gap-6'>
        <div className='flex items-center gap-3'>
          <div>
            {replyModal || reply ? (
              <TextArea
                id={formId}
                className='w-full min-w-0 resize-none bg-transparent text-xl outline-none placeholder:text-light-secondary dark:placeholder:text-dark-secondary'
                value={inputValue}
                placeholder={
                  reply || replyModal
                    ? 'Send your reply'
                    : 'What are you watching?'
                }
                onBlur={handleShowHideNav(true)}
                minRows={loading ? 1 : modal && !isUploadingImages ? 3 : 1}
                maxRows={isUploadingImages ? 5 : 15}
                onFocus={handleFormFocus}
                onKeyUp={handleKeyboardShortcut}
                onChange={handleChange}
                ref={inputRef}
              />
            ) : (
              <ViewingActivityForm onSave={handleSubmit} />
            )}
          </div>

          {reply && (
            <Button
              className='cursor-pointer bg-main-accent px-4 py-1.5 font-bold text-white opacity-50'
              onClick={handleFocus}
            >
              Reply
            </Button>
          )}
        </div>
      </div>
      {children}
      {isVisibilityShown && (
        <motion.div
          className='flex border-b border-light-border pb-2 dark:border-dark-border'
          {...fromBottom}
        />
      )}
    </div>
  );
}
