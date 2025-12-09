import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { toast } from 'react-hot-toast';
import { Calendar, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { RitualDefinition, RitualTimeOfDay, DayOfWeek, DayOfMonth } from '@lib/types/ritual';
import { generateRRULE, dayOfWeekToICal } from '@lib/utils/rrule';
import type { RealStory } from '@lib/types/real-story';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

export default function CreateRitualPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  useRequireAuth('/login');
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<ImpactTag[]>([]);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('tiny');
  const [suggestedTimeOfDay, setSuggestedTimeOfDay] = useState<RitualTimeOfDay>('anytime');
  const [durationEstimate, setDurationEstimate] = useState('5 minutes');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dailyInterval, setDailyInterval] = useState<number>(1);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6]);
  const [monthlyType, setMonthlyType] = useState<'dates' | 'ordinal'>('dates');
  const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState<DayOfMonth[]>([]);
  const [monthlyOrdinal, setMonthlyOrdinal] = useState<number>(1);
  const [monthlyOrdinalDay, setMonthlyOrdinalDay] = useState<DayOfWeek>(1);
  
  // Story and suggestions state
  const [story, setStory] = useState<RealStory | null>(null);
  const [suggestions, setSuggestions] = useState<RitualDefinition[]>([]);
  const [analysis, setAnalysis] = useState<{
    connection: string;
    whyTheseRituals: string[];
    personalizedNote?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);
  const [textSuggestions, setTextSuggestions] = useState<Array<{ title: string; description: string }>>([]);
  const [fetchingTextSuggestions, setFetchingTextSuggestions] = useState(false);

  // Load story from sessionStorage
  useEffect(() => {
    if (!user?.id || authLoading) return;

    const storedStory = typeof window !== 'undefined' 
      ? JSON.parse(sessionStorage.getItem('ritualStory') || 'null') 
      : null;

    if (storedStory) {
      setStory(storedStory);
      // Automatically fetch suggestions when story is loaded
      void fetchSuggestions(storedStory);
    } else {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const fetchSuggestions = async (storyData: RealStory): Promise<void> => {
    setFetchingSuggestions(true);
    try {
      const response = await fetch('/api/story-ritual-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          story: storyData,
          userId: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setAnalysis(data.analysis || null);
          // Prepopulate form with first suggestion
          prepopulateForm(data.suggestions[0]);
          setSelectedSuggestionIndex(0);
        } else {
          toast.error('No ritual suggestions available for this story');
        }
      } else {
        throw new Error('Failed to fetch ritual suggestions');
      }
    } catch (error) {
      console.error('Error fetching ritual suggestions:', error);
      toast.error('Failed to load ritual suggestions');
    } finally {
      setFetchingSuggestions(false);
      setLoading(false);
    }
  };

  const prepopulateForm = (suggestion: RitualDefinition): void => {
    setTitle(suggestion.title || '');
    setDescription(suggestion.description || '');
    setTags(suggestion.tags || []);
    setEffortLevel(suggestion.effortLevel || 'tiny');
    setSuggestedTimeOfDay(suggestion.suggestedTimeOfDay || 'anytime');
    setDurationEstimate(suggestion.durationEstimate || '5 minutes');
  };

  const handleSelectSuggestion = (index: number): void => {
    setSelectedSuggestionIndex(index);
    prepopulateForm(suggestions[index]);
    toast.success('Form updated with selected suggestion ✨');
  };

  const handleCreateRitual = async (): Promise<void> => {
    if (!title.trim() || !description.trim() || !user?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!tags || tags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    if (frequencyType === 'weekly' && (!selectedDaysOfWeek || selectedDaysOfWeek.length === 0)) {
      toast.error('Please select at least one day of the week');
      return;
    }
    if (frequencyType === 'monthly') {
      if (monthlyType === 'dates' && (!selectedDaysOfMonth || selectedDaysOfMonth.length === 0)) {
        toast.error('Please select at least one date of the month');
        return;
      }
    }

    // Ensure tags are valid ImpactTag types
    const validTags = tags.filter(tag => 
      ['mind', 'body', 'relationships', 'nature', 'community', 'chores'].includes(tag)
    );
    
    if (validTags.length === 0) {
      toast.error('Please select at least one valid tag');
      return;
    }

    try {
      // First, create the custom ritual
      const ritualResponse = await fetch('/api/rituals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: title.trim(),
          description: description.trim(),
          tags: validTags,
          effortLevel,
          suggestedTimeOfDay,
          durationEstimate,
          frequency: frequencyType === 'daily'
            ? generateRRULE({ freq: 'DAILY', interval: dailyInterval })
            : frequencyType === 'weekly'
            ? generateRRULE({
                freq: 'WEEKLY',
                byday: selectedDaysOfWeek.map(day => dayOfWeekToICal(day))
              })
            : monthlyType === 'dates'
            ? generateRRULE({
                freq: 'MONTHLY',
                bymonthday: selectedDaysOfMonth
              })
            : generateRRULE({
                freq: 'MONTHLY',
                byday: [`${monthlyOrdinal}${dayOfWeekToICal(monthlyOrdinalDay)}`]
              }),
          storyId: story?.title,
          storyTitle: story?.title
        })
      });

      const ritualData = await ritualResponse.json();

      if (!ritualResponse.ok) {
        const errorMessage = ritualData.error || 'Failed to create ritual';
        console.error('Ritual API Error:', errorMessage, ritualData);
        toast.error(`Failed to create ritual: ${errorMessage}`);
        return;
      }

      // Also create an Impact Moment to log the creation
      try {
        await fetch('/api/impact-moments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `Created ritual: ${title}\n\n${description}`,
            tags: validTags,
            effortLevel,
            userId: user.id,
            fromRealStory: story ? true : false,
            storyId: story?.title,
            storyTitle: story?.title
          })
        });
      } catch (momentError) {
        // Don't fail if Impact Moment creation fails
        console.error('Error creating impact moment:', momentError);
      }

      toast.success('Ritual created successfully! ✨');
      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ritualStory');
      }
      router.push('/rituals');
    } catch (error) {
      console.error('Error creating ritual:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create ritual: ${errorMessage}`);
    }
  };

  const availableTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
  const effortLevels: EffortLevel[] = ['tiny', 'medium', 'deep'];
  const timeOfDayOptions: RitualTimeOfDay[] = ['morning', 'afternoon', 'evening', 'anytime'];

  if (authLoading || loading) {
    return (
      <MainContainer>
        <MainHeader title='Create Ritual' useMobileSidebar />
        <div className='flex items-center justify-center py-20'>
          <div className='text-center'>
            <div className='mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto' />
            <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
          </div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO 
        title='Create Ritual - Daily Rituals / Buzzwin'
        description='Create a new daily ritual based on inspiring stories'
      />
      <MainHeader title='Create Ritual' useMobileSidebar />

      {/* Story Context */}
      {story && (
        <div className='mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
          <div className='mb-2 flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            <h3 className='font-semibold text-purple-900 dark:text-purple-100'>
              Inspired by: {story.title}
            </h3>
          </div>
          <p className='text-sm text-purple-800 dark:text-purple-200'>
            {story.description}
          </p>
        </div>
      )}

      {/* Fetch Suggestions Button */}
      {story && suggestions.length === 0 && !fetchingSuggestions && (
        <div className='mb-6'>
          <button
            onClick={() => void fetchSuggestions(story)}
            className='w-full rounded-lg border-2 border-purple-200 bg-purple-50 p-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-600'>
                <Calendar className='h-5 w-5 text-white' />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-gray-900 dark:text-white'>
                  Get AI Suggestions
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Get personalized ritual suggestions based on this story
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Loading Suggestions */}
      {fetchingSuggestions && (
        <div className='mb-6 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50'>
          <Loader2 className='mr-3 h-5 w-5 animate-spin text-purple-600' />
          <span className='text-gray-600 dark:text-gray-400'>Fetching ritual suggestions...</span>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className='mb-6'>
          <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
            AI Suggestions
          </h2>
          <div className='space-y-2'>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(idx)}
                className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                  selectedSuggestionIndex === idx
                    ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/30'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/20'
                }`}
              >
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  {suggestion.title}
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {suggestion.description}
                </p>
                {analysis?.whyTheseRituals?.[idx] && (
                  <p className='mt-1 text-xs italic text-purple-600 dark:text-purple-400'>
                    {analysis.whyTheseRituals[idx]}
                  </p>
                )}
              </button>
            ))}
          </div>
          {analysis?.connection && (
            <p className='mt-3 text-sm text-gray-600 dark:text-gray-400'>
              {analysis.connection}
            </p>
          )}
        </div>
      )}

      {/* Create Ritual Form */}
      <div className='mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
          Create Your Ritual
        </h2>

        <div className='space-y-4'>
          {/* Title */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Title *
              </label>
              {story && (
                <button
                  type='button'
                  onClick={async () => {
                    if (!story) return;
                    setFetchingTextSuggestions(true);
                    try {
                      const response = await fetch('/api/rituals/text-suggestions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ story })
                      });
                      if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.suggestions) {
                          setTextSuggestions(data.suggestions);
                          toast.success('Got AI suggestions! Click any suggestion below to use it.');
                        }
                      }
                    } catch (error) {
                      console.error('Error fetching text suggestions:', error);
                      toast.error('Failed to get suggestions');
                    } finally {
                      setFetchingTextSuggestions(false);
                    }
                  }}
                  disabled={fetchingTextSuggestions}
                  className='text-xs font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50 dark:text-purple-400 dark:hover:text-purple-300'
                >
                  {fetchingTextSuggestions ? 'Getting suggestions...' : '✨ Get AI Suggestions'}
                </button>
              )}
            </div>
            {textSuggestions.length > 0 && (
              <div className='mb-2 space-y-1'>
                {textSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => {
                      setTitle(suggestion.title);
                      setDescription(suggestion.description);
                      toast.success('Form updated with suggestion!');
                    }}
                    className='w-full rounded border border-purple-200 bg-purple-50 p-2 text-left text-xs transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30'
                  >
                    <div className='font-medium text-purple-900 dark:text-purple-100'>
                      {suggestion.title}
                    </div>
                    <div className='mt-1 text-purple-700 dark:text-purple-300'>
                      {suggestion.description.substring(0, 80)}...
                    </div>
                  </button>
                ))}
              </div>
            )}
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
              Tags
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
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
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
              Effort Level
            </label>
            <div className='flex gap-2'>
              {effortLevels.map(level => (
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

          {/* Time of Day */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Best Time
            </label>
            <select
              value={suggestedTimeOfDay}
              onChange={(e) => setSuggestedTimeOfDay(e.target.value as RitualTimeOfDay)}
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            >
              {timeOfDayOptions.map(time => (
                <option key={time} value={time}>
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
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

          {/* Frequency */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Frequency (RRULE)
            </label>
            <div className='space-y-3'>
              {/* Frequency Type Selector */}
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setFrequencyType('daily')}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    frequencyType === 'daily'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Daily
                </button>
                <button
                  type='button'
                  onClick={() => setFrequencyType('weekly')}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    frequencyType === 'weekly'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type='button'
                  onClick={() => setFrequencyType('monthly')}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    frequencyType === 'monthly'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {/* Daily Selector */}
              {frequencyType === 'daily' && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Repeat every</span>
                    <input
                      type='number'
                      min={1}
                      max={365}
                      value={dailyInterval}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (val > 0) {
                          setDailyInterval(val);
                        }
                      }}
                      className='w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                    />
                    <span className='text-sm text-gray-600 dark:text-gray-400'>day(s)</span>
                  </div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    RRULE: {generateRRULE({ freq: 'DAILY', interval: dailyInterval })}
                  </p>
                </div>
              )}

              {/* Weekly Selector */}
              {frequencyType === 'weekly' && (
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Select the days of the week:
                  </p>
                  <div className='grid grid-cols-7 gap-2'>
                    {[
                      { day: 0, label: 'Sun', short: 'S' },
                      { day: 1, label: 'Mon', short: 'M' },
                      { day: 2, label: 'Tue', short: 'T' },
                      { day: 3, label: 'Wed', short: 'W' },
                      { day: 4, label: 'Thu', short: 'T' },
                      { day: 5, label: 'Fri', short: 'F' },
                      { day: 6, label: 'Sat', short: 'S' }
                    ].map(({ day, label, short }) => {
                      const isSelected = selectedDaysOfWeek.includes(day as DayOfWeek);
                      return (
                        <button
                          key={day}
                          type='button'
                          onClick={() => {
                            if (isSelected) {
                              setSelectedDaysOfWeek(selectedDaysOfWeek.filter(d => d !== day));
                            } else {
                              setSelectedDaysOfWeek([...selectedDaysOfWeek, day as DayOfWeek].sort());
                            }
                          }}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                          title={label}
                        >
                          <span className='hidden sm:inline'>{label}</span>
                          <span className='sm:hidden'>{short}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedDaysOfWeek.length === 0 && (
                    <p className='text-xs text-red-500 dark:text-red-400'>
                      Please select at least one day
                    </p>
                  )}
                  {selectedDaysOfWeek.length > 0 && (
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      RRULE: {generateRRULE({
                        freq: 'WEEKLY',
                        byday: selectedDaysOfWeek.map(day => dayOfWeekToICal(day))
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Monthly Selector */}
              {frequencyType === 'monthly' && (
                <div className='space-y-3'>
                  {/* Monthly Type Selector */}
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => setMonthlyType('dates')}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        monthlyType === 'dates'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Specific Dates
                    </button>
                    <button
                      type='button'
                      onClick={() => setMonthlyType('ordinal')}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        monthlyType === 'ordinal'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Ordinal Day (e.g., 2nd Friday)
                    </button>
                  </div>

                  {/* Monthly Dates */}
                  {monthlyType === 'dates' && (
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Select the dates of the month:
                      </p>
                      <div className='grid grid-cols-7 gap-2 max-h-64 overflow-y-auto'>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                          const isSelected = selectedDaysOfMonth.includes(date as DayOfMonth);
                          return (
                            <button
                              key={date}
                              type='button'
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedDaysOfMonth(selectedDaysOfMonth.filter(d => d !== date));
                                } else {
                                  setSelectedDaysOfMonth([...selectedDaysOfMonth, date as DayOfMonth].sort((a, b) => a - b));
                                }
                              }}
                              className={`rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              }`}
                              title={`Day ${date}`}
                            >
                              {date}
                            </button>
                          );
                        })}
                      </div>
                      {selectedDaysOfMonth.length === 0 && (
                        <p className='text-xs text-red-500 dark:text-red-400'>
                          Please select at least one date
                        </p>
                      )}
                      {selectedDaysOfMonth.length > 0 && (
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          RRULE: {generateRRULE({
                            freq: 'MONTHLY',
                            bymonthday: selectedDaysOfMonth
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Monthly Ordinal Day */}
                  {monthlyType === 'ordinal' && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <select
                          value={monthlyOrdinal}
                          onChange={(e) => setMonthlyOrdinal(parseInt(e.target.value, 10))}
                          className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        >
                          <option value={1}>1st</option>
                          <option value={2}>2nd</option>
                          <option value={3}>3rd</option>
                          <option value={4}>4th</option>
                          <option value={5}>5th</option>
                          <option value={-1}>Last</option>
                        </select>
                        <select
                          value={monthlyOrdinalDay}
                          onChange={(e) => setMonthlyOrdinalDay(parseInt(e.target.value, 10) as DayOfWeek)}
                          className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        >
                          {[
                            { day: 0, label: 'Sunday' },
                            { day: 1, label: 'Monday' },
                            { day: 2, label: 'Tuesday' },
                            { day: 3, label: 'Wednesday' },
                            { day: 4, label: 'Thursday' },
                            { day: 5, label: 'Friday' },
                            { day: 6, label: 'Saturday' }
                          ].map(({ day, label }) => (
                            <option key={day} value={day}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        RRULE: {generateRRULE({
                          freq: 'MONTHLY',
                          byday: [`${monthlyOrdinal}${dayOfWeekToICal(monthlyOrdinalDay)}`]
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4'>
        <Link
          href='/rituals'
          className='flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        >
          <span className='flex items-center gap-2'>
            <ArrowLeft className='h-5 w-5' />
            Back to Rituals
          </span>
        </Link>
        <button
          onClick={handleCreateRitual}
          disabled={!title.trim() || !description.trim() || tags.length === 0}
          className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Calendar className='h-5 w-5' />
          Create Ritual
        </button>
        {tags.length === 0 && (
          <p className='mt-2 text-xs text-red-600 dark:text-red-400'>
            Please select at least one tag to create a ritual
          </p>
        )}
      </div>
    </MainContainer>
  );
}
