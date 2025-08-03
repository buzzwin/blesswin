import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import cn from 'clsx';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@components/ui/button';

export function SearchBar(): JSX.Element {
  const [inputValue, setInputValue] = useState('');

  const { push } = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = ({
    target: { value }
  }: ChangeEvent<HTMLInputElement>): void => setInputValue(value);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (inputValue) void push(`/search?q=${inputValue}`);
  };

  const clearInputValue = (focus?: boolean) => (): void => {
    if (focus) inputRef.current?.focus();
    else inputRef.current?.blur();

    setInputValue('');
  };

  const handleEscape = ({ key }: KeyboardEvent<HTMLInputElement>): void => {
    if (key === 'Escape') clearInputValue()();
  };

  return (
    <form
      className='hover-animation sticky top-0 z-10 -my-2 bg-main-background py-2'
      onSubmit={handleSubmit}
    >
      {/* <label
        className='flex items-center justify-between gap-4 px-4 py-2 transition rounded-full group bg-main-search-background focus-within:bg-main-background focus-within:ring-2 focus-within:ring-main-accent'
      >
        <i>
          <HeroIcon
            className='w-5 h-5 transition-colors text-light-secondary group-focus-within:text-main-accent dark:text-dark-secondary'
            iconName='MagnifyingGlassIcon'
          />
        </i>
        <input
          className='flex-1 bg-transparent outline-none peer placeholder:text-light-secondary dark:placeholder:text-dark-secondary'
          type='text'
          placeholder='Search Buzzwin'
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          onKeyUp={handleEscape}
        />
        <Button
          className={cn(
            'accent-tab scale-50 bg-main-accent p-1 opacity-0 transition hover:brightness-90 disabled:opacity-0',
            inputValue &&
              'focus:scale-100 focus:opacity-100 peer-focus:scale-100 peer-focus:opacity-100'
          )}
          onClick={clearInputValue(true)}
          disabled={!inputValue}
        >
          <HeroIcon className='w-3 h-3 stroke-white' iconName='XMarkIcon' />
        </Button>
      </label> */}
    </form>
  );
}
