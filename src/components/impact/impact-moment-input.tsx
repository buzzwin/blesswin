import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { getImagesData } from '@lib/validation';
import { UserAvatar } from '@components/user/user-avatar';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import { 
  impactTagLabels, 
  impactTagColors, 
  effortLevelLabels, 
  effortLevelIcons,
  type ImpactTag,
  type EffortLevel,
  type ImpactMoment
} from '@lib/types/impact-moment';
import { ImagePreview } from '@components/input/image-preview';
import { Smile, Frown, Sparkles, Loader2 } from 'lucide-react';
import type { ChangeEvent, ClipboardEvent } from 'react';
import type { ImagesPreview } from '@lib/types/file';

const variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 }
};

type FilesWithId = Array<{ id: string; file: File }>;

interface ImpactMomentInputProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultExpanded?: boolean;
}

export function ImpactMomentInput({
  onSuccess,
  onCancel,
  defaultExpanded = false
}: ImpactMomentInputProps): JSX.Element {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<ImpactTag[]>([]);
  const [effortLevel, setEffortLevel] = useState<EffortLevel | null>(null);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<FilesWithId>([]);
  const [imagesPreview, setImagesPreview] = useState<ImagesPreview>([]);
  const [loading, setLoading] = useState(false);
  const [aiAssisting, setAiAssisting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState('What small good deed did you do today? (e.g., "Cooked a healthy meal for my family", "Picked up trash on my walk")');
  const [description, setDescription] = useState('What small good deed did you do today?');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputLimit = 280;

  const allTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community'];
  const allEffortLevels: EffortLevel[] = ['tiny', 'medium', 'deep'];

  // Fetch AI-generated placeholder and description on mount
  useEffect(() => {
    const fetchPlaceholder = async (): Promise<void> => {
      try {
        const response = await fetch('/api/impact-moment-placeholder');
        if (response.ok) {
          const data = await response.json() as { placeholder: string };
          if (data.placeholder) {
            setPlaceholder(data.placeholder);
            // Extract a shorter description for the collapsed button
            const shortDesc = data.placeholder.split('(')[0].trim();
            setDescription(shortDesc || 'What small good deed did you do today?');
          }
        }
      } catch (error) {
        console.error('Failed to fetch placeholder:', error);
        // Keep default placeholder on error
      }
    };

    void fetchPlaceholder();
  }, []);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  // Auto-parse impact moment text to extract tags, effort level, and mood
  useEffect(() => {
    // Only parse when form is expanded
    if (!isExpanded) {
      return;
    }

    // Clear existing timeout
    if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current);
    }

    // Only parse if text is meaningful (at least 10 characters)
    if (!text.trim() || text.trim().length < 10) {
      return;
    }

    // Debounce parsing - wait 1.5 seconds after user stops typing
    parseTimeoutRef.current = setTimeout(() => {
      void (async () => {
      // Only auto-populate if fields are empty (don't override user selections)
      const shouldParse = 
        selectedTags.length === 0 || 
        effortLevel === null || 
        (moodBefore === null && moodAfter === null);

      if (!shouldParse) {
        return;
      }

      setParsing(true);
      try {
        const response = await fetch('/api/impact-moment-parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text })
        });

        if (!response.ok) {
          throw new Error('Failed to parse impact moment');
        }

        const data = await response.json() as {
          tags?: ImpactTag[];
          effortLevel?: EffortLevel;
          moodCheckIn?: { before: number; after: number };
        };

        let tagsPopulated = false;
        let effortLevelPopulated = false;

        // Auto-populate tags if empty
        if (data.tags && data.tags.length > 0 && selectedTags.length === 0) {
          setSelectedTags(data.tags);
          tagsPopulated = true;
        }

        // Auto-populate effort level if empty
        if (data.effortLevel && effortLevel === null) {
          setEffortLevel(data.effortLevel);
          effortLevelPopulated = true;
        }

        // Auto-populate mood check-in if empty
        if (data.moodCheckIn && moodBefore === null && moodAfter === null) {
          setMoodBefore(data.moodCheckIn.before);
          setMoodAfter(data.moodCheckIn.after);
        }

        // Validate if all required fields were auto-selected
        const missingFields: string[] = [];
        
        // Check if tags were populated or are still missing
        const tagsWereEmpty = selectedTags.length === 0;
        const tagsNowPopulated = tagsPopulated || (data.tags && data.tags.length > 0);
        if (tagsWereEmpty && !tagsNowPopulated) {
          missingFields.push('tags');
        }
        
        // Check if effort level was populated or is still missing
        const effortLevelWasEmpty = effortLevel === null;
        const effortLevelNowPopulated = effortLevelPopulated || !!data.effortLevel;
        if (effortLevelWasEmpty && !effortLevelNowPopulated) {
          missingFields.push('effort level');
        }

        // Use setTimeout to check state after React updates
        setTimeout(() => {
          if (missingFields.length > 0) {
            setValidationWarning(
              `Please select ${missingFields.join(' and ')} to complete your impact moment.`
            );
          } else {
            setValidationWarning(null);
            // Show success message if all required fields were auto-selected
            if (tagsPopulated || effortLevelPopulated) {
              toast.success('Auto-detected your impact moment details! ✨', { duration: 2000 });
            }
          }
        }, 100);
      } catch (error) {
        // Silently fail - don't show error toast for auto-parsing
        console.error('Failed to auto-parse impact moment:', error);
      } finally {
        setParsing(false);
      }
      })();
    }, 1500); // 1.5 second debounce

    // Cleanup timeout on unmount or text change
    return () => {
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current);
      }
    };
  }, [isExpanded, text, selectedTags.length, effortLevel, moodBefore, moodAfter]);

  const handleAIAssist = async (): Promise<void> => {
    if (!text.trim() || aiAssisting) return;

    setAiAssisting(true);
    try {
      const response = await fetch('/api/impact-moment-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentText: text,
          tags: selectedTags,
          effortLevel: effortLevel || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI assistance');
      }

      const data = await response.json() as { improvedText: string };
      if (data.improvedText) {
        setText(data.improvedText);
        toast.success('AI helped improve your impact moment! ✨');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get AI assistance';
      toast.error(message);
    } finally {
      setAiAssisting(false);
    }
  };

  const toggleTag = (tag: ImpactTag): void => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      // Clear validation warning if tags are now selected
      if (newTags.length > 0 && validationWarning?.includes('tags')) {
        setValidationWarning(null);
      }
      return newTags;
    });
  };

  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLTextAreaElement>
  ): void => {
    const isClipboardEvent = 'clipboardData' in e;
    if (isClipboardEvent && e.clipboardData.getData('text')) return;

    const files = isClipboardEvent ? e.clipboardData.files : e.target.files;
    const previewCount = imagesPreview.length;
    const imagesData = getImagesData(files, previewCount);
    
    if (!imagesData) {
      toast.error('Please choose a GIF or photo up to 4');
      return;
    }

    const { imagesPreviewData, selectedImagesData } = imagesData;
    setImagesPreview([...imagesPreview, ...imagesPreviewData]);

    const newSelectedImages = selectedImagesData.map((image) => ({
      id: image.id,
      file: image instanceof File ? image : image
    }));

    setSelectedImages([...selectedImages, ...newSelectedImages]);
  };

  const removeImage = (targetId: string): (() => void) => {
    return () => {
      setSelectedImages(selectedImages.filter(({ id }) => id !== targetId));
      setImagesPreview(imagesPreview.filter(({ id }) => id !== targetId));

      const foundImage = imagesPreview.find(({ id }) => id === targetId);
      if (foundImage) {
        URL.revokeObjectURL(foundImage.src);
      }
    };
  };

  const handleSubmit = async (): Promise<void> => {
    // Validation
    if (!text.trim()) {
      toast.error('Please describe your impact moment');
      return;
    }

    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    if (!effortLevel) {
      toast.error('Please select an effort level');
      return;
    }

    if (text.length > inputLimit) {
      toast.error(`Text must be ${inputLimit} characters or less`);
      return;
    }

    setLoading(true);

    try {
      // Upload images first if any
      const imageUrls: string[] = [];
      // TODO: Implement image upload to Firebase Storage
      // For now, we'll store the file references

      const impactMomentData: Omit<ImpactMoment, 'id'> = {
        text: text.trim(),
        tags: selectedTags,
        effortLevel,
        moodCheckIn: moodBefore !== null && moodAfter !== null 
          ? { before: moodBefore, after: moodAfter }
          : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        createdBy: user?.id ?? '',
        createdAt: new Date(),
        ripples: {
          inspired: [],
          grateful: [],
          joined_you: [],
          sent_love: []
        },
        rippleCount: 0
      };

      if (!user?.id) {
        toast.error('Please sign in to share impact moments');
        return;
      }

      // Write directly to Firestore so security rules are enforced
      await addDoc(impactMomentsCollection, {
        ...impactMomentData,
        createdAt: serverTimestamp()
      } as any);

      // Reset form
      setText('');
      setSelectedTags([]);
      setEffortLevel(null);
      setMoodBefore(null);
      setMoodAfter(null);
      setSelectedImages([]);
      imagesPreview.forEach((image) => URL.revokeObjectURL(image.src));
      setImagesPreview([]);
      setIsExpanded(false);
      
      toast.success('Impact moment shared! 🌱');
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to share impact moment';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => {
    setText('');
    setSelectedTags([]);
    setEffortLevel(null);
    setMoodBefore(null);
    setMoodAfter(null);
    setSelectedImages([]);
    imagesPreview.forEach((image) => URL.revokeObjectURL(image.src));
    setImagesPreview([]);
    setIsExpanded(false);
    onCancel?.();
  };

  const isValid = text.trim().length > 0 && 
                  selectedTags.length > 0 && 
                  effortLevel !== null &&
                  text.length <= inputLimit;

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'w-full px-6 py-4 text-left',
          'flex items-center gap-4',
          'rounded-xl border-2 border-dashed border-gray-300',
          'bg-gray-50 hover:bg-gray-100',
          'dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800',
          'transition-colors duration-200',
          'group'
        )}
      >
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
          <span className='text-xl'>🌱</span>
        </div>
        <div className='flex-1'>
          <p className='font-semibold text-gray-900 dark:text-white'>
            Share an Impact Moment
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {description}
          </p>
        </div>
      </button>
    );
  }

  return (
    <motion.div
      initial='initial'
      animate='animate'
      exit='exit'
      variants={variants}
      className='rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'
    >
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Share an Impact Moment
          </h3>
          <button
            onClick={handleCancel}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            ✕
          </button>
        </div>

        {/* User Avatar and Text Input */}
        <div className='flex gap-3'>
          <UserAvatar
            src={user?.photoURL ?? ''}
            alt={user?.name ?? 'User'}
            username={user?.username ?? 'user'}
          />
          <div className='flex-1'>
            <div className='relative'>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onPaste={handleImageUpload}
                placeholder={placeholder}
                className={cn(
                  'w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 pr-12',
                  'text-gray-900 placeholder-gray-500',
                  'dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400',
                  'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                  'transition-colors',
                  aiAssisting && 'opacity-60'
                )}
                rows={3}
                maxLength={inputLimit}
                disabled={aiAssisting}
              />
              {text.trim() && (
                <button
                  onClick={handleAIAssist}
                  disabled={aiAssisting || !text.trim()}
                  className={cn(
                    'absolute right-2 top-2 rounded-lg p-2',
                    'text-purple-600 hover:bg-purple-100',
                    'dark:text-purple-400 dark:hover:bg-purple-900/30',
                    'transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'group'
                  )}
                  title='Get AI help to improve your impact moment'
                >
                  {aiAssisting ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Sparkles className='h-4 w-4 group-hover:scale-110 transition-transform' />
                  )}
                </button>
              )}
            </div>
            <div className='mt-1 flex items-center justify-between text-xs text-gray-500'>
              <div className='flex items-center gap-2'>
                <span>{text.length} / {inputLimit}</span>
                {parsing && (
                  <span className='flex items-center gap-1 text-purple-600 dark:text-purple-400'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    <span>Auto-detecting...</span>
                  </span>
                )}
              </div>
              {text.trim() && !aiAssisting && !parsing && (
                <button
                  onClick={handleAIAssist}
                  className='flex items-center gap-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                >
                  <Sparkles className='h-3 w-3' />
                  <span>AI Assist</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tags Selection */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Tags (select at least one)
            {selectedTags.length === 0 && (
              <span className='ml-2 text-xs text-red-500'>* Required</span>
            )}
          </label>
          <div className='flex flex-wrap gap-2'>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                  selectedTags.includes(tag)
                    ? impactTagColors[tag]
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {impactTagLabels[tag]}
              </button>
            ))}
          </div>
        </div>

        {/* Effort Level */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Effort Level
            {effortLevel === null && (
              <span className='ml-2 text-xs text-red-500'>* Required</span>
            )}
          </label>
          <div className='flex gap-2'>
            {allEffortLevels.map((level) => (
              <button
                key={level}
                onClick={() => {
                  setEffortLevel(level);
                  // Clear validation warning if effort level is now selected
                  if (validationWarning?.includes('effort level')) {
                    setValidationWarning(null);
                  }
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5',
                  'text-sm font-medium transition-all',
                  effortLevel === level
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                <span>{effortLevelIcons[level]}</span>
                <span>{effortLevelLabels[level]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Validation Warning */}
        {validationWarning && (
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20'>
            <div className='flex items-start gap-2'>
              <Sparkles className='h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400' />
              <p className='text-sm text-amber-800 dark:text-amber-300'>
                {validationWarning}
              </p>
            </div>
          </div>
        )}

        {/* Mood Check-in (Optional) */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Mood Check-in (optional)
          </label>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-xs text-gray-600 dark:text-gray-400'>
                Before
              </label>
              <div className='flex items-center gap-2'>
                <Frown className='h-4 w-4 text-gray-400' />
                <input
                  type='range'
                  min='1'
                  max='5'
                  value={moodBefore ?? 3}
                  onChange={(e) => setMoodBefore(Number(e.target.value))}
                  className='flex-1'
                />
                <Smile className='h-4 w-4 text-gray-400' />
                <span className='w-8 text-center text-sm font-medium'>
                  {moodBefore ?? 3}
                </span>
              </div>
            </div>
            <div>
              <label className='mb-1 block text-xs text-gray-600 dark:text-gray-400'>
                After
              </label>
              <div className='flex items-center gap-2'>
                <Frown className='h-4 w-4 text-gray-400' />
                <input
                  type='range'
                  min='1'
                  max='5'
                  value={moodAfter ?? 3}
                  onChange={(e) => setMoodAfter(Number(e.target.value))}
                  className='flex-1'
                />
                <Smile className='h-4 w-4 text-gray-400' />
                <span className='w-8 text-center text-sm font-medium'>
                  {moodAfter ?? 3}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview */}
        {imagesPreview.length > 0 && (
          <ImagePreview
            imagesPreview={imagesPreview}
            previewCount={imagesPreview.length}
            removeImage={!loading ? removeImage : undefined}
          />
        )}

        {/* Actions */}
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
              className='hidden'
              multiple
            />
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              disabled={loading}
            >
              📷 Add Photo
            </button>
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleCancel}
              className='rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity',
                isValid && !loading
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-400 cursor-not-allowed'
              )}
            >
              {loading ? 'Sharing...' : 'Share Impact Moment'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

