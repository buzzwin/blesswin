import { useState } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { createWatchClub } from '@lib/firebase/utils/watchclub';
import { Modal } from '@components/modal/modal';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { toast } from 'react-hot-toast';

type CreateClubModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormData = {
  name: string;
  description: string;
  isPublic: boolean;
  mediaType: 'movie' | 'tv' | '';
};

const initialFormData: FormData = {
  name: '',
  description: '',
  isPublic: true,
  mediaType: ''
};

export function CreateClubModal({
  isOpen,
  onClose
}: CreateClubModalProps): JSX.Element {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('You must be signed in to create a club');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Club name is required');
      return;
    }

    if (!formData.mediaType) {
      toast.error('Please select a media type');
      return;
    }

    setLoading(true);
    try {
      await createWatchClub({
        ...formData,
        createdBy: user.id
      });
      toast.success('Club created successfully!');
      onClose();
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error('Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      modalClassName={cn(
        'w-full max-w-lg',
        'bg-white dark:bg-gray-900',
        'rounded-2xl',
        'shadow-xl',
        'border border-gray-100 dark:border-gray-800'
      )}
      open={isOpen}
      closeModal={onClose}
    >
      <div className='p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Create Watch Club
          </h2>
          <button
            onClick={onClose}
            className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <HeroIcon iconName='XMarkIcon' className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Club Name */}
          <div>
            <label
              htmlFor='name'
              className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100'
            >
              Club Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='Enter club name'
              className={cn(
                'w-full rounded-lg',
                'border border-gray-300 dark:border-gray-700',
                'bg-white dark:bg-gray-800',
                'p-2.5 text-sm',
                'text-gray-900 dark:text-white',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:border-emerald-500 focus:ring-emerald-500'
              )}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor='description'
              className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100'
            >
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='What is this club about?'
              className={cn(
                'w-full rounded-lg',
                'border border-gray-300 dark:border-gray-700',
                'bg-white dark:bg-gray-800',
                'p-2.5 text-sm',
                'text-gray-900 dark:text-white',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:border-emerald-500 focus:ring-emerald-500',
                'min-h-[100px] resize-none'
              )}
            />
          </div>

          {/* Media Type */}
          <div className='flex gap-4'>
            <Button
              type='button'
              onClick={() =>
                setFormData((prev) => ({ ...prev, mediaType: 'movie' }))
              }
              className={cn(
                'flex-1 gap-2 rounded-lg p-3',
                'border border-gray-200 dark:border-gray-700',
                'transition-colors duration-200',
                formData.mediaType === 'movie'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
              )}
            >
              <HeroIcon iconName='FilmIcon' className='h-5 w-5' />
              Movies
            </Button>
            <Button
              type='button'
              onClick={() =>
                setFormData((prev) => ({ ...prev, mediaType: 'tv' }))
              }
              className={cn(
                'flex-1 gap-2 rounded-lg p-3',
                'border border-gray-200 dark:border-gray-700',
                'transition-colors duration-200',
                formData.mediaType === 'tv'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
              )}
            >
              <HeroIcon iconName='TvIcon' className='h-5 w-5' />
              TV Shows
            </Button>
          </div>

          {/* Privacy Setting */}
          <div className='flex items-center gap-3 rounded-lg border p-3 dark:border-gray-700'>
            <div className='flex-1'>
              <p className='font-medium text-gray-900 dark:text-white'>
                Make Club Public
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Anyone can view and join public clubs
              </p>
            </div>
            <button
              type='button'
              role='switch'
              aria-checked={formData.isPublic}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))
              }
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                formData.isPublic
                  ? 'bg-emerald-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  formData.isPublic ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-2'>
            <Button
              type='button'
              onClick={onClose}
              className={cn(
                'px-4 py-2',
                'rounded-lg',
                'font-medium',
                'bg-gray-100 text-gray-700',
                'hover:bg-gray-200',
                'dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading || !formData.name.trim() || !formData.mediaType}
              className={cn(
                'flex items-center gap-2',
                'px-4 py-2',
                'rounded-lg',
                'font-medium',
                'bg-emerald-500 text-white',
                'hover:bg-emerald-600',
                'disabled:opacity-50'
              )}
            >
              {loading ? (
                <HeroIcon
                  iconName='ArrowPathIcon'
                  className='h-5 w-5 animate-spin'
                />
              ) : (
                <HeroIcon iconName='PlusIcon' className='h-5 w-5' />
              )}
              {loading ? 'Creating...' : 'Create Club'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
