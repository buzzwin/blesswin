import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { Modal } from '@components/modal/modal';
import { useModal } from '@lib/hooks/useModal';
import { toast } from 'react-hot-toast';
import { Settings, Bell, Moon, Sun, Clock } from 'lucide-react';
import { getDoc } from 'firebase/firestore';
import { userRitualStateDoc } from '@lib/firebase/collections';
import type { UserRitualState } from '@lib/types/ritual';
import type { ImpactTag } from '@lib/types/impact-moment';
import { impactTagLabels, impactTagColors } from '@lib/types/impact-moment';

interface RitualSettingsProps {
  open: boolean;
  closeModal: () => void;
}

export function RitualSettings({
  open,
  closeModal
}: RitualSettingsProps): JSX.Element {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserRitualState | null>(null);

  // Load current settings
  useEffect(() => {
    if (!open || !user?.id) return;

    const loadSettings = async (): Promise<void> => {
      setLoading(true);
      try {
        const userStateDoc = userRitualStateDoc(user.id);
        const snapshot = await getDoc(userStateDoc);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSettings(data);
        } else {
          toast.error('Ritual settings not found');
          closeModal();
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, [open, user?.id, closeModal]);

  const handleSave = async (): Promise<void> => {
    if (!user?.id || !settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/rituals/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          notificationPreferences: settings.notificationPreferences,
          preferredCategories: settings.preferredTags || []
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      toast.success('Settings saved! ✨');
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationPref = (key: keyof UserRitualState['notificationPreferences'], value: boolean | string): void => {
    if (!settings) return;
    setSettings({
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [key]: value
      }
    });
  };

  const toggleCategory = (tag: ImpactTag): void => {
    if (!settings) return;
    const current = settings.preferredTags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    setSettings({
      ...settings,
      preferredTags: updated
    });
  };

  if (loading) {
    return (
      <Modal
        modalClassName='max-w-2xl bg-white dark:bg-gray-900 w-full p-6 rounded-2xl'
        open={open}
        closeModal={closeModal}
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-gray-600 dark:text-gray-400'>Loading settings...</div>
        </div>
      </Modal>
    );
  }

  if (!settings) {
    return (
      <Modal
        modalClassName='max-w-2xl bg-white dark:bg-gray-900 w-full p-6 rounded-2xl'
        open={open}
        closeModal={closeModal}
      >
        <div className='text-center py-12'>
          <div className='text-gray-600 dark:text-gray-400'>Settings not found</div>
        </div>
      </Modal>
    );
  }

  const allTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community'];

  return (
    <Modal
      modalClassName='max-w-2xl bg-white dark:bg-gray-900 w-full p-6 rounded-2xl max-h-[90vh] overflow-y-auto'
      open={open}
      closeModal={closeModal}
    >
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-purple-100 p-2 dark:bg-purple-900/30'>
              <Settings className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Ritual Settings
            </h2>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Bell className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Notifications
            </h3>
          </div>

          {/* Morning Notification */}
          <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <Sun className='h-4 w-4 text-orange-500' />
                <span className='font-medium text-gray-900 dark:text-white'>Morning Reminder</span>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.notificationPreferences.morning}
                  onChange={(e) => updateNotificationPref('morning', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            {settings.notificationPreferences.morning && (
              <div className='mt-3'>
                <label className='block text-sm text-gray-600 dark:text-gray-400 mb-1'>
                  Time
                </label>
                <input
                  type='time'
                  value={settings.notificationPreferences.morningTime || '08:00'}
                  onChange={(e) => updateNotificationPref('morningTime', e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>
            )}
          </div>

          {/* Evening Notification */}
          <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <Moon className='h-4 w-4 text-blue-500' />
                <span className='font-medium text-gray-900 dark:text-white'>Evening Reminder</span>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.notificationPreferences.evening}
                  onChange={(e) => updateNotificationPref('evening', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
            {settings.notificationPreferences.evening && (
              <div className='mt-3'>
                <label className='block text-sm text-gray-600 dark:text-gray-400 mb-1'>
                  Time
                </label>
                <input
                  type='time'
                  value={settings.notificationPreferences.eveningTime || '19:00'}
                  onChange={(e) => updateNotificationPref('eveningTime', e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>
            )}
          </div>

          {/* Milestone Notifications */}
          <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-green-500' />
                <div>
                  <span className='font-medium text-gray-900 dark:text-white'>Milestone Celebrations</span>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Get notified when you reach streak milestones</p>
                </div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.notificationPreferences.milestones}
                  onChange={(e) => updateNotificationPref('milestones', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
            <h4 className='font-medium text-gray-900 dark:text-white mb-3'>
              Quiet Hours
            </h4>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
              Set times when you don't want to receive notifications
            </p>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-gray-600 dark:text-gray-400 mb-1'>
                  Start (e.g., 22:00)
                </label>
                <input
                  type='time'
                  value={settings.notificationPreferences.quietHoursStart || '22:00'}
                  onChange={(e) => updateNotificationPref('quietHoursStart', e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm text-gray-600 dark:text-gray-400 mb-1'>
                  End (e.g., 07:00)
                </label>
                <input
                  type='time'
                  value={settings.notificationPreferences.quietHoursEnd || '07:00'}
                  onChange={(e) => updateNotificationPref('quietHoursEnd', e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Categories */}
        <div className='space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Preferred Categories
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Select categories you're most interested in for personalized ritual suggestions
          </p>
          <div className='flex flex-wrap gap-2'>
            {allTags.map((tag) => {
              const isSelected = (settings.preferredTags || []).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleCategory(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? impactTagColors[tag] + ' ring-2 ring-purple-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {impactTagLabels[tag]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700'>
          <button
            onClick={closeModal}
            className='flex-1 rounded-full border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className='flex-1 rounded-full bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

