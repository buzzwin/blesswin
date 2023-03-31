import { useEffect } from 'react';
import TextArea from 'react-textarea-autosize';
import { motion } from 'framer-motion';
import { useModal } from '@lib/hooks/useModal';
import { Modal } from '@components/modal/modal';
import { ActionModal } from '@components/modal/action-modal';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';

import type {
  ReactNode,
  RefObject,
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent
} from 'react';
import type { Variants } from 'framer-motion';
import ViewingActivityForm from '@components/activity/ViewingActivityForm';
import { ViewingActivity } from '@components/activity/types';

type InputFormProps = {
  modal?: boolean;
  formId: string;
  loading: boolean;
  visited: boolean;
  reply?: boolean;
  children: ReactNode;
  inputRef: RefObject<HTMLTextAreaElement>;
  inputValue: string;
  replyModal?: boolean;
  isValidTweet: boolean;
  isUploadingImages: boolean;
  sendTweet: (data: ViewingActivity) => Promise<void>;
  handleFocus: () => void;
  discardTweet: () => void;
  handleChange: ({
    target: { value }
  }: ChangeEvent<HTMLTextAreaElement>) => void;
  handleImageUpload: (
    e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLTextAreaElement>
  ) => void;
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
  reply,
  formId,
  loading,
  visited,
  children,
  inputRef,
  replyModal,
  inputValue,
  isValidTweet,
  isUploadingImages,
  sendTweet,
  handleFocus,
  discardTweet,
  handleChange,
  handleImageUpload
}: InputFormProps): JSX.Element {
  const { open, openModal, closeModal } = useModal();

  useEffect(() => handleShowHideNav(true), []);

  const handleKeyboardShortcut = ({
    key,
    ctrlKey
  }: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (!modal && key === 'Escape')
      if (isValidTweet) {
        inputRef.current?.blur();
        openModal();
      } else discardTweet();
    else if (ctrlKey && key === 'Enter' && isValidTweet)
      console.log('Input', inputValue);
  };

  const handleShowHideNav = (blur?: boolean) => (): void => {
    const sidebar = document.getElementById('sidebar') as HTMLElement;

    if (!sidebar) return;

    if (blur) {
      setTimeout(() => (sidebar.style.opacity = ''), 200);
      return;
    }

    if (window.innerWidth < 500) sidebar.style.opacity = '0';
  };

  const handleFormFocus = (): void => {
    handleShowHideNav()();
    handleFocus();
  };

  const handleClose = (): void => {
    discardTweet();
    closeModal();
  };

  const handleSave = async (data: ViewingActivity) => {
    console.log('Input', data);
    try {
      await sendTweet(data);
      console.log('Buzz sent successfully');
    } catch (error) {
      console.error('Error sending buzz:', error);
    }
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
          description='This can’t be undone and you’ll lose your draft.'
          mainBtnClassName='bg-accent-red hover:bg-accent-red/90 active:bg-accent-red/75'
          mainBtnLabel='Discard'
          action={handleClose}
          closeModal={closeModal}
        />
      </Modal>
      <div className='flex flex-col gap-6'>
        {/* {isVisibilityShown && (
          <motion.button
            type='button'
            className='flex items-center self-start gap-1 px-3 py-0 border cursor-not-allowed custom-button accent-tab accent-bg-tab border-light-line-reply text-main-accent hover:bg-main-accent/10 active:bg-main-accent/20 dark:border-light-secondary'
            {...fromTop}
          >
            <p className='font-bold'>Everyone</p>
            <HeroIcon className='w-4 h-4' iconName='ChevronDownIcon' />
          </motion.button>
        )} */}
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
                onPaste={handleImageUpload}
                onKeyUp={handleKeyboardShortcut}
                onChange={handleChange}
                ref={inputRef}
              />
            ) : (
              <ViewingActivityForm onSave={handleSave} />
            )}
          </div>

          {/*  */}
          {reply && !visited && (
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
        >
          {/* <button
            type='button'
            className='flex items-center gap-1 px-3 py-0 cursor-not-allowed custom-button accent-tab accent-bg-tab text-main-accent hover:bg-main-accent/10 active:bg-main-accent/20'
          >
            <HeroIcon className='w-4 h-4' iconName='GlobeAmericasIcon' />
            <p className='font-bold'>Everyone can reply</p>
          </button> */}
        </motion.div>
      )}
    </div>
  );
}
