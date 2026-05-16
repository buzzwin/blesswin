import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { toast } from 'react-hot-toast';
import { Settings, Mail, Bell, Moon, Sun, Clock, Save, ArrowLeft, UserPlus } from 'lucide-react';
import { InviteFriendModal } from '@components/invite/invite-friend-modal';
import { useModal } from '@lib/hooks/useModal';
import { getDoc } from 'firebase/firestore';
import { userRitualStateDoc } from '@lib/firebase/collections';
import type { UserRitualState } from '@lib/types/ritual';
import type { ImpactTag } from '@lib/types/impact-moment';
import { impactTagLabels, impactTagColors } from '@lib/types/impact-moment';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { Loading } from '@components/ui/loading';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

export default function SettingsPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  useRequireAuth('/login');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserRitualState | null>(null);
  const { open: inviteModalOpen, openModal: openInviteModal, closeModal: closeInviteModal } = useModal();

  // Load current settings
  useEffect(() => {
    if (!user?.id) return;

    const loadSettings = async (): Promise<void> => {
      setLoading(true);
      try {
        const userStateDoc = userRitualStateDoc(user.id);
        const snapshot = await getDoc(userStateDoc);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSettings(data);
        } else {
          // Initialize default settings if not found
          setSettings({
            userId: user.id,
            enabled: true,
            notificationPreferences: {
              morning: true,
              evening: true,
              milestones: true,
              morningTime: '08:00',
              eveningTime: '19:00',
              quietHoursStart: '22:00',
              quietHoursEnd: '07:00'
            },
            emailPreferences: {
              joinedAction: true,
              ritualReminders: true,
              weeklySummary: true
            },
            preferredTags: [],
            currentStreak: 0,
            longestStreak: 0,
            totalCompleted: 0,
            completedThisWeek: 0,
            completedThisMonth: 0,
            onboardingCompleted: false
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, [user?.id]);

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
          emailPreferences: settings.emailPreferences,
          preferredCategories: settings.preferredTags || []
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      toast.success('Settings saved! ✨');
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

  const updateEmailPref = (key: 'joinedAction' | 'ritualReminders' | 'weeklySummary', value: boolean): void => {
    if (!settings) return;
    setSettings({
      ...settings,
      emailPreferences: {
        ...(settings.emailPreferences || { joinedAction: true, ritualReminders: true, weeklySummary: true }),
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

  if (authLoading || loading) {
    return (
      <MainContainer>
        <MainHeader title='Settings' />
        <div className='flex items-center justify-center py-12'>
          <Loading />
        </div>
      </MainContainer>
    );
  }

  if (!settings) {
    return (
      <MainContainer>
        <MainHeader title='Settings' />
        <div className='text-center py-12'>
          <div className='text-[#6b5744] dark:text-[#9E8B76]'>Failed to load settings</div>
        </div>
      </MainContainer>
    );
  }

  const allTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];

  return (
    <MainContainer>
      <MainHeader title='Settings' />
      
      <div className='mx-auto max-w-3xl px-4 py-6'>
        {/* Back Button */}
        <div className='mb-6'>
          <Link href='/home'>
            <a className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a1108] dark:text-[#9E8B76] dark:hover:text-white'>
              <ArrowLeft className='h-4 w-4' />
              Back to Feed
            </a>
          </Link>
        </div>

        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='rounded-full bg-[rgba(201,169,110,0.1)] p-2 dark:bg-[rgba(201,169,110,0.08)]'>
              <Settings className='h-6 w-6 text-[#C9A96E] dark:text-[#C9A96E]' />
            </div>
            <h1 className='font-display text-3xl font-extrabold text-[#1a1108] dark:text-[#F5EFE6]'>
              Settings
            </h1>
          </div>
          <p className='text-[#6b5744] dark:text-[#9E8B76]'>
            Manage your notification and email preferences
          </p>
        </div>

        <div className='space-y-8'>
          {/* Email Preferences Section */}
          <section className='rounded-xl border border-[#e8d8c4] bg-[#faf8f4] p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <div className='mb-6 flex items-center gap-2'>
              <Mail className='h-5 w-5 text-[#6b5744] dark:text-[#9E8B76]' />
              <h2 className='font-display text-xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
                Email Notifications
              </h2>
            </div>
            <p className='mb-6 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
              Choose which emails you'd like to receive from Buzzwin
            </p>

            {/* Joined Ritual Email */}
            <div className='mb-4 rounded-lg border border-[#e8d8c4] p-4 dark:border-[#2a1d10]'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span className='font-medium text-[#1a1108] dark:text-[#F5EFE6]'>
                      Someone Joined Your Ritual
                    </span>
                  </div>
                  <p className='text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    Get notified when someone joins your ritual
                  </p>
                </div>
                <label className='relative ml-4 inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    checked={settings.emailPreferences?.joinedAction !== false}
                    onChange={(e) => updateEmailPref('joinedAction', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#d4bfa0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#e8d8c4] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#C97D60] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgba(201,169,110,0.3)] dark:border-[#2a1d10] dark:bg-[#231a10] dark:peer-focus:ring-[rgba(201,169,110,0.3)]"></div>
                </label>
              </div>
            </div>

            {/* Ritual Reminders Email */}
            <div className='mb-4 rounded-lg border border-[#e8d8c4] p-4 dark:border-[#2a1d10]'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span className='font-medium text-[#1a1108] dark:text-[#F5EFE6]'>
                      Daily Ritual Reminders
                    </span>
                  </div>
                  <p className='text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    Receive email reminders for your daily rituals
                  </p>
                </div>
                <label className='relative ml-4 inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    checked={settings.emailPreferences?.ritualReminders !== false}
                    onChange={(e) => updateEmailPref('ritualReminders', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#d4bfa0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#e8d8c4] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#C97D60] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgba(201,169,110,0.3)] dark:border-[#2a1d10] dark:bg-[#231a10] dark:peer-focus:ring-[rgba(201,169,110,0.3)]"></div>
                </label>
              </div>
            </div>

            {/* Weekly Summary Email */}
            <div className='rounded-lg border border-[#e8d8c4] p-4 dark:border-[#2a1d10]'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span className='font-medium text-[#1a1108] dark:text-[#F5EFE6]'>
                      Weekly Progress Summary
                    </span>
                  </div>
                  <p className='text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    Get a weekly digest of your progress and activity
                  </p>
                </div>
                <label className='relative ml-4 inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    checked={settings.emailPreferences?.weeklySummary !== false}
                    onChange={(e) => updateEmailPref('weeklySummary', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#d4bfa0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#e8d8c4] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#C97D60] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgba(201,169,110,0.3)] dark:border-[#2a1d10] dark:bg-[#231a10] dark:peer-focus:ring-[rgba(201,169,110,0.3)]"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Notification Preferences Section */}
          <section className='rounded-xl border border-[#e8d8c4] bg-[#faf8f4] p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <div className='mb-6 flex items-center gap-2'>
              <Bell className='h-5 w-5 text-[#6b5744] dark:text-[#9E8B76]' />
              <h2 className='font-display text-xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
                Push Notifications
              </h2>
            </div>

            {/* Morning Notification */}
            <div className='mb-4 rounded-lg border border-[#e8d8c4] p-4 dark:border-[#2a1d10]'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Sun className='h-4 w-4 text-orange-500' />
                  <span className='font-medium text-[#1a1108] dark:text-[#F5EFE6]'>
                    Morning Reminder
                  </span>
                </div>
                <label className='relative inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    checked={settings.notificationPreferences.morning}
                    onChange={(e) => updateNotificationPref('morning', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#d4bfa0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#e8d8c4] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#C97D60] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgba(201,169,110,0.3)] dark:border-[#2a1d10] dark:bg-[#231a10] dark:peer-focus:ring-[rgba(201,169,110,0.3)]"></div>
                </label>
              </div>
              {settings.notificationPreferences.morning && (
                <div className='mt-3'>
                  <label className='mb-1 block text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    Time
                  </label>
                  <input
                    type='time'
                    value={settings.notificationPreferences.morningTime || '08:00'}
                    onChange={(e) => updateNotificationPref('morningTime', e.target.value)}
                    className='w-full rounded-lg border border-[#e8d8c4] px-3 py-2 text-[#1a1108] focus:border-transparent focus:ring-2 focus:ring-[#C9A96E]/50 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white'
                  />
                </div>
              )}
            </div>

            {/* Evening Notification */}
            <div className='mb-4 rounded-lg border border-[#e8d8c4] p-4 dark:border-[#2a1d10]'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Moon className='h-4 w-4 text-[#C9A96E]' />
                  <span className='font-medium text-[#1a1108] dark:text-[#F5EFE6]'>
                    Evening Reminder
                  </span>
                </div>
                <label className='relative inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    checked={settings.notificationPreferences.evening}
                    onChange={(e) => updateNotificationPref('evening', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#d4bfa0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#e8d8c4] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#C97D60] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgba(201,169,110,0.3)] dark:border-[#2a1d10] dark:bg-[#231a10] dark:peer-focus:ring-[rgba(201,169,110,0.3)]"></div>
                </label>
              </div>
              {settings.notificationPreferences.evening && (
                <div className='mt-3'>
                  <label className='mb-1 block text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    Time
                  </label>
                  <input
                    type='time'
                    value={settings.notificationPreferences.eveningTime || '19:00'}
                    onChange={(e) => updateNotificationPref('eveningTime', e.target.value)}
                    className='w-full rounded-lg border border-[#e8d8c4] px-3 py-2 text-[#1a1108] focus:border-transparent focus:ring-2 focus:ring-[#C9A96E]/50 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white'
                  />
                </div>
              )}
            </div>

            {/* Milestone Notifications */}
            <div className='mb-4 rounded-lg border border-[#e8d8c4] p-4 dark:border-[#2a1d10]'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-green-500' />
                  <div>
                    <span className='font-medium text-[#1a1108] dark:text-[#F5EFE6]'>
                      Milestone Celebrations
                    </span>
                    <p className='text-xs text-gray-500 dark:text-[#9E8B76]'>
                      Get notified when you reach streak milestones
                    </p>
                  </div>
                </div>
                <label className='relative inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    checked={settings.notificationPreferences.milestones}
                    onChange={(e) => updateNotificationPref('milestones', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="peer h-6 w-11 rounded-full bg-[#d4bfa0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#e8d8c4] after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#C97D60] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgba(201,169,110,0.3)] dark:border-[#2a1d10] dark:bg-[#231a10] dark:peer-focus:ring-[rgba(201,169,110,0.3)]"></div>
                </label>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className='rounded-lg border border-[#e8d8c4] p-4 dark:border-[#2a1d10]'>
              <h4 className='mb-3 font-medium text-[#1a1108] dark:text-[#F5EFE6]'>
                Quiet Hours
              </h4>
              <p className='mb-4 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                Set times when you don't want to receive notifications
              </p>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='mb-1 block text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    Start (e.g., 22:00)
                  </label>
                  <input
                    type='time'
                    value={settings.notificationPreferences.quietHoursStart || '22:00'}
                    onChange={(e) => updateNotificationPref('quietHoursStart', e.target.value)}
                    className='w-full rounded-lg border border-[#e8d8c4] px-3 py-2 text-[#1a1108] focus:border-transparent focus:ring-2 focus:ring-[#C9A96E]/50 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    End (e.g., 07:00)
                  </label>
                  <input
                    type='time'
                    value={settings.notificationPreferences.quietHoursEnd || '07:00'}
                    onChange={(e) => updateNotificationPref('quietHoursEnd', e.target.value)}
                    className='w-full rounded-lg border border-[#e8d8c4] px-3 py-2 text-[#1a1108] focus:border-transparent focus:ring-2 focus:ring-[#C9A96E]/50 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white'
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Preferred Categories Section */}
          <section className='rounded-xl border border-[#e8d8c4] bg-[#faf8f4] p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <h2 className='mb-2 text-xl font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>
              Preferred Categories
            </h2>
            <p className='mb-4 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
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
                        ? impactTagColors[tag] + ' ring-2 ring-[#C9A96E]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1c1510] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
                    }`}
                  >
                    {impactTagLabels[tag]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Invite Friends Section */}
          <section className='rounded-xl border border-[#e8d8c4] bg-[#faf8f4] p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <div className='mb-4 flex items-center gap-2'>
              <UserPlus className='h-5 w-5 text-[#6b5744] dark:text-[#9E8B76]' />
              <h2 className='font-display text-xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
                Invite Friends
              </h2>
            </div>
            <p className='mb-4 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
              Share Buzzwin with your friends and help grow our community of do-gooders!
            </p>
            <button
              onClick={openInviteModal}
              className='w-full rounded-lg border-2 border-dashed border-[rgba(201,169,110,0.4)] bg-[rgba(201,169,110,0.06)] px-6 py-4 font-semibold text-[#8a6520] transition-colors hover:border-[rgba(201,169,110,0.6)] hover:bg-[rgba(201,169,110,0.1)] dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.05)] dark:text-[#C9A96E] dark:hover:border-[rgba(201,169,110,0.5)] dark:hover:bg-[rgba(201,169,110,0.09)]'
            >
              <span className='flex items-center justify-center gap-2'>
                <Mail className='h-5 w-5' />
                Send Email Invitation
              </span>
            </button>
          </section>

          {/* Save Button */}
          <div className='sticky bottom-0 flex gap-3 rounded-xl border border-gray-200 bg-[#faf8f4] p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <button
              onClick={handleSave}
              disabled={saving}
              className='flex flex-1 items-center justify-center gap-2 rounded-full bg-[#C97D60] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B56540] disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Save className='h-5 w-5' />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Invite Friend Modal */}
        <InviteFriendModal
          open={inviteModalOpen}
          closeModal={closeInviteModal}
        />
      </div>
    </MainContainer>
  );
}

SettingsPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout redirectUrl='/login'>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);

