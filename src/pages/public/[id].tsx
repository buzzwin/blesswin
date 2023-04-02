import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isSupported, logEvent } from 'firebase/analytics';

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
          <div className='relative grid grid-cols-2 gap-4 overflow-hidden rounded-xl bg-white p-6 shadow-md sm:mx-8 md:mx-20'>
            <div className='absolute top-0 left-0 right-0 col-span-2 h-2 bg-black'></div>
            <div className='absolute bottom-0 left-0 right-0 col-span-2 h-2 bg-black'></div>
            <div className='flex items-center'>
              <p className='font-medium text-green-400 '>
                Buzz generated {data.createdAt || 'No Date'}
              </p>
            </div>
            <div className='col-start-2 row-span-4 flex items-center'>
              <img
                className='h-48 rounded-r-xl'
                //ternary operator to check if poster_path is null
                src={`https://image.tmdb.org/t/p/w500/${
                  (data?.viewingActivity as ViewingActivity)?.poster_path ||
                  '/movie.png'
                }`}
                alt={(data?.title as string)?.toString() || 'No Image'}
                width={125}
                height={187}
              />
            </div>
            <div className='h-full w-full'>
              <div className='mb-4 text-lg font-medium'>{data.text}</div>
            </div>
            <div className='text-sm'>
              <p>{(data.viewingActivity as ViewingActivity)?.review}</p>
            </div>
            {/* <div className='flex items-center'>
              <button className='flex items-center mr-4 hover:text-red-500'>
                <HeartIcon className='w-5 h-5 text-red-300' />
                <span className='ml-2 text-sm'>
                  {(data.userLikes as Array<string>).length}
                </span>
              </button> 
            </div> */}

            <div className='bg-slate-100 p-4 shadow-md'>
              <div>Are you interested in what the world is watching? </div>

              <Link href='/'>
                <div className='mt-2 flex h-12 w-full font-medium tracking-wide text-green-400 transition duration-200 hover:bg-gray-500 hover:text-white focus:outline-none'>
                  Join the discussion now!
                </div>
              </Link>
              <div className='col-span-2'>
                <button
                  className='focus:shadow-outline mt-4 rounded bg-green-400 px-4 py-2 font-bold text-white hover:bg-gray-500 hover:text-white focus:outline-none'
                  onClick={() => router.push('/')}
                >
                  Sign Up or Sign In
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className='p-16 text-center text-gray-700 dark:text-white'>
              Nothing to see yet!
            </div>
          </div>
        )}
        <LoginMain></LoginMain>
      </PublicLayout>
    </>
    //<pre>{JSON.stringify(data, null, 2)}</pre>
  );
};

export default Tweet;
