import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DocumentData, doc, getDoc, Timestamp } from 'firebase/firestore';
import { HeartIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { ViewingActivity } from '@components/activity/types';
import { SEO } from '@components/common/seo';
import { db } from '@lib/firebase/app';
import SpinnerComponent from '@components/common/spinner';

const TweetPage = () => {
  const router = useRouter();
  const {
    query: { id }
  } = useRouter();

  const [data, setData] = useState({} as DocumentData);

  // const handleJoin = async () => {
  //   useRouter().push(`/`);
  // };

  useEffect(() => {
    const fetchData = async () => {
      if (id === undefined || id == '') return;
      const idstring = id as string;

      try {
        const docRef = doc(db, 'tweets', idstring);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          //console.log('Document data:', docSnap.data());
          setData(docSnap.data());
          //console.log(data);
        } else {
          // doc.data() will be undefined in this case
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error Fetching data:', error);
      }
    };

    fetchData()
      .then(() => {
        //console.log('Data Fetched');
      })
      .catch((error) => {
        console.error('Error Fetching data:', error);
      });
  }, [id]);

  return (
    <div>
      {data.createdAt ? (
        <div className='rounded-xl bg-white p-6 shadow-md'>
          <SEO
            title='Buzzwin - What are you buzzing about?'
            description={(data.text as string)?.toString() || 'Buzzwin'}
            image={`https://image.tmdb.org/t/p/w500/${
              (data.viewingActivity as ViewingActivity)?.poster_path
            }`}
          />
          <div className='mb-4 flex items-center'>
            <Image
              src={(data.photoURL as string)?.toString() || '/logoTR.png'}
              alt='Profile Picture'
              className='mr-4 h-12 w-12 rounded-full'
              width={48}
              height={48}
            />
            <div>
              <p className='px-4 font-medium text-gray-500'>
                Buzz generated{' '}
                {(data.createdAt as Timestamp)?.toDate().toLocaleString() ||
                  'No Date'}
              </p>
            </div>
          </div>
          <div className='h-full w-full p-4'>
            <div className='mb-4 text-lg font-medium'>{data.text}</div>
            <Image
              className='h-24 rounded-r-xl'
              src={`https://image.tmdb.org/t/p/w500/${
                (data.viewingActivity as ViewingActivity)?.poster_path
              }`}
              alt={(data.title as string)?.toString() || 'No Image'}
              width={125}
              height={187}
            />
          </div>
          <div className='mt-4 flex items-center px-4'>
            <button className='mr-4 flex items-center hover:text-red-500'>
              <HeartIcon className='h-5 w-5 text-red-300' />
              <span className='ml-2 text-sm'>
                {(data.userLikes as Array<string>).length}
              </span>
            </button>
          </div>
          <div className='mt-6 text-sm text-gray-600'>
            Interested in what others are watching? Join us now.
          </div>
          <button
            className='focus:shadow-outline mt-4 rounded bg-green-400 px-4 py-2 font-bold text-white hover:bg-gray-500 hover:text-white focus:outline-none'
            onClick={() => router.push('/')}
          >
            Sign Up or Sign In
          </button>
        </div>
      ) : (
        <div>
          <div className='p-16 text-center text-gray-700 dark:text-white'>
            Loading your favorite buzz
          </div>
          <SpinnerComponent />
        </div>
      )}
    </div>
    //<pre>{JSON.stringify(data, null, 2)}</pre>
  );
};

export default TweetPage;
