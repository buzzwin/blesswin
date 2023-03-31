import { useRouter } from 'next/router';

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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const id = query.id as string;
  if (id === undefined || id == '') return { props: {} }; // Return empty props object if ID is missing

  const idstring = id;

  try {
    const docRef = doc(db, 'tweets', idstring);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      data.createdAt = formatDate(data.createdAt as Timestamp, 'full');
      data.updatedAt = formatDate(data.updatedAt as Timestamp, 'full');
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

  return (
    <>
      <SEO title='TOS / Buzzwin' />
      <MainHeader useActionButton title='Whats Buzzin!' action={handleBack} />
      <PublicLayout
        title={(data?.text as string)?.toString() || 'Buzzwin'}
        description='Checkout this buzz and others at Buzzwin.com a social media platform to share thoughts on movies, tv shows, and other media.'
        ogImage={`https://image.tmdb.org/t/p/w500/${
          (data?.viewingActivity as ViewingActivity)?.poster_path
        }`}
      >
        {data?.createdAt ? (
          <div className='relative grid grid-cols-2 gap-4 overflow-hidden rounded-xl bg-white p-6 shadow-md sm:mx-8 md:mx-20'>
            <div className='absolute top-0 left-0 right-0 col-span-2 h-2 bg-black'></div>
            <div className='absolute bottom-0 left-0 right-0 col-span-2 h-2 bg-black'></div>
            <div className='flex items-center'>
              <p className='bg-gray-200 font-medium text-gray-400'>
                Buzz generated {data.createdAt || 'No Date'}
              </p>
            </div>
            <div className='col-start-2 row-span-4 flex items-center'>
              <img
                className='h-48 rounded-r-xl'
                //ternary operator to check if poster_path is null
                src={
                  data?.viewingActivity?.poster_path
                    ? `https://image.tmdb.org/t/p/w500/${
                        (data?.viewingActivity as ViewingActivity)?.poster_path
                      }`
                    : `/movie.png`
                }
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
            <div className='flex items-center'>
              <button className='mr-4 flex items-center hover:text-red-500'>
                <HeartIcon className='h-5 w-5 text-red-300' />
                <span className='ml-2 text-sm'>
                  {(data.userLikes as Array<string>).length}
                </span>
              </button>
            </div>

            <div className='text-lg text-gray-600'>
              Interested in what others are watching?{' '}
              <a className='text-red-400' href='/'>
                Join us now.
              </a>
            </div>
            <div className='col-span-2'>
              <button
                className='focus:shadow-outline mt-4 rounded bg-green-400 px-4 py-2 font-bold text-white hover:bg-gray-500 hover:text-white focus:outline-none'
                onClick={() => router.push('/')}
              >
                Sign Up or Sign In
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className='p-16 text-center text-gray-700 dark:text-white'>
              Loading your favorite buzz
            </div>

            <SpinnerComponent />
          </div>
        )}
      </PublicLayout>
    </>
    //<pre>{JSON.stringify(data, null, 2)}</pre>
  );
};

export default Tweet;
