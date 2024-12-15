import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isSupported, logEvent } from 'firebase/analytics';
import { useAuth } from '@lib/context/auth-context';

import { DocumentData, doc, getDoc, Timestamp } from 'firebase/firestore';
import { HeartIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { ViewingActivity } from '@components/activity/types';
import { SEO } from '@components/common/seo';
import { db } from '@lib/firebase/app';
import SpinnerComponent from '@components/common/spinner';
import { PublicLayout } from '@components/layout/pub_layout';
import { GetServerSideProps } from 'next/types';
import { formatDate } from '@lib/date';
import { MainHeader } from '@components/home/main-header';
import Link from 'next/link';
import { HeroIcon } from '@components/ui/hero-icon';
import { LoginMain } from '@components/login/login-main';
import { Button } from '@components/ui/button';
import { CustomIcon } from '@components/ui/custom-icon';
import LogoIcon from '@components/ui/logo';
import { FacebookIcon } from 'next-share';
import JustLogin from '@components/login/justlogin';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const id = query.id as string;
  if (id === undefined || id == '') return { props: {} }; // Return empty props object if ID is missing

  const idstring = id;

  try {
    const docRef = doc(db, 'tweets', idstring);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Check if data.updatedAt is not null before formatting it
      if (data.createdAt !== null) {
        data.createdAt = formatDate(data.createdAt as Timestamp, 'full');
      }
      // Check if data.updatedAt is not null before formatting it
      if (data.updatedAt !== null) {
        data.updatedAt = formatDate(data.updatedAt as Timestamp, 'full');
      }

      //console.log('Document data:', data);
      return {
        props: {
          data: {
            ...data
          }
        }
      };
    } else {
      console.log('No such document!');
      return { props: {} }; // Return empty props object if document doesn't exist
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return { props: {} }; // Return empty props object if there is an error
  }
};

interface TweetProps {
  data: DocumentData;
}

export const Tweet: React.FC<TweetProps> = ({ data }) => {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const { signInWithFacebook } = useAuth();
  const handleBack = async (): Promise<void> => {
    try {
      await router.push('/');
    } catch (error) {
      //console.error(
      //'An error occurred while navigating to the homepage:',
      //error
      //);
    }
  };

  //const [data, setData] = useState({} as DocumentData);

  // const handleJoin = async () => {
  //   useRouter().push(`/`);
  // };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isSupported()
        .then((supported) => {
          if (supported) {
            import('firebase/analytics')
              .then(({ getAnalytics }) => {
                const analytics = getAnalytics();
                logEvent(analytics, 'page_view');
              })
              .catch((error) => {
                console.error('Error loading Firebase Analytics:', error);
              });
          }
        })
        .catch((error) => {
          console.error(
            'Error checking for Firebase Analytics support:',
            error
          );
        });
    }
  }, []);

  return (
    <>
      <SEO title='Buzzwin- What are you watching?' />
      <MainHeader useActionButton title='Whats Buzzin!' action={handleBack} />
      <PublicLayout
        title={(data?.text as string)?.toString() || 'Buzzwin'}
        description={
          (data?.viewingActivity as ViewingActivity)?.review || 'No Review'
        }
        ogImage={`https://image.tmdb.org/t/p/w500/${
          (data?.viewingActivity as ViewingActivity)?.poster_path
        }`}
      >
        {data?.createdAt ? (
          <div className='relative grid grid-cols-1 gap-4 overflow-hidden rounded-xl bg-gray-100 p-4 shadow-md dark:bg-gray-800 sm:grid-cols-2'>
            <div className='relative grid grid-cols-1 gap-6 overflow-hidden rounded-xl bg-white p-4 shadow-md dark:bg-gray-900'>
              <div>
                <div className='grid grid-cols-1 sm:grid-cols-2'>
                  <div className='flex items-center justify-center'>
                    <img
                      className='h-56 w-auto rounded-r-xl'
                      src={`https://image.tmdb.org/t/p/w500/${
                        (data?.viewingActivity as ViewingActivity)
                          ?.poster_path || '/movie.png'
                      }`}
                      alt={(data?.title as string)?.toString() || 'No Image'}
                      width={125}
                      height={187}
                    />
                  </div>

                  <div>
                    <div className='pl-0 sm:pl-4'>
                      <p className='font-semibold text-emerald-500 dark:text-emerald-400'>
                        Buzz generated {data.createdAt || 'No Date'}
                      </p>
                      <div className='mb-4 text-xl font-medium text-gray-900 dark:text-gray-100'>
                        {data.text}
                      </div>
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-300'>
                      <p>{(data.viewingActivity as ViewingActivity)?.review}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-span-1 justify-center bg-gradient-to-r from-gray-800 via-slate-500 to-gray-800 p-6 shadow-md dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:col-span-2'>
                <h2 className='mb-4 text-2xl font-bold text-white'>
                  Are you interested in what the world is watching?
                </h2>
                <Link href='/'>
                  <a className='mt-2 mb-4 inline-flex items-center font-medium tracking-wide text-white transition duration-200 hover:text-emerald-400 focus:outline-none'>
                    <span>
                      Join friends, family, and people around the world now!
                    </span>
                    <HeroIcon
                      iconName='ArrowRightIcon'
                      className='ml-2 h-5 w-5'
                    />
                  </a>
                </Link>
                <div className='mt-2'>
                  <button
                    className='rounded-lg bg-white px-4 py-2 font-bold text-emerald-600 transition-colors duration-200 hover:bg-emerald-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-emerald-400 dark:hover:bg-emerald-600'
                    onClick={() => router.push('/')}
                  >
                    Sign Up or Sign In
                  </button>
                </div>
              </div>
            </div>

            <JustLogin />
          </div>
        ) : (
          <div>
            <div className='p-16 text-center text-gray-700 dark:text-gray-300'>
              You have reached the place where you can see what the world is
              watching
            </div>
            <JustLogin />
          </div>
        )}
      </PublicLayout>
    </>
  );
};

export default Tweet;
