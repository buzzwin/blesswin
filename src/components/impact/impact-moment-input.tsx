import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { getImagesData } from '@lib/validation';
import { UserAvatar } from '@components/user/user-avatar';
// Removed direct Firestore import - now using API endpoint
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
  initialText?: string;
  initialTags?: ImpactTag[];
  initialEffortLevel?: EffortLevel;
  storyId?: string;
  storyTitle?: string;
}

export function ImpactMomentInput({
  onSuccess,
  onCancel,
  defaultExpanded = false,
  initialText = '',
  initialTags = [],
  initialEffortLevel,
  storyId,
  storyTitle
}: ImpactMomentInputProps): JSX.Element {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [text, setText] = useState(initialText);
  const [selectedTags, setSelectedTags] = useState<ImpactTag[]>(initialTags);
  const [effortLevel, setEffortLevel] = useState<EffortLevel | null>(initialEffortLevel || null);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(true); // Default to public
  const [selectedImages, setSelectedImages] = useState<FilesWithId>([]);
  const [imagesPreview, setImagesPreview] = useState<ImagesPreview>([]);
  const [loading, setLoading] = useState(false);
  const [aiAssisting, setAiAssisting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState('What are you doing with people? Share a moment — a walk, a movie, a meal together...');
  const [description, setDescription] = useState('Share what you\'re doing together');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputLimit = 280;

  const allTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
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

      if (!user?.id) {
        toast.error('Please sign in to share impact moments');
        return;
      }

      // Use API endpoint to create impact moment (supports story tracking and karma)
      const response = await fetch('/api/impact-moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
          body: JSON.stringify({
          text: text.trim(),
          tags: selectedTags,
          effortLevel,
          moodCheckIn: moodBefore !== null && moodAfter !== null 
            ? { before: moodBefore, after: moodAfter }
            : undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
          userId: user.id,
          isPublic,
          ...(storyId && storyTitle ? {
            fromRealStory: true,
            storyId: storyId,
            storyTitle: storyTitle
          } : {})
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create impact moment');
      }

      // Reset form
      setText('');
      setSelectedTags([]);
      setEffortLevel(null);
      setMoodBefore(null);
      setMoodAfter(null);
      setIsPublic(true); // Reset to public by default
      setSelectedImages([]);
      imagesPreview.forEach((image) => URL.revokeObjectURL(image.src));
      setImagesPreview([]);
      setIsExpanded(false);
      
      toast.success('Shared! 🤝');
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
    setIsPublic(true); // Reset to public by default
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
          'rounded-xl border border-dashed border-[#d4bfa0]',
          'bg-[#faf8f4] hover:bg-[#f5f1ea]',
          'dark:border-[#3d2e1e] dark:bg-[#1c1510] dark:hover:bg-[#231a10]',
          'transition-colors duration-200',
          'group'
        )}
      >
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full' style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)' }}>
          <span className='text-xl'>✨</span>
        </div>
        <div className='flex-1'>
          <p className='font-semibold text-light-primary dark:text-dark-primary'>
            What are you doing together?
          </p>
          <p className='text-sm text-[#6b5744] dark:text-[#9E8B76]'>
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
      className='rounded-xl border border-[#e8d8c4] bg-[#faf8f4] p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'
    >
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-light-primary dark:text-dark-primary'>
            Share a moment
          </h3>
          <button
            onClick={handleCancel}
            className='text-[#9E8B76] hover:text-[#C9A96E]'
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
                  'w-full resize-none rounded-lg border border-[#e8d8c4] bg-[#f5f1ea] p-3 pr-12',
                  'text-light-primary placeholder-[#9E8B76]',
                  'dark:border-[#2a1d10] dark:bg-[#110d07] dark:text-dark-primary dark:placeholder-[#6b5744]',
                  'focus:border-[#C9A96E] focus:outline-none focus:ring-2 focus:ring-[rgba(201,169,110,0.2)]',
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
                    'text-[#C9A96E] hover:bg-[rgba(201,169,110,0.1)]',
                    'dark:text-[#C9A96E]',
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
                  <span className='flex items-center gap-1 text-[#C9A96E]'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    <span>Auto-detecting...</span>
                  </span>
                )}
              </div>
              {text.trim() && !aiAssisting && !parsing && (
                <button
                  onClick={handleAIAssist}
                  className='flex items-center gap-1 text-[#C9A96E] hover:text-[#E8B86D]'
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
          <label className='mb-2 block text-sm font-medium text-[#6b5744] dark:text-[#9E8B76]'>
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
                    : 'bg-[rgba(201,169,110,0.06)] text-[#6b5744] hover:bg-[rgba(201,169,110,0.12)] dark:bg-[rgba(201,169,110,0.05)] dark:text-[#9E8B76] dark:hover:bg-[rgba(201,169,110,0.1)]'
                )}
              >
                {impactTagLabels[tag]}
              </button>
            ))}
          </div>
        </div>

        {/* Effort Level */}
        <div>
          <label className='mb-2 block text-sm font-medium text-[#6b5744] dark:text-[#9E8B76]'>
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
                    ? 'bg-[rgba(201,169,110,0.15)] text-[#7a5520] dark:bg-[rgba(201,169,110,0.12)] dark:text-[#C9A96E]'
                    : 'bg-[rgba(201,169,110,0.06)] text-[#6b5744] hover:bg-[rgba(201,169,110,0.12)] dark:bg-[rgba(201,169,110,0.05)] dark:text-[#9E8B76] dark:hover:bg-[rgba(201,169,110,0.1)]'
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
          <label className='mb-2 block text-sm font-medium text-[#6b5744] dark:text-[#9E8B76]'>
            Mood Check-in (optional)
          </label>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-xs text-[#6b5744] dark:text-[#9E8B76]'>
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
              <label className='mb-1 block text-xs text-[#6b5744] dark:text-[#9E8B76]'>
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

        {/* Privacy Toggle */}
        <div className='flex items-center justify-between rounded-lg border border-[#e8d8c4] bg-[#f5f1ea] p-3 dark:border-[#2a1d10] dark:bg-[#140f08]'>
          <div className='flex-1'>
            <label className='block text-sm font-medium text-[#6b5744] dark:text-[#9E8B76]'>
              Visibility
            </label>
            <p className='mt-0.5 text-xs text-gray-500 dark:text-[#9E8B76]'>
              {isPublic 
                ? 'This moment will be visible to everyone in the feed' 
                : 'This moment will only be visible to you'}
            </p>
          </div>
          <button
            type='button'
            onClick={() => setIsPublic(!isPublic)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50 focus:ring-offset-2',
              isPublic 
                ? 'bg-[#C97D60]'
                : 'bg-[#d4bfa0] dark:bg-[#3d2e1e]'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                isPublic ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
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
              className='rounded-lg px-3 py-2 text-sm text-[#6b5744] hover:bg-[rgba(201,169,110,0.08)] dark:text-[#9E8B76]'
              disabled={loading}
            >
              📷 Add Photo
            </button>
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleCancel}
              className='rounded-lg px-4 py-2 text-sm font-medium text-[#6b5744] hover:bg-[rgba(201,169,110,0.08)] dark:text-[#9E8B76]'
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
                  ? 'bg-[#C97D60] hover:bg-[#B56540]'
                  : 'bg-[#9E8B76] cursor-not-allowed'
              )}
            >
              {loading ? 'Sharing...' : 'Share with community'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

