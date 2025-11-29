import { useState, useEffect } from 'react';
import { Modal } from '@components/modal/modal';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import type { ImpactMoment, ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface EditMomentModalProps {
  moment: ImpactMoment;
  open: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
}

export function EditMomentModal({ moment, open, closeModal, onSuccess }: EditMomentModalProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = (): void => {
    setIsSubmitting(false);
    onSuccess?.();
    closeModal();
  };

  const handleCancel = (): void => {
    if (!isSubmitting) {
      closeModal();
    }
  };

  return (
    <Modal open={open} closeModal={handleCancel} className='max-w-2xl'>
      <div className='p-6'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
          Edit Impact Moment
        </h2>
        
        <EditMomentForm
          moment={moment}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          onSubmittingChange={setIsSubmitting}
        />
      </div>
    </Modal>
  );
}

interface EditMomentFormProps {
  moment: ImpactMoment;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmittingChange: (submitting: boolean) => void;
}

function EditMomentForm({ moment, onSuccess, onCancel, onSubmittingChange }: EditMomentFormProps): JSX.Element {
  const [text, setText] = useState(moment.text);
  const [selectedTags, setSelectedTags] = useState<ImpactTag[]>(moment.tags);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>(moment.effortLevel);
  const [moodBefore, setMoodBefore] = useState<number | null>(moment.moodCheckIn?.before || null);
  const [moodAfter, setMoodAfter] = useState<number | null>(moment.moodCheckIn?.after || null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setText(moment.text);
    setSelectedTags(moment.tags);
    setEffortLevel(moment.effortLevel);
    setMoodBefore(moment.moodCheckIn?.before || null);
    setMoodAfter(moment.moodCheckIn?.after || null);
  }, [moment]);

  const handleSubmit = async (): Promise<void> => {
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    if (!user?.id) {
      toast.error('Please sign in to edit impact moments');
      return;
    }

    setLoading(true);
    onSubmittingChange(true);

    try {
      const response = await fetch(`/api/impact-moments/${moment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          tags: selectedTags,
          effortLevel,
          moodCheckIn: moodBefore && moodAfter ? { before: moodBefore, after: moodAfter } : undefined,
          userId: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Impact moment updated successfully! ✨');
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to update impact moment');
      }
    } catch (error) {
      console.error('Error updating impact moment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update impact moment');
    } finally {
      setLoading(false);
      onSubmittingChange(false);
    }
  };

  const allTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community'];
  const allEffortLevels: EffortLevel[] = ['tiny', 'medium', 'deep'];

  return (
    <div className='space-y-4'>
      {/* Text Input */}
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
          What did you do? *
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='What small good deed did you do today?'
          rows={4}
          className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
        />
      </div>

      {/* Tags */}
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Tags *
        </label>
        <div className='flex flex-wrap gap-2'>
          {allTags.map(tag => (
            <button
              key={tag}
              type='button'
              onClick={() => {
                setSelectedTags(prev => 
                  prev.includes(tag) 
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Effort Level */}
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Effort Level *
        </label>
        <div className='flex gap-2'>
          {allEffortLevels.map(level => (
            <button
              key={level}
              type='button'
              onClick={() => setEffortLevel(level)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                effortLevel === level
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Check-in */}
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Mood Check-in (Optional)
        </label>
        <div className='flex items-center gap-4'>
          <div>
            <label className='mb-1 block text-xs text-gray-600 dark:text-gray-400'>Before</label>
            <select
              value={moodBefore || ''}
              onChange={(e) => setMoodBefore(e.target.value ? parseInt(e.target.value) : null)}
              className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            >
              <option value=''>Select</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='mb-1 block text-xs text-gray-600 dark:text-gray-400'>After</label>
            <select
              value={moodAfter || ''}
              onChange={(e) => setMoodAfter(e.target.value ? parseInt(e.target.value) : null)}
              className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            >
              <option value=''>Select</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-3 pt-4'>
        <button
          onClick={onCancel}
          disabled={loading}
          className='flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim() || selectedTags.length === 0}
          className='flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Updating...' : 'Update Moment'}
        </button>
      </div>
    </div>
  );
}

