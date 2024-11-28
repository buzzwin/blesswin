/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { checkUsernameAvailability, updateUsername } from '@lib/firebase/utils';
import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { isValidUsername } from '@lib/validation';
import { sleep } from '@lib/utils';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { Modal } from '@components/modal/modal';
import { UsernameModal } from '@components/modal/username-modal';
import { InputField } from '@components/input/input-field';
import cn from 'clsx';
import type { FormEvent, ChangeEvent } from 'react';

export function UpdateUsername(): JSX.Element {
  const [alreadySet, setAlreadySet] = useState(false);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visited, setVisited] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useAuth();
  const { open, openModal, closeModal } = useModal();

  useEffect(() => {
    const checkAvailability = async (value: string): Promise<void> => {
      const empty = await checkUsernameAvailability(value);

      if (empty) setAvailable(true);
      else {
        setAvailable(false);
        setErrorMessage('This username has been taken. Please choose another.');
      }
    };

    if (!visited && inputValue.length > 0) setVisited(true);

    if (visited) {
      if (errorMessage) setErrorMessage('');

      const error = isValidUsername(user?.username as string, inputValue);

      if (error) {
        setAvailable(false);
        setErrorMessage(error);
      } else void checkAvailability(inputValue);
    }
  }, [inputValue]);

  useEffect(() => {
    if (!user?.updatedAt) openModal();
    else setAlreadySet(true);
  }, []);

  const changeUsername = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!available) return;

    setLoading(true);
    await sleep(500);
    await updateUsername(user?.id as string, inputValue);
    closeModal();
    setLoading(false);

    setInputValue('');
    setVisited(false);
    setAvailable(false);

    toast.success('Username updated successfully');
  };

  const cancelUpdateUsername = (): void => {
    closeModal();
    if (!alreadySet) void updateUsername(user?.id as string);
  };

  const handleChange = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void =>
    setInputValue(value);

  return (
    <>
      <Modal
        modalClassName={cn(
          'flex flex-col gap-6 max-w-xl w-full p-8',
          'bg-white dark:bg-gray-900',
          'rounded-2xl shadow-xl',
          'border border-gray-100 dark:border-gray-800',
          'transform transition-all duration-200'
        )}
        open={open}
        closeModal={cancelUpdateUsername}
      >
        <UsernameModal
          loading={loading}
          available={available}
          alreadySet={alreadySet}
          changeUsername={changeUsername}
          cancelUpdateUsername={cancelUpdateUsername}
        >
          <InputField
            label='Username'
            inputId='username'
            inputValue={inputValue}
            errorMessage={errorMessage}
            handleChange={handleChange}
          />
        </UsernameModal>
      </Modal>
      <Button
        className={cn(
          'group relative p-2',
          'transition-all duration-200',
          'rounded-full',
          'bg-transparent dark:bg-transparent',
          'hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10',
          'active:bg-emerald-500/20 dark:active:bg-emerald-500/20',
          'focus-visible:ring-2 focus-visible:ring-emerald-500/50',
          'disabled:opacity-50'
        )}
        onClick={openModal}
      >
        <HeroIcon
          className={cn(
            'h-5 w-5',
            'text-gray-700 dark:text-gray-200',
            'transition-colors duration-200',
            'group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
          )}
          iconName='UserIcon'
        />
        <ToolTip tip='Update Username' />
      </Button>
    </>
  );
}
