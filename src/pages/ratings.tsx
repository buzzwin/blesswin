import { useEffect, useState } from 'react';
import {
  Heart,
  X,
  Meh,
  Trash2,
  Film,
  MessageSquare,
  Star,
  User,
  LogOut,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import {
  getUserReviews,
  deleteReview,
  getAllReviews,
  getUserRatings,
  getRatingStats,
  deleteRating,
  getRecentRatings,
  createRating
} from '@lib/firebase/utils/review';
import { useAuth } from '@lib/context/auth-context';
import { getTMDBImageUrl , cn } from '@lib/utils';
import { FallbackImage } from '@components/ui/fallback-image';
import { Loading } from '@components/ui/loading';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent } from '@components/ui/card';
import { SEO } from '@components/common/seo';
import LogoIcon from '@components/ui/logo';
import { UpdateUsername } from '@components/home/update-username';
import { ReviewModal } from '@components/modal/review-modal';
import type { ReviewWithUser, RatingType } from '@lib/types/review';
import type { ReactElement, ReactNode } from 'react';

interface RatingStats {
  love: number;
  hate: number;
  meh: number;
  total: number;
}

export default function RatingsPage(): JSX.Element {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [ratings, setRatings] = useState<ReviewWithUser[]>([]);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [allRatings, setAllRatings] = useState<ReviewWithUser[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewWithUser[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    love: 0,
    hate: 0,
    meh: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<
    'all' | 'love' | 'hate' | 'meh'
  >('all');
  const [addingRating, setAddingRating] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<ReviewWithUser | null>(null);

  const handleSignIn = (): void => {
    void router.push('/login');
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      void router.push('/');
    } catch (error) {
      // console.error('Logout error:', error);
    }
  };

  const handleAddRating = async (
    reviewId: string,
    rating: RatingType
  ): Promise<void> => {
    if (!user) {
      toast.error('Please sign in to add ratings');
      return;
    }

    try {
      setAddingRating(reviewId);

      // Find the review to get the media details
      const review =
        reviews.find((r) => r.id === reviewId) ||
        allReviews.find((r) => r.id === reviewId);
      if (!review) {
        toast.error('Review not found');
        return;
      }

      // Create the rating using the new consolidated approach
      const newRating = await createRating({
        tmdbId: review.tmdbId,
        userId: user.id,
        title: review.title,
        mediaType: review.mediaType,
        rating,
        posterPath: review.posterPath,
        overview: review.overview || '',
        releaseDate: review.releaseDate || '',
        voteAverage: review.voteAverage || 0
      });

      // Update the state directly instead of refetching
      setRatings((prev) => [newRating, ...prev]);
      setAllRatings((prev) => [newRating, ...prev]);

      // Update stats
      const updatedStats = await getRatingStats(user.id);
      setStats(updatedStats);

      toast.success(`Rated "${review.title}" as ${rating}!`);
    } catch (error) {
      toast.error('Failed to add rating');
    } finally {
      setAddingRating(null);
    }
  };

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch all ratings and reviews (for both logged-in and anonymous users)
      const [allRatingsData, allReviewsData] = await Promise.all([
        getRecentRatings(100), // Get recent 100 ratings
        getAllReviews(100) // Get recent 100 reviews
      ]);

      setAllRatings(allRatingsData);
      setAllReviews(allReviewsData);

      // If user is logged in, also fetch their personal ratings and reviews
      if (user) {
        try {
          const [userRatings, userReviews] = await Promise.all([
            getUserRatings(user.id),
            getUserReviews(user.id)
          ]);

          setRatings(userRatings);
          setReviews(userReviews);

          // Get user stats
          const ratingStats = await getRatingStats(user.id);
          setStats(ratingStats);
        } catch (userDataError) {
          // console.error('Error fetching user data:', userDataError);
          // Don't fail the whole request if user data fails
        }
      } else {
        // For anonymous users, set empty arrays for user data
        setRatings([]);
        setReviews([]);
        setStats({ love: 0, hate: 0, meh: 0, total: 0 });
      }
    } catch (err) {
      // console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId: string): Promise<void> => {
    if (!user) return;

    try {
      await deleteRating(ratingId, user.id);

      // Update both user-specific and all ratings arrays
      setRatings((prev) => prev.filter((rating) => rating.id !== ratingId));
      setAllRatings((prev) => prev.filter((rating) => rating.id !== ratingId));

      // Update stats
      const updatedStats = await getRatingStats(user.id);
      setStats(updatedStats);
    } catch (err) {
      // console.error('Error deleting rating:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete rating');
    }
  };

  const handleDeleteReview = async (reviewId: string): Promise<void> => {
    if (!user) return;

    try {
      await deleteReview(reviewId, user.id);

      // Update both user-specific and all reviews arrays
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      setAllReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (err) {
      // console.error('Error deleting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const handleWriteReview = (rating: ReviewWithUser): void => {
    // Check if there's an existing review for this rating
    const existingReview = findExistingReview(rating);

    // Convert rating to viewingActivity format for the review modal
    const viewingActivity = {
      tmdbId: String(rating.tmdbId),
      title: rating.title,
      mediaType: rating.mediaType,
      poster_path: rating.posterPath,
      overview: rating.overview || '',
      releaseDate: rating.releaseDate || '',
      status: 'watching',
      username: user?.username || '',
      photoURL: user?.photoURL || ''
    };

    setReviewToEdit(existingReview || rating);
    setIsReviewModalOpen(true);
  };

  const handleReviewAdded = (newReview: ReviewWithUser): void => {
    // Check if this is an update to an existing review
    const existingReview = findExistingReview(newReview);

    if (existingReview) {
      // Update existing review in the arrays
      setReviews((prev) =>
        prev.map((review) =>
          review.id === existingReview.id ? newReview : review
        )
      );
      setAllReviews((prev) =>
        prev.map((review) =>
          review.id === existingReview.id ? newReview : review
        )
      );
      toast.success('Review updated successfully!');
    } else {
      // Add new review to the arrays
      setReviews((prev) => [newReview, ...prev]);
      setAllReviews((prev) => [newReview, ...prev]);
      toast.success('Review added successfully!');
    }

    setIsReviewModalOpen(false);
    setReviewToEdit(null);
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors((prev) => new Set(prev).add(imageUrl));
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'love':
        return <Heart className='w-5 h-5 text-green-600 dark:text-green-400' />;
      case 'hate':
        return <X className='w-5 h-5 text-red-600 dark:text-red-400' />;
      case 'meh':
        return <Meh className='w-5 h-5 text-yellow-600 dark:text-yellow-400' />;
      default:
        return <Star className='w-5 h-5 text-gray-600 dark:text-gray-400' />;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'love':
        return 'border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-900/20';
      case 'hate':
        return 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/20';
      case 'meh':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800/30 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 bg-white dark:border-gray-800/30 dark:bg-gray-800';
    }
  };

  // Helper function to check if a review has a corresponding rating
  const hasRating = (review: ReviewWithUser): boolean => {
    // Since ratings and reviews are now in the same collection,
    // a review with a rating will have both review text and a rating
    return !!(review.review && review.review.trim() !== '' && review.rating);
  };

  // Helper function to check if a rating has a review
  const hasReview = (rating: ReviewWithUser): boolean => {
    // Since ratings and reviews are now in the same collection,
    // a rating with a review will have both review text and a rating
    return !!(rating.review && rating.review.trim() !== '' && rating.rating);
  };

  // Helper function to find existing review for a rating
  const findExistingReview = (
    rating: ReviewWithUser
  ): ReviewWithUser | null => {
    const currentReviews = user && showOnlyMine ? reviews : allReviews;
    return (
      currentReviews.find(
        (review) =>
          review.tmdbId === rating.tmdbId &&
          review.userId === rating.userId &&
          review.review &&
          review.review.trim() !== ''
      ) || null
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white dark:to-amber-950/10 to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
        <SEO title='My Ratings - Buzzwin' />
        <div className='flex justify-center items-center min-h-screen'>
          <div className='text-center'>
            <Loading className='mx-auto mb-4 w-8 h-8' />
            <p className='text-gray-600 dark:text-gray-400'>
              Loading your ratings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white dark:to-amber-950/10 to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
        <SEO title='My Ratings - Buzzwin' />
        <div className='flex justify-center items-center min-h-screen'>
          <div className='text-center'>
            <div className='flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full dark:bg-red-900/30'>
              <X className='w-8 h-8 text-red-600 dark:text-red-400' />
            </div>
            <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
              Error Loading Ratings
            </h2>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>{error}</p>
            <Button onClick={() => void fetchData()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine what data to use based on toggle
  const currentRatings = user && showOnlyMine ? ratings : allRatings;
  const currentReviews = user && showOnlyMine ? reviews : allReviews;

  // Filter ratings based on rating filter
  const filteredRatings =
    ratingFilter === 'all'
      ? currentRatings
      : currentRatings.filter((rating) => rating.rating === ratingFilter);

  // Get reviews that don't have ratings (for the "Add Rating" feature)
  const reviewsWithoutRatings = currentReviews.filter(
    (review) => !hasRating(review)
  );

  // Combine ratings and reviews, sort by date
  const ratingItems = filteredRatings.map((rating) => ({
    type: 'rating' as const,
    data: rating,
    date: rating.createdAt.toDate()
  }));

  const reviewItems = currentReviews.map((review) => ({
    type: 'review' as const,
    data: review,
    date: review.createdAt.toDate()
  }));

  const allItems = [...ratingItems, ...reviewItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white dark:to-amber-950/10 to-amber-50/30 dark:from-gray-900 dark:via-gray-900'>
      <SEO title='My Ratings - Buzzwin' />

      {/* Professional Header - Desktop Only */}
      <header className='hidden sticky top-0 z-50 border-b border-gray-200 backdrop-blur-xl bg-white/95 dark:border-gray-800 dark:bg-gray-900/95 md:block'>
        <div className='px-6 py-3 mx-auto max-w-7xl'>
          <div className='flex justify-between items-center mb-4'>
            <div className='flex gap-4 items-center'>
              <button
                onClick={() => router.push('/')}
                className='flex gap-4 items-center transition-opacity hover:opacity-80'
              >
                <div className='flex justify-center items-center w-16 h-16'>
                  <LogoIcon className='w-16 h-16' />
                </div>
                <div>
                  <h1 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
                    Buzzwin
                  </h1>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                    What will you watch next?
                  </p>
                </div>
              </button>
            </div>

            {/* Quick Actions - Integrated in Header */}
            <div className='flex gap-3 items-center'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => router.push('/')}
                className='px-4 py-2 text-sm font-medium text-blue-700 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20'
              >
                <BarChart3 className='mr-2 w-4 h-4' />
                Home
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => router.push('/trends')}
                className='px-4 py-2 text-sm font-medium text-purple-700 border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
              >
                <TrendingUp className='mr-2 w-4 h-4' />
                Trending
              </Button>
            </div>

            <div className='flex gap-4 items-center'>
              <UpdateUsername />

              {!user ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleSignIn}
                  className='px-6 py-2 font-medium text-amber-700 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
                >
                  Sign In
                </Button>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLogout}
                  className='px-6 py-2 font-medium text-amber-700 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20'
                >
                  <LogOut className='mr-2 w-4 h-4' />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1'>
        <div className='px-4 py-8 mx-auto max-w-4xl'>
          <div className='mb-8'>
            <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
              My Ratings & Reviews
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Your personalized collection of rated shows and movies with
              reviews
            </p>
          </div>

          {/* Filter Toggle - Only show when logged in */}
          {user && (
            <div className='flex justify-between items-center mb-4'>
              <div className='flex gap-2 items-center'>
                <button
                  onClick={() => setShowOnlyMine(!showOnlyMine)}
                  className={cn(
                    'flex gap-2 items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    showOnlyMine
                      ? 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                  )}
                >
                  <User className='w-4 h-4' />
                  {showOnlyMine
                    ? 'My Ratings & Reviews'
                    : 'All Ratings & Reviews'}
                </button>
              </div>
            </div>
          )}

          {/* Rating Filter */}
          <div className='mb-6'>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => setRatingFilter('all')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  ratingFilter === 'all'
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white'
                )}
              >
                <Film className='w-4 h-4' />
                All ({currentRatings.length})
              </button>
              <button
                onClick={() => setRatingFilter('love')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  ratingFilter === 'love'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'border border-gray-200 bg-white text-gray-600 hover:text-green-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-green-300'
                )}
              >
                <Heart className='w-4 h-4' />
                Loved (
                {currentRatings.filter((r) => r.rating === 'love').length})
              </button>
              <button
                onClick={() => setRatingFilter('hate')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  ratingFilter === 'hate'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'border border-gray-200 bg-white text-gray-600 hover:text-red-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-red-300'
                )}
              >
                <X className='w-4 h-4' />
                Hated (
                {currentRatings.filter((r) => r.rating === 'hate').length})
              </button>
              <button
                onClick={() => setRatingFilter('meh')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  ratingFilter === 'meh'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'border border-gray-200 bg-white text-gray-600 hover:text-yellow-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-yellow-300'
                )}
              >
                <Meh className='w-4 h-4' />
                Meh ({currentRatings.filter((r) => r.rating === 'meh').length})
              </button>
            </div>
          </div>

          {/* Stats Cards - Only show for logged-in users */}
          {user && (
            <div className='grid grid-cols-1 gap-4 mb-8 sm:grid-cols-4'>
              <Card className='bg-green-50 border-green-200 dark:border-green-800/30 dark:bg-green-900/20'>
                <CardContent className='p-4'>
                  <div className='flex gap-2 items-center'>
                    <Heart className='w-5 h-5 text-green-600 dark:text-green-400' />
                    <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                      Loved
                    </span>
                  </div>
                  <p className='mt-1 text-2xl font-bold text-green-900 dark:text-green-100'>
                    {stats.love}
                  </p>
                </CardContent>
              </Card>

              <Card className='bg-red-50 border-red-200 dark:border-red-800/30 dark:bg-red-900/20'>
                <CardContent className='p-4'>
                  <div className='flex gap-2 items-center'>
                    <X className='w-5 h-5 text-red-600 dark:text-red-400' />
                    <span className='text-sm font-medium text-red-800 dark:text-red-200'>
                      Hated
                    </span>
                  </div>
                  <p className='mt-1 text-2xl font-bold text-red-900 dark:text-red-100'>
                    {stats.hate}
                  </p>
                </CardContent>
              </Card>

              <Card className='bg-yellow-50 border-yellow-200 dark:border-yellow-800/30 dark:bg-yellow-900/20'>
                <CardContent className='p-4'>
                  <div className='flex gap-2 items-center'>
                    <Meh className='w-5 h-5 text-yellow-600 dark:text-yellow-400' />
                    <span className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                      Meh
                    </span>
                  </div>
                  <p className='mt-1 text-2xl font-bold text-yellow-900 dark:text-yellow-100'>
                    {stats.meh}
                  </p>
                </CardContent>
              </Card>

              <Card className='bg-blue-50 border-blue-200 dark:border-blue-800/30 dark:bg-blue-900/20'>
                <CardContent className='p-4'>
                  <div className='flex gap-2 items-center'>
                    <Film className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                    <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                      Total
                    </span>
                  </div>
                  <p className='mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100'>
                    {stats.total}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Display */}
          {allItems.length === 0 ? (
            <Card>
              <CardContent className='py-12 text-center'>
                <div className='flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full dark:bg-gray-800'>
                  <Film className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
                  {ratingFilter === 'all'
                    ? 'No Ratings & Reviews Yet'
                    : `No ${
                        ratingFilter === 'love'
                          ? 'Loved'
                          : ratingFilter === 'hate'
                          ? 'Hated'
                          : 'Meh'
                      } Ratings Yet`}
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  {ratingFilter === 'all'
                    ? 'Start rating and reviewing shows and movies to see them here!'
                    : `Start rating shows as ${
                        ratingFilter === 'love'
                          ? 'loved'
                          : ratingFilter === 'hate'
                          ? 'hated'
                          : 'meh'
                      } to see them here!`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4'>
              {allItems.map((item) => {
                if (item.type === 'rating') {
                  const rating = item.data;
                  const imageUrl = getTMDBImageUrl(rating.posterPath, 'w154');
                  const hasImageError = imageUrl
                    ? imageErrors.has(imageUrl)
                    : true;

                  return (
                    <Card
                      key={`rating-${rating.id}`}
                      className={getRatingColor(rating.rating)}
                    >
                      <CardContent className='p-4'>
                        <div className='flex gap-4'>
                          {/* Poster */}
                          <div className='overflow-hidden relative flex-shrink-0 w-14 h-20 rounded-lg shadow-md'>
                            {imageUrl && !hasImageError ? (
                              <Image
                                src={imageUrl}
                                alt={rating.title}
                                width={56}
                                height={80}
                                className='object-cover'
                                onError={() => handleImageError(imageUrl)}
                              />
                            ) : (
                              <FallbackImage
                                mediaType={rating.mediaType}
                                className='w-full h-full'
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex justify-between items-start mb-2'>
                              <div className='flex-1 min-w-0'>
                                <h3 className='text-lg font-semibold text-gray-900 truncate dark:text-white'>
                                  {rating.title}
                                </h3>
                                <div className='flex gap-2 items-center text-sm text-gray-600 dark:text-gray-400'>
                                  <span className='capitalize'>
                                    {rating.mediaType}
                                  </span>
                                  {rating.releaseDate && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        {new Date(
                                          rating.releaseDate
                                        ).getFullYear()}
                                      </span>
                                    </>
                                  )}
                                  {rating.voteAverage &&
                                    rating.voteAverage > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          ⭐ {rating.voteAverage.toFixed(1)}
                                        </span>
                                      </>
                                    )}
                                </div>
                              </div>

                              <div className='flex gap-2 items-center'>
                                {getRatingIcon(rating.rating)}
                                {user && rating.userId === user.id && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      void handleDeleteRating(rating.id)
                                    }
                                    className='text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
                                  >
                                    <Trash2 className='w-4 h-4' />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {rating.overview && (
                              <p className='text-sm text-gray-600 line-clamp-2 dark:text-gray-400'>
                                {rating.overview}
                              </p>
                            )}

                            <div className='mt-2 text-xs text-gray-500 dark:text-gray-500'>
                              Rated on {item.date.toLocaleDateString()}
                            </div>

                            {/* Encourage writing reviews for ratings without reviews */}
                            {!hasReview(rating) &&
                              user &&
                              rating.userId === user.id && (
                                <div className='flex gap-2 items-center mt-2'>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handleWriteReview(rating)}
                                    className='text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-300'
                                  >
                                    <MessageSquare className='mr-1 w-3 h-3' />
                                    Write Review
                                  </Button>
                                </div>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                } else {
                  const review = item.data;
                  const imageUrl = getTMDBImageUrl(review.posterPath, 'w154');
                  const hasImageError = imageUrl
                    ? imageErrors.has(imageUrl)
                    : true;

                  const reviewHasRating = hasRating(review);

                  return (
                    <Card
                      key={`review-${review.id}`}
                      className='bg-amber-50 border-amber-200 dark:border-amber-800/30 dark:bg-amber-900/20'
                    >
                      <CardContent className='p-4'>
                        <div className='flex gap-4'>
                          {/* Poster */}
                          <div className='overflow-hidden relative flex-shrink-0 w-14 h-20 rounded-lg shadow-md'>
                            {imageUrl && !hasImageError ? (
                              <Image
                                src={imageUrl}
                                alt={review.title}
                                width={56}
                                height={80}
                                className='object-cover'
                                onError={() => handleImageError(imageUrl)}
                              />
                            ) : (
                              <FallbackImage
                                mediaType={review.mediaType}
                                className='w-full h-full'
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex justify-between items-start mb-2'>
                              <div className='flex-1 min-w-0'>
                                <h3 className='text-lg font-semibold text-gray-900 truncate dark:text-white'>
                                  {review.title}
                                </h3>
                                <div className='flex gap-2 items-center text-sm text-gray-600 dark:text-gray-400'>
                                  <span className='capitalize'>
                                    {review.mediaType}
                                  </span>
                                  {review.rating && (
                                    <>
                                      <span>•</span>
                                      <span className='text-lg'>
                                        {review.rating}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className='flex gap-2 items-center'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleWriteReview(review)}
                                  className='text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-300'
                                  title='Write a review'
                                >
                                  <MessageSquare className='w-5 h-5' />
                                </Button>
                                {user && review.userId === user.id && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      void handleDeleteReview(review.id)
                                    }
                                    className='text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
                                  >
                                    <Trash2 className='w-4 h-4' />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {review.review && (
                              <p className='text-sm text-gray-600 line-clamp-3 dark:text-gray-400'>
                                {review.review}
                              </p>
                            )}

                            {review.tags && review.tags.length > 0 && (
                              <div className='flex flex-wrap gap-1 mt-2'>
                                {review.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className='rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className='flex justify-between items-center mt-2'>
                              <div className='text-xs text-gray-500 dark:text-gray-500'>
                                Reviewed on {item.date.toLocaleDateString()}
                              </div>

                              {/* Add Rating Button for reviews without ratings */}
                              {!reviewHasRating &&
                                user &&
                                review.userId === user.id && (
                                  <div className='flex gap-1 items-center'>
                                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                                      No rating yet
                                    </span>
                                    <div className='flex gap-1 items-center'>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        disabled={addingRating === review.id}
                                        onClick={() =>
                                          void handleAddRating(
                                            review.id,
                                            'love'
                                          )
                                        }
                                        className='p-0 w-6 h-6 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300'
                                      >
                                        <Heart className='w-3 h-3' />
                                      </Button>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        disabled={addingRating === review.id}
                                        onClick={() =>
                                          void handleAddRating(
                                            review.id,
                                            'hate'
                                          )
                                        }
                                        className='p-0 w-6 h-6 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
                                      >
                                        <X className='w-3 h-3' />
                                      </Button>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        disabled={addingRating === review.id}
                                        onClick={() =>
                                          void handleAddRating(review.id, 'meh')
                                        }
                                        className='p-0 w-6 h-6 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-300'
                                      >
                                        <Meh className='w-3 h-3' />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              })}
            </div>
          )}
        </div>
      </main>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewToEdit(null);
        }}
        viewingActivity={{
          tmdbId: reviewToEdit ? String(reviewToEdit.tmdbId) : '',
          title: reviewToEdit?.title || '',
          mediaType: reviewToEdit?.mediaType || 'movie',
          poster_path: reviewToEdit?.posterPath || '',
          overview: reviewToEdit?.overview || '',
          releaseDate: reviewToEdit?.releaseDate || '',
          status: 'watching',
          username: user?.username || '',
          photoURL: user?.photoURL || ''
        }}
        existingReview={reviewToEdit}
        onReviewAdded={handleReviewAdded}
      />
    </div>
  );
}

RatingsPage.getLayout = (page: ReactElement): ReactNode => page;
