import cn from 'clsx';
import type { User, EditableData } from '@lib/types/user';
import type { KeyboardEvent, ChangeEvent } from 'react';

export type InputFieldProps = {
  label: string;
  inputId: EditableData | Extract<keyof User, 'username'>;
  inputValue: string | null;
  inputLimit?: number;
  useTextArea?: boolean;
  errorMessage?: string;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleKeyboardShortcut?: ({
    key,
    ctrlKey
  }: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export function InputField({
  label,
  inputId,
  inputValue,
  inputLimit,
  useTextArea,
  errorMessage,
  handleChange,
  handleKeyboardShortcut
}: InputFieldProps): JSX.Element {
  const slicedInputValue = inputValue?.slice(0, inputLimit) ?? '';
  const inputLength = slicedInputValue.length;
  const isHittingInputLimit = inputLimit && inputLength > inputLimit;

  return (
    <div className='flex flex-col gap-1'>
      <div
        className={cn(
          'group relative overflow-hidden rounded-lg transition-all duration-200',
          'bg-white/5 dark:bg-black/5',
          'backdrop-blur-lg',
          'ring-1 ring-white/10 dark:ring-black/10',
          'hover:ring-white/20 dark:hover:ring-black/20',
          'focus-within:ring-2 focus-within:ring-emerald-500/50',
          errorMessage && 'ring-2 ring-red-500/50 dark:ring-red-500/50'
        )}
      >
        {useTextArea ? (
          <textarea
            className={cn(
              'peer w-full resize-none bg-transparent px-4 pt-6 pb-2',
              'text-base text-gray-900 dark:text-white',
              'placeholder-transparent',
              'outline-none',
              'transition-all duration-200',
              'disabled:opacity-50'
            )}
            id={inputId}
            placeholder={inputId}
            onChange={!isHittingInputLimit ? handleChange : undefined}
            onKeyUp={handleKeyboardShortcut}
            value={slicedInputValue}
            rows={3}
          />
        ) : (
          <input
            className={cn(
              'peer w-full bg-transparent px-4 pt-6 pb-2',
              'text-base text-gray-900 dark:text-white',
              'placeholder-transparent',
              'outline-none',
              'transition-all duration-200',
              'disabled:opacity-50'
            )}
            id={inputId}
            type='text'
            placeholder={inputId}
            onChange={!isHittingInputLimit ? handleChange : undefined}
            value={slicedInputValue}
            onKeyUp={handleKeyboardShortcut}
          />
        )}
        <label
          className={cn(
            'absolute left-4 top-2',
            'text-sm font-medium',
            'transition-all duration-200',
            'pointer-events-none',
            errorMessage
              ? 'text-red-500 dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400',
            'peer-placeholder-shown:top-4',
            'peer-placeholder-shown:text-base',
            'peer-focus:top-2',
            'peer-focus:text-sm',
            'peer-focus:text-emerald-500 dark:peer-focus:text-emerald-400'
          )}
          htmlFor={inputId}
        >
          {label}
        </label>
        {inputLimit && (
          <div
            className={cn(
              'absolute right-2 top-2',
              'text-sm font-medium',
              'transition-all duration-200',
              inputLength > inputLimit * 0.9
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500'
            )}
          >
            {inputLength} / {inputLimit}
          </div>
        )}
      </div>
      {errorMessage && (
        <p
          className={cn(
            'text-sm font-medium',
            'text-red-500 dark:text-red-400',
            'transition-all duration-200'
          )}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
