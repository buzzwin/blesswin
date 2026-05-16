import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Repeat, Users } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { impactMomentsCollection, usersCollection, ritualsCollection } from '@lib/firebase/collections';
import { Loading } from '@components/ui/loading';
import { UserAvatar } from '@components/user/user-avatar';
import { cn } from '@lib/utils';
import { 
  impactTagLabels, 
  impactTagColors, 
  effortLevelLabels, 
  effortLevelIcons,
  type ImpactTag,
  type EffortLevel,
  type ImpactMomentWithUser
} from '@lib/types/impact-moment';
import type { RitualTimeOfDay, RitualDefinition } from '@lib/types/ritual';

export default function CreateRitualFromMomentPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { momentId } = router.query;
  
  const [moment, setMoment] = useState<ImpactMomentWithUser | null>(null);
  const [existingRitual, setExistingRitual] = useState<RitualDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedTimeOfDay, setSuggestedTimeOfDay] = useState<RitualTimeOfDay>('anytime');
  const [durationEstimate, setDurationEstimate] = useState('5 minutes');

  // Redirect to login if not authenticated, preserving the momentId
  useEffect(() => {
    if (!authLoading && !user && momentId) {
      void router.push(`/login?redirect=/rituals/create-from-moment/${momentId}`);
    }
  }, [user, authLoading, momentId, router]);

  // Fetch moment data
  useEffect(() => {
    if (!momentId || typeof momentId !== 'string' || !user) return;

    const fetchMoment = async (): Promise<void> => {
      try {
        setLoading(true);
        const momentDoc = await getDoc(doc(impactMomentsCollection, momentId));

        if (!momentDoc.exists()) {
          toast.error('Impact moment not found');
          void router.push('/');
          return;
        }

        const momentData = { id: momentDoc.id, ...momentDoc.data() };
        const userDoc = await getDoc(doc(usersCollection, momentData.createdBy));
        const userData = userDoc.exists() ? userDoc.data() : null;

        const momentWithUser: ImpactMomentWithUser = {
          ...momentData,
          user: userData
            ? {
                id: userData.id,
                name: userData.name,
                username: userData.username,
                photoURL: userData.photoURL,
                verified: userData.verified ?? false
              }
            : {
                id: momentData.createdBy,
                name: 'Unknown User',
                username: 'unknown',
                photoURL: '',
                verified: false
              }
        } as ImpactMomentWithUser;

        setMoment(momentWithUser);
        
        // If moment was created from a ritual, join that ritual directly
        if (momentData.ritualId) {
          try {
            const ritualDoc = await getDoc(doc(ritualsCollection, momentData.ritualId));
            if (ritualDoc.exists()) {
              const ritualData = ritualDoc.data();
              const hasJoined = (ritualData.joinedByUsers || []).includes(user.id);
              
              setExistingRitual({
                id: ritualDoc.id,
                ...ritualData,
                hasJoined // Track if current user already joined
              } as RitualDefinition & { hasJoined?: boolean });
            } else {
              // Ritual not found - might be in user's custom_rituals or deleted
              // Show message that ritual is not available
              toast.error('The ritual this moment came from is no longer available');
            }
          } catch (error) {
            console.error('Error fetching ritual:', error);
            // Fall through to check for ritual created from moment
          }
        }
        
        // If moment doesn't have ritualId, check if a ritual was created from this moment
        if (!existingRitual) {
          const existingRitualQuery = query(
            ritualsCollection,
            where('createdFromMomentId', '==', momentId)
          );
          const existingRitualsSnapshot = await getDocs(existingRitualQuery);
          
          if (!existingRitualsSnapshot.empty) {
            // Ritual exists - user will join it
            const existingRitualDoc = existingRitualsSnapshot.docs[0];
            const ritualData = existingRitualDoc.data();
            const hasJoined = (ritualData.joinedByUsers || []).includes(user.id);
            
            setExistingRitual({
              id: existingRitualDoc.id,
              ...ritualData,
              hasJoined // Track if current user already joined
            } as RitualDefinition & { hasJoined?: boolean });
          } else {
            // No existing ritual - pre-fill form for creation
            const momentText = momentData.text || '';
            setTitle(momentText.substring(0, 50) || 'New Ritual');
            setDescription(momentText || 'A ritual inspired by an impact moment');
          }
        }
      } catch (error) {
        console.error('Error fetching moment:', error);
        toast.error('Failed to load impact moment');
        void router.push('/');
      } finally {
        setLoading(false);
      }
    };

    void fetchMoment();
  }, [momentId, user, router]);

  const handleJoinRitual = async (): Promise<void> => {
    if (!user?.id || !existingRitual?.id) {
      toast.error('Unable to join ritual');
      return;
    }

    setJoining(true);

    try {
      const response = await fetch('/api/rituals/create-from-moment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          momentId: moment?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join ritual');
      }

      const data = await response.json();
      
      toast.success(`You joined this ritual! ${existingRitual.joinedByUsers?.length || 0} people are doing this 🌱`);
      void router.push('/rituals');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join ritual';
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim()) {
      toast.error('Please enter a title for your ritual');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description for your ritual');
      return;
    }

    if (!user?.id || !moment?.id) {
      toast.error('Please sign in to create a ritual');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/rituals/create-from-moment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          momentId: moment.id,
          title: title.trim(),
          description: description.trim(),
          suggestedTimeOfDay,
          durationEstimate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ritual');
      }

      const data = await response.json();
      
      if (data.joined) {
        toast.success('You joined this ritual! 🌱');
      } else {
        toast.success('Ritual created! You can now do this regularly 🌱');
      }
      void router.push('/rituals');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create ritual';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const timeOfDayOptions: { value: RitualTimeOfDay; label: string }[] = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'anytime', label: 'Anytime' }
  ];

  if (authLoading || loading) {
    return (
      <>
        <SEO title='Create Ritual from Action - Buzzwin' />
        <MainHeader title='Create Ritual' />
        <MainContainer>
          <Loading className='mt-5' />
        </MainContainer>
      </>
    );
  }

  if (!moment) {
    return (
      <>
        <SEO title='Action Not Found - Buzzwin' />
        <MainHeader title='Create Ritual' />
        <MainContainer>
          <div className='rounded-lg border border-gray-200 bg-[#faf8f4] p-8 text-center dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <p className='mb-4 text-gray-600 dark:text-[#9E8B76]'>
              Action not found
            </p>
            <Link href='/'>
              <a className='inline-flex items-center gap-2 text-[#C9A96E] hover:text-[#8a6520] dark:text-[#C9A96E]'>
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </a>
            </Link>
          </div>
        </MainContainer>
      </>
    );
  }

  return (
    <>
      <SEO title='Create Ritual from Action - Buzzwin' />
      <MainHeader title='Create Ritual' />
      <MainContainer>
        <div className='mx-auto max-w-2xl space-y-6'>
          {/* Back Button */}
          <Link href={`/impact/${moment.id}`}>
            <a className='inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-[#9E8B76] dark:hover:text-white'>
              <ArrowLeft className='h-4 w-4' />
              Back to Action
            </a>
          </Link>

          {/* Header */}
          <div className='rounded-2xl border-2 border-[rgba(201,169,110,0.3)] bg-gradient-to-br from-purple-50 to-pink-50 p-8 text-center dark:border-[rgba(201,169,110,0.25)] dark:from-purple-900/20 dark:to-pink-900/20'>
            {existingRitual ? (
              <>
                <h1 className='mb-3 text-3xl font-bold text-gray-900 dark:text-white'>
                  Join This Ritual
                </h1>
                <p className='mb-4 text-lg text-gray-700 dark:text-[#C4B5A0]'>
                  {moment.fromDailyRitual 
                    ? 'This action came from a ritual. Join others who are doing this regularly!'
                    : `${existingRitual.joinedByUsers?.length || 0} ${existingRitual.joinedByUsers?.length === 1 ? 'person has' : 'people have'} already joined this ritual`
                  }
                </p>
                {existingRitual.joinedByUsers && existingRitual.joinedByUsers.length > 0 && (
                  <div className='flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-[#9E8B76]'>
                    <Users className='h-4 w-4' />
                    <span>Be part of a growing community doing this regularly</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 className='mb-3 text-3xl font-bold text-gray-900 dark:text-white'>
                  Make This Recurring
                </h1>
                <p className='text-lg text-gray-700 dark:text-[#C4B5A0]'>
                  Create a ritual to do this regularly
                </p>
              </>
            )}
          </div>

          {/* Moment Preview */}
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <div className='flex items-start gap-3'>
              <UserAvatar
                src={moment.user.photoURL ?? ''}
                alt={moment.user.name ?? 'User'}
                username={moment.user.username ?? 'user'}
              />
              <div className='flex-1'>
                <p className='text-sm text-gray-700 dark:text-[#C4B5A0]'>
                  {moment.text}
                </p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {moment.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        impactTagColors[tag]
                      )}
                    >
                      {impactTagLabels[tag]}
                    </span>
                  ))}
                </div>
                <div className='mt-3 flex items-center gap-2'>
                  <span className='text-lg'>{effortLevelIcons[moment.effortLevel]}</span>
                  <span className='text-sm font-medium text-gray-600 dark:text-[#9E8B76]'>
                    {effortLevelLabels[moment.effortLevel]} Effort
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Ritual Info */}
          {existingRitual && (
            <div className='rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20'>
              {(existingRitual as any).hasJoined && (
                <div className='mb-4 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300'>
                  ✓ You've already joined this ritual!
                </div>
              )}
              <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                {existingRitual.title}
              </h2>
              <p className='mb-4 text-gray-700 dark:text-[#C4B5A0]'>
                {existingRitual.description}
              </p>
              <div className='mb-4 flex flex-wrap gap-2'>
                {existingRitual.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      impactTagColors[tag]
                    )}
                  >
                    {impactTagLabels[tag]}
                  </span>
                ))}
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-[#9E8B76]'>
                  <span>{existingRitual.suggestedTimeOfDay}</span>
                  <span>•</span>
                  <span>{existingRitual.durationEstimate}</span>
                </div>
                <div className='flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400'>
                  <Users className='h-4 w-4' />
                  <span>{existingRitual.joinedByUsers?.length || 0} {existingRitual.joinedByUsers?.length === 1 ? 'person has' : 'people have'} joined</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields - Only show if no existing ritual */}
          {!existingRitual && (
          <div className='space-y-6 rounded-lg border border-gray-200 bg-[#faf8f4] p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            {/* Title */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
                Ritual Title
              </label>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter ritual title...'
                className={cn(
                  'w-full rounded-lg border border-gray-300 bg-gray-50 p-3',
                  'text-gray-900 placeholder-gray-500',
                  'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder-gray-400',
                  'focus:border-[#C9A96E] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50/20',
                  'transition-colors'
                )}
                maxLength={100}
                disabled={creating}
              />
            </div>

            {/* Description */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Describe your ritual...'
                className={cn(
                  'w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3',
                  'text-gray-900 placeholder-gray-500',
                  'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder-gray-400',
                  'focus:border-[#C9A96E] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50/20',
                  'transition-colors'
                )}
                rows={4}
                disabled={creating}
              />
            </div>

            {/* Time of Day */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
                Suggested Time
              </label>
              <div className='grid grid-cols-4 gap-2'>
                {timeOfDayOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSuggestedTimeOfDay(option.value)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      suggestedTimeOfDay === option.value
                        ? 'border-[#C9A96E] bg-[rgba(201,169,110,0.06)] text-[#8a6520] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C9A96E]'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
                    )}
                    disabled={creating}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
                Duration Estimate
              </label>
              <input
                type='text'
                value={durationEstimate}
                onChange={(e) => setDurationEstimate(e.target.value)}
                placeholder='e.g., 5 minutes'
                className={cn(
                  'w-full rounded-lg border border-gray-300 bg-gray-50 p-3',
                  'text-gray-900 placeholder-gray-500',
                  'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder-gray-400',
                  'focus:border-[#C9A96E] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50/20',
                  'transition-colors'
                )}
                disabled={creating}
              />
            </div>
          </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-3'>
            <Link href={`/impact/${moment.id}`}>
              <a
                className={cn(
                  'rounded-full px-6 py-3 text-sm font-semibold',
                  'text-gray-700 hover:bg-gray-100 dark:text-[#C4B5A0] dark:hover:bg-[#231a10]',
                  (creating || joining) && 'opacity-50 cursor-not-allowed'
                )}
              >
                Cancel
              </a>
            </Link>
            {existingRitual ? (
              (existingRitual as any).hasJoined ? (
                <Link href='/rituals'>
                  <a className='rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 flex items-center gap-2'>
                    <span>✓</span>
                    View My Rituals
                  </a>
                </Link>
              ) : (
                <button
                  onClick={handleJoinRitual}
                  disabled={joining}
                  className={cn(
                    'rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700',
                    'flex items-center gap-2',
                    joining && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {joining ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Joining...
                    </>
                  ) : (
                    <>
                      <span>🌱</span>
                      Join Ritual
                    </>
                  )}
                </button>
              )
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !description.trim() || creating}
                className={cn(
                  'rounded-full bg-[#C97D60] px-6 py-3 text-sm font-semibold text-white hover:bg-[#B56540]',
                  'flex items-center gap-2',
                  (!title.trim() || !description.trim() || creating) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {creating ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <Repeat className='h-4 w-4' />
                    Create Ritual
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </MainContainer>
    </>
  );
}

