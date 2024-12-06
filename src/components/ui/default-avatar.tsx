type DefaultAvatarProps = {
  className?: string;
};

export function DefaultAvatar({ className }: DefaultAvatarProps): JSX.Element {
  return (
    <svg
      className={className}
      viewBox='0 0 40 40'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        cx='20'
        cy='20'
        r='20'
        className='fill-gray-100 dark:fill-gray-800'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M20 20.8c-3.53 0-6.4-2.87-6.4-6.4 0-3.53 2.87-6.4 6.4-6.4 3.53 0 6.4 2.87 6.4 6.4 0 3.53-2.87 6.4-6.4 6.4M9.6 32v-1.6c0-3.53 2.87-6.4 6.4-6.4h8c3.53 0 6.4 2.87 6.4 6.4V32'
        className='fill-gray-400 dark:fill-gray-600'
      />
    </svg>
  );
}
