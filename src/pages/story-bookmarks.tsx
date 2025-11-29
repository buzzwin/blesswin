import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bookmark, BookmarkCheck, FolderPlus, ExternalLink, Calendar, MapPin, Sparkles, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { query, getDocs, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { userStoryBookmarksCollection, userStoryCollectionsCollection } from '@lib/firebase/collections';
import { toast } from 'react-hot-toast';
import { Modal } from '@components/modal/modal';
import type { StoryBookmark, StoryCollection } from '@lib/types/story-bookmark';
import type { ReactElement, ReactNode } from 'react';

const categoryColors = {
  community: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  environment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  education: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'social-justice': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  innovation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
};

const categoryLabels = {
  community: 'Community',
  environment: 'Environment',
  education: 'Education',
  health: 'Health',
  'social-justice': 'Social Justice',
  innovation: 'Innovation'
};

const formatDate = (dateString?: string | null): string | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    if (date > oneYearFromNow) return null;
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    if (date < fiveYearsAgo) return null;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return null;
  }
};

const isValidUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function StoryBookmarksPage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<StoryBookmark[]>([]);
  const [collections, setCollections] = useState<StoryCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'collections'>('bookmarks');
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<StoryCollection | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (user?.id) {
      void fetchBookmarks();
      void fetchCollections();
    }
  }, [user?.id]);

  const fetchBookmarks = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const bookmarksRef = userStoryBookmarksCollection(user.id);
      const snapshot = await getDocs(query(bookmarksRef, orderBy('createdAt', 'desc')));
      const bookmarksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryBookmark));
      setBookmarks(bookmarksData);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      const collectionsRef = userStoryCollectionsCollection(user.id);
      const snapshot = await getDocs(query(collectionsRef, orderBy('createdAt', 'desc')));
      const collectionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryCollection));
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string): Promise<void> => {
    if (!user?.id) return;
    
    try {
      const bookmarksRef = userStoryBookmarksCollection(user.id);
      await deleteDoc(doc(bookmarksRef, bookmarkId));
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      toast.success('Bookmark removed');
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const handleCreateCollection = async (): Promise<void> => {
    if (!user?.id || !collectionName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    try {
      const collectionsRef = userStoryCollectionsCollection(user.id);
      const collectionData: Record<string, unknown> = {
        userId: user.id,
        name: collectionName.trim(),
        isPublic,
        storyIds: [],
        createdAt: serverTimestamp()
      };
      
      // Only include description if it has a value
      if (collectionDescription.trim()) {
        collectionData.description = collectionDescription.trim();
      }
      
      await addDoc(collectionsRef, collectionData as any);

      toast.success('Collection created!');
      setCollectionModalOpen(false);
      setCollectionName('');
      setCollectionDescription('');
      setIsPublic(false);
      void fetchCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };

  const handleEditCollection = async (): Promise<void> => {
    if (!user?.id || !editingCollection || !collectionName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    try {
      const collectionsRef = userStoryCollectionsCollection(user.id);
      const updateData: Record<string, unknown> = {
        name: collectionName.trim(),
        isPublic,
        updatedAt: serverTimestamp()
      };
      
      // Only include description if it has a value
      if (collectionDescription.trim()) {
        updateData.description = collectionDescription.trim();
      }
      
      await updateDoc(doc(collectionsRef, editingCollection.id), updateData as any);

      toast.success('Collection updated!');
      setCollectionModalOpen(false);
      setEditingCollection(null);
      setCollectionName('');
      setCollectionDescription('');
      setIsPublic(false);
      void fetchCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Failed to update collection');
    }
  };

  const handleDeleteCollection = async (collectionId: string): Promise<void> => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to delete this collection? This will not delete the bookmarked stories.')) {
      return;
    }

    try {
      const collectionsRef = userStoryCollectionsCollection(user.id);
      await deleteDoc(doc(collectionsRef, collectionId));
      setCollections(collections.filter(c => c.id !== collectionId));
      toast.success('Collection deleted');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const openEditCollection = (collection: StoryCollection): void => {
    setEditingCollection(collection);
    setCollectionName(collection.name);
    setCollectionDescription(collection.description || '');
    setIsPublic(collection.isPublic);
    setCollectionModalOpen(true);
  };

  if (!user) {
    return (
      <MainContainer>
        <SEO title='My Story Bookmarks' />
        <div className='flex min-h-[60vh] items-center justify-center'>
          <div className='text-center'>
            <Bookmark className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>Sign In Required</h2>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>Please sign in to view your bookmarked stories.</p>
            <button
              onClick={() => void router.push('/login')}
              className='rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700'
            >
              Sign In
            </button>
          </div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO title='My Story Bookmarks' />
      <MainHeader title='My Story Bookmarks' />
      
      {/* Tabs */}
      <div className='mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700'>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 font-semibold transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <span className='flex items-center gap-2'>
            <Bookmark className='h-4 w-4' />
            Bookmarks ({bookmarks.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`pb-3 font-semibold transition-colors ${
            activeTab === 'collections'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <span className='flex items-center gap-2'>
            <FolderPlus className='h-4 w-4' />
            Collections ({collections.length})
          </span>
        </button>
      </div>

      {loading ? (
        <Loading className='mt-5' />
      ) : activeTab === 'bookmarks' ? (
        <>
          {bookmarks.length === 0 ? (
            <StatsEmpty
              title='No bookmarked stories yet'
              description='Start bookmarking inspiring stories to save them here for later!'
              imageData={{ 
                src: '/assets/no-buzz.png', 
                alt: 'No bookmarks'
              }}
            />
          ) : (
            <div className='space-y-4'>
              {bookmarks.map((bookmark) => {
                const categoryColor = categoryColors[bookmark.storyCategory] || categoryColors.community;
                const categoryLabel = categoryLabels[bookmark.storyCategory] || 'Community';
                const formattedDate = formatDate(bookmark.storyDate);
                const hasValidUrl = isValidUrl(bookmark.storyUrl);

                return (
                  <article
                    key={bookmark.id}
                    className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'
                  >
                    <div className='mb-3 flex items-start justify-between gap-3'>
                      <div className='flex-1'>
                        <div className='mb-2 flex flex-wrap items-center gap-2'>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}>
                            {categoryLabel}
                          </span>
                          {bookmark.storyLocation && (
                            <span className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400'>
                              <MapPin className='h-3 w-3' />
                              {bookmark.storyLocation}
                            </span>
                          )}
                          {formattedDate && (
                            <span className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400'>
                              <Calendar className='h-3 w-3' />
                              {formattedDate}
                            </span>
                          )}
                        </div>
                        
                        {hasValidUrl ? (
                          <a
                            href={bookmark.storyUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='block transition-opacity hover:opacity-90'
                          >
                            <h3 className='mb-2 text-lg font-bold leading-tight text-gray-900 dark:text-white'>
                              {bookmark.storyTitle}
                            </h3>
                          </a>
                        ) : (
                          <h3 className='mb-2 text-lg font-bold leading-tight text-gray-900 dark:text-white'>
                            {bookmark.storyTitle}
                          </h3>
                        )}
                        
                        <p className='mb-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300'>
                          {bookmark.storyDescription}
                        </p>
                        
                        {bookmark.storySource && (
                          <p className='mb-2 text-xs text-gray-500 dark:text-gray-400'>
                            Source: <span className='font-medium'>{bookmark.storySource}</span>
                          </p>
                        )}

                        {bookmark.notes && (
                          <div className='mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20'>
                            <p className='text-sm text-purple-800 dark:text-purple-200'>
                              <span className='font-semibold'>Your notes:</span> {bookmark.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => bookmark.id && void handleDeleteBookmark(bookmark.id)}
                        className='rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400'
                        title='Remove bookmark'
                      >
                        <X className='h-5 w-5' />
                      </button>
                    </div>

                    {hasValidUrl && (
                      <a
                        href={bookmark.storyUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                      >
                        Read Full Story
                        <ExternalLink className='h-4 w-4' />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className='mb-4 flex justify-end'>
            <button
              onClick={() => {
                setEditingCollection(null);
                setCollectionName('');
                setCollectionDescription('');
                setIsPublic(false);
                setCollectionModalOpen(true);
              }}
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
            >
              <FolderPlus className='h-4 w-4' />
              Create Collection
            </button>
          </div>

          {collections.length === 0 ? (
            <StatsEmpty
              title='No collections yet'
              description='Create collections to organize your bookmarked stories by theme or topic!'
              imageData={{ 
                src: '/assets/no-buzz.png', 
                alt: 'No collections'
              }}
            />
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'
                >
                  <div className='mb-3 flex items-start justify-between gap-2'>
                    <div className='flex-1'>
                      <h3 className='mb-1 text-lg font-bold text-gray-900 dark:text-white'>
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                          {collection.description}
                        </p>
                      )}
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {collection.storyIds.length} {collection.storyIds.length === 1 ? 'story' : 'stories'}
                        </span>
                        {collection.isPublic && (
                          <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300'>
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => openEditCollection(collection)}
                        className='rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400'
                        title='Edit collection'
                      >
                        <Edit2 className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => collection.id && void handleDeleteCollection(collection.id)}
                        className='rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400'
                        title='Delete collection'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Collection Modal */}
      <Modal
        open={collectionModalOpen}
        closeModal={() => {
          setCollectionModalOpen(false);
          setEditingCollection(null);
          setCollectionName('');
          setCollectionDescription('');
          setIsPublic(false);
        }}
        modalClassName='max-w-md'
      >
        <div className='p-6'>
          <h2 className='mb-4 text-xl font-bold text-gray-900 dark:text-white'>
            {editingCollection ? 'Edit Collection' : 'Create Collection'}
          </h2>
          
          <div className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Collection Name *
              </label>
              <input
                type='text'
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder='e.g., Environmental Wins'
                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Description (optional)
              </label>
              <textarea
                value={collectionDescription}
                onChange={(e) => setCollectionDescription(e.target.value)}
                placeholder='Add a description for this collection...'
                rows={3}
                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
              />
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='isPublic'
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500'
              />
              <label htmlFor='isPublic' className='text-sm text-gray-700 dark:text-gray-300'>
                Make this collection public
              </label>
            </div>
          </div>

          <div className='mt-6 flex gap-3'>
            <button
              onClick={editingCollection ? handleEditCollection : handleCreateCollection}
              className='flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
            >
              {editingCollection ? 'Update Collection' : 'Create Collection'}
            </button>
            <button
              onClick={() => {
                setCollectionModalOpen(false);
                setEditingCollection(null);
                setCollectionName('');
                setCollectionDescription('');
                setIsPublic(false);
              }}
              className='rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </MainContainer>
  );
}

StoryBookmarksPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);

