import { useState, useEffect } from 'react';
import { Modal } from '@components/modal/modal';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import type { RitualDefinition, RitualTimeOfDay, RitualScope, DayOfWeek, DayOfMonth } from '@lib/types/ritual';
import { generateRRULE, parseRRULE, dayOfWeekToICal, iCalToDayOfWeek } from '@lib/utils/rrule';
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
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dailyInterval, setDailyInterval] = useState<number>(1);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6]); // Default to all days
  const [monthlyType, setMonthlyType] = useState<'dates' | 'ordinal'>('dates');
  const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState<DayOfMonth[]>([]);
  const [monthlyOrdinal, setMonthlyOrdinal] = useState<number>(1); // 1-5 for 1st-5th, -1 for last
  const [monthlyOrdinalDay, setMonthlyOrdinalDay] = useState<DayOfWeek>(1); // Monday by default
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
      // Parse RRULE string to UI state
      if (ritual.frequency && typeof ritual.frequency === 'string') {
        const parsed = parseRRULE(ritual.frequency);
        if (parsed) {
          if (parsed.freq === 'MONTHLY') {
            setFrequencyType('monthly');
            if (parsed.bymonthday && parsed.bymonthday.length > 0) {
              setMonthlyType('dates');
              setSelectedDaysOfMonth(parsed.bymonthday as DayOfMonth[]);
            } else if (parsed.byday && parsed.byday.length > 0) {
              setMonthlyType('ordinal');
              // Parse ordinal day (e.g., "2FR")
              const dayStr = parsed.byday[0];
              const match = dayStr.match(/^(-?\d+)?([A-Z]{2})$/);
              if (match) {
                const ordinal = match[1] ? parseInt(match[1], 10) : 1;
                const dayAbbr = match[2];
                setMonthlyOrdinal(ordinal);
                setMonthlyOrdinalDay(iCalToDayOfWeek(dayAbbr) as DayOfWeek);
              }
            }
            setSelectedDaysOfWeek([]);
          } else if (parsed.freq === 'WEEKLY' && parsed.byday) {
            setFrequencyType('weekly');
            const days = parsed.byday.map(day => {
              // Extract day abbreviation (e.g., "MO" from "2MO")
              const match = day.match(/([A-Z]{2})$/);
              return match ? iCalToDayOfWeek(match[1]) : 0;
            });
            setSelectedDaysOfWeek(days.filter((d, i, arr) => arr.indexOf(d) === i) as DayOfWeek[]);
            setSelectedDaysOfMonth([]);
          } else if (parsed.freq === 'DAILY') {
            setFrequencyType('daily');
            setDailyInterval(parsed.interval || 1);
            setSelectedDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
            setSelectedDaysOfMonth([]);
          }
        } else {
          // Invalid RRULE, default to daily
          setFrequencyType('daily');
          setDailyInterval(1);
          setSelectedDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
          setSelectedDaysOfMonth([]);
        }
      } else {
        // Legacy format or no frequency - default to daily
        setFrequencyType('daily');
        setDailyInterval(1);
        setSelectedDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
        setSelectedDaysOfMonth([]);
      }
      setScope(ritual.scope || 'personalized');
    } else {
      // Reset form for new ritual
      setTitle('');
      setDescription('');
      setTags([]);
      setEffortLevel('tiny');
      setSuggestedTimeOfDay('anytime');
      setDurationEstimate('5 minutes');
      setFrequencyType('daily');
      setDailyInterval(1);
      setSelectedDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setSelectedDaysOfMonth([]);
      setMonthlyType('dates');
      setMonthlyOrdinal(1);
      setMonthlyOrdinalDay(1);
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

  const availableTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
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

