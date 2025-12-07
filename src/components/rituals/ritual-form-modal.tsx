import { useState, useEffect } from 'react';
import { Modal } from '@components/modal/modal';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import type { RitualDefinition, RitualTimeOfDay, RitualScope } from '@lib/types/ritual';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface RitualFormModalProps {
  open: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
  ritual?: RitualDefinition; // If provided, we're editing; otherwise, creating
}

export function RitualFormModal({ open, closeModal, onSuccess, ritual }: RitualFormModalProps): JSX.Element {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<ImpactTag[]>([]);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('tiny');
  const [suggestedTimeOfDay, setSuggestedTimeOfDay] = useState<RitualTimeOfDay>('anytime');
  const [durationEstimate, setDurationEstimate] = useState('5 minutes');
  const [scope, setScope] = useState<RitualScope>('personalized'); // Default to private
  const [loading, setLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showAiAssist, setShowAiAssist] = useState(false);

  const isEditing = !!ritual;

  // Initialize form with ritual data if editing
  useEffect(() => {
    if (ritual) {
      setTitle(ritual.title);
      setDescription(ritual.description);
      setTags(ritual.tags);
      setEffortLevel(ritual.effortLevel);
      setSuggestedTimeOfDay(ritual.suggestedTimeOfDay);
      setDurationEstimate(ritual.durationEstimate || '5 minutes');
      setScope(ritual.scope || 'personalized');
    } else {
      // Reset form for new ritual
      setTitle('');
      setDescription('');
      setTags([]);
      setEffortLevel('tiny');
      setSuggestedTimeOfDay('anytime');
      setDurationEstimate('5 minutes');
      setScope('personalized'); // Default to private
      setAiInput('');
      setShowAiAssist(false);
    }
  }, [ritual, open]);

  const handleGenerateWithAI = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to use AI assistance');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/rituals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: aiInput.trim() || undefined,
          userId: user.id
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.ritual) {
        // Populate form with AI-generated ritual
        setTitle(data.ritual.title);
        setDescription(data.ritual.description);
        setTags(data.ritual.tags);
        setEffortLevel(data.ritual.effortLevel);
        setSuggestedTimeOfDay(data.ritual.suggestedTimeOfDay);
        setDurationEstimate(data.ritual.durationEstimate);
        setShowAiAssist(false);
        setAiInput('');
        toast.success('Ritual generated! Review and customize as needed ✨');
      } else {
        throw new Error(data.error || 'Failed to generate ritual');
      }
    } catch (error) {
      console.error('Error generating ritual with AI:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate ritual');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim() || !description.trim() || !user?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (tags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && ritual?.id) {
        // Update existing ritual
        const response = await fetch(`/api/rituals/${ritual.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            title: title.trim(),
            description: description.trim(),
            tags,
            effortLevel,
            suggestedTimeOfDay,
            durationEstimate,
            scope
          })
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Ritual updated successfully! ✨');
          onSuccess?.();
          closeModal();
        } else {
          throw new Error(data.error || 'Failed to update ritual');
        }
      } else {
        // Create new ritual
        const response = await fetch('/api/rituals/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            title: title.trim(),
            description: description.trim(),
            tags,
            effortLevel,
            suggestedTimeOfDay,
            durationEstimate,
            scope
          })
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Ritual created successfully! ✨');
          onSuccess?.();
          closeModal();
        } else {
          throw new Error(data.error || 'Failed to create ritual');
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} ritual:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} ritual`);
    } finally {
      setLoading(false);
    }
  };

  const availableTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community'];
  const effortLevels: EffortLevel[] = ['tiny', 'medium', 'deep'];
  const timeOfDayOptions: RitualTimeOfDay[] = ['morning', 'afternoon', 'evening', 'anytime'];

  return (
    <Modal 
      open={open} 
      closeModal={closeModal} 
      className='max-w-2xl'
      modalClassName='max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl'
    >
      <div className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {isEditing ? 'Edit Ritual' : 'Create New Ritual'}
          </h2>
          {!isEditing && (
            <button
              type='button'
              onClick={() => setShowAiAssist(!showAiAssist)}
              className='flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30'
            >
              <Sparkles className='h-4 w-4' />
              {showAiAssist ? 'Hide AI Assist' : 'AI Assist'}
            </button>
          )}
        </div>

        {/* AI Assist Section */}
        {!isEditing && showAiAssist && (
          <div className='mb-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
            <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold text-purple-900 dark:text-purple-100'>
              <Sparkles className='h-4 w-4' />
              Generate Ritual with AI
            </h3>
            <p className='mb-3 text-xs text-purple-800 dark:text-purple-200'>
              Describe your idea or let AI create a meaningful ritual for you
            </p>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder='e.g., "I want a morning ritual to start my day with gratitude" or "A ritual for better sleep" or leave empty for AI to suggest'
              rows={3}
              className='mb-3 w-full rounded-lg border border-purple-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-purple-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500'
            />
            <button
              type='button'
              onClick={handleGenerateWithAI}
              disabled={generating}
              className='w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {generating ? (
                <span className='flex items-center justify-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Generating...
                </span>
              ) : (
                <span className='flex items-center justify-center gap-2'>
                  <Sparkles className='h-4 w-4' />
                  Generate Ritual
                </span>
              )}
            </button>
          </div>
        )}

        <div className='space-y-4'>
          {/* Title */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Title *
            </label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g., Morning Gratitude Practice'
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
            />
          </div>

          {/* Description */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe what this ritual involves...'
              rows={4}
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
            />
          </div>

          {/* Tags */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Tags * (Select at least one)
            </label>
            <div className='flex flex-wrap gap-2'>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type='button'
                  onClick={() => {
                    setTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    tags.includes(tag)
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
              {effortLevels.map(level => (
                <button
                  key={level}
                  type='button'
                  onClick={() => setEffortLevel(level)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
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

          {/* Time of Day */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Suggested Time of Day
            </label>
            <div className='flex gap-2'>
              {timeOfDayOptions.map(time => (
                <button
                  key={time}
                  type='button'
                  onClick={() => setSuggestedTimeOfDay(time)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    suggestedTimeOfDay === time
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Estimate */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Duration Estimate
            </label>
            <input
              type='text'
              value={durationEstimate}
              onChange={(e) => setDurationEstimate(e.target.value)}
              placeholder='e.g., 5 minutes'
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
            />
          </div>

          {/* Visibility */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Visibility
            </label>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => setScope('personalized')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  scope === 'personalized'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🔒 Private
              </button>
              <button
                type='button'
                onClick={() => setScope('public')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  scope === 'public'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🌍 Public
              </button>
            </div>
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              {scope === 'public' 
                ? 'Others can discover and join this ritual' 
                : 'Only you can see and use this ritual'}
            </p>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              onClick={closeModal}
              disabled={loading}
              className='flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !description.trim() || tags.length === 0}
              className='flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Ritual' : 'Create Ritual')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

