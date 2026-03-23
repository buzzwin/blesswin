import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { usersCollection } from '@lib/firebase/collections';
import { toast } from 'react-hot-toast';
import type { AgentPreferences } from '@lib/types/agent';

export function AgentPreferencesForm(): JSX.Element | null {
  const { user } = useAuth();
  const [dietary, setDietary] = useState('');
  const [typicalOutingDay, setTypicalOutingDay] = useState('');
  const [venueStyles, setVenueStyles] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = user?.agentPreferences;
    if (p) {
      setDietary(p.dietary ?? '');
      setTypicalOutingDay(p.typicalOutingDay ?? '');
      setVenueStyles((p.venueStyles ?? []).join(', '));
      setNotes(p.notes ?? '');
    }
  }, [user?.agentPreferences, user?.id]);

  if (!user?.id) return null;

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const agentPreferences: AgentPreferences = {
        dietary: dietary.trim() || undefined,
        typicalOutingDay: typicalOutingDay.trim() || undefined,
        venueStyles: venueStyles
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        notes: notes.trim() || undefined
      };
      await updateDoc(doc(usersCollection, user.id), {
        agentPreferences
      });
      toast.success('Preferences saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
      <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
        Lightweight memory (optional)
      </h3>
      <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
        Helps Ask Buzzwin personalize suggestions. You control what we store.
      </p>
      <div className='mt-3 grid gap-3 sm:grid-cols-2'>
        <label className='block text-xs font-medium text-gray-700 dark:text-gray-300'>
          Dietary / food
          <input
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            className='mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white'
            placeholder='e.g. vegetarian'
          />
        </label>
        <label className='block text-xs font-medium text-gray-700 dark:text-gray-300'>
          Typical outing day
          <input
            value={typicalOutingDay}
            onChange={(e) => setTypicalOutingDay(e.target.value)}
            className='mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white'
            placeholder='e.g. Friday evenings'
          />
        </label>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2'>
          Venue styles (comma-separated)
          <input
            value={venueStyles}
            onChange={(e) => setVenueStyles(e.target.value)}
            className='mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white'
            placeholder='e.g. rooftop bars, quiet cafes'
          />
        </label>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2'>
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className='mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white'
            placeholder='Anything else the assistant should remember'
          />
        </label>
      </div>
      <button
        type='button'
        onClick={() => void handleSave()}
        disabled={saving}
        className='mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
      >
        {saving ? 'Saving…' : 'Save preferences'}
      </button>
    </div>
  );
}
