import React from 'react';
import { useRouter } from 'next/router';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { PublicLayout } from '@components/layout/pub_layout';
import JustLogin from '@components/login/justlogin';
import Link from 'next/link';

const TopMovies: React.FC = () => {
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
  return (
    <div>
      <SEO title='Best Movies to Watch / Buzzwin' />
      <MainHeader useActionButton title='Top Movies' action={handleBack} />
      <PublicLayout
        title='Best Movies to Watch / Buzzwin'
        description=
          'Best Movies to Watch according to ChatGPT'
        ogImage='https://www.themoviedb.org/t/p/w600_and_h900_bestv2/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'
      >
       
          <div className='relative grid grid-cols-1 gap-4 p-4 overflow-hidden bg-gray-100 shadow-md rounded-xl sm:grid-cols-2'>
            <div className='relative grid grid-cols-1 gap-6 p-4 overflow-hidden bg-white shadow-md rounded-xl'>
              <div>
                <div >
   
              <h1 className='w-full mb-4 text-3xl font-bold text-red-500'>
                Best movies - according to ChatGPT.
              </h1>

            
                <h2>The Shawshank Redemption </h2>
                <p>
                  Powerful storytelling, memorable performances, and a strong
                  message of hope and redemption.
                </p>
                <h2>The Godfather </h2>
                
                  A masterful adaptation of Mario Puzo's novel, featuring iconic
                  performances, a compelling narrative, and exceptional
                  direction by Francis Ford Coppola.
                
                <h2>Pulp Fiction </h2>
                <p>
                  Quentin Tarantino's unique nonlinear storytelling, memorable
                  dialogue, and stylized violence, which influenced a generation
                  of filmmakers.
                </p>
                <h2>The Dark Knight</h2>
                <p>
                
                  A groundbreaking superhero film with a complex and
                  thought-provoking narrative, exceptional performances
                  (particularly Heath Ledger as The Joker), and impressive
                  action sequences. Schindler's List - A powerful and emotional
                  portrayal of the Holocaust, featuring outstanding performances
                  and masterful direction by Steven Spielberg. The Godfather
                  Part II - A rare example of a sequel that lives up to the
                  original, with a complex narrative structure, excellent
                  performances, and an exploration of themes like power and
                  family.
                </p>
                <h2>Forrest Gump </h2>
                <p>
                  A heartwarming and engaging story that combines history,
                  romance, and drama, anchored by Tom Hanks' iconic performance.{' '}
                </p>
                <h2>The Empire Strikes Back </h2>
                <p>
                  Widely considered the best film in the Star Wars saga,
                  featuring a darker and more complex narrative, iconic
                  characters, and memorable plot twists
                </p>
                <h2>Inception </h2>
                <p>
                  A visually stunning and intellectually challenging film that
                  explores the nature of dreams and reality, with an original
                  story and impressive special effects.
                </p>
                <h2>The Lord of the Rings: The Return of the King</h2>{' '}
                <p>
                  The epic conclusion to Peter Jackson's ambitious adaptation of
                  J.R.R. Tolkien's fantasy series, featuring breathtaking
                  visuals, stirring performances, and a satisfying narrative
                  resolution.
                </p>
              
           
          
        

     
                
              </div>
              <div className='justify-center col-span-1 p-6 shadow-md bg-gradient-to-r from-gray-800 via-slate-500 to-gray-800 sm:col-span-2'>
                <h2 className='mb-4 text-2xl font-bold text-white'>
                  Are you interested in what the world is watching?
                </h2>
                <Link href='/'>
                  <a className='inline-flex items-center mt-2 mb-4 font-medium tracking-wide text-white transition duration-200 hover:text-green-800 focus:outline-none'>
                    <span>
                      Join friends, family, and people around the world now!
                    </span>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-6 h-6 ml-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M17 8l4 4m0 0l-4 4m4-4H3'
                      />
                    </svg>
                  </a>
                </Link>
                <div className='mt-2'>
                  <button
                    className='px-4 py-2 font-bold text-green-800 bg-white rounded focus:shadow-outline hover:bg-green-800 hover:text-white focus:outline-none'
                    onClick={() => router.push('/')}
                  >
                    Sign Up or Sign In
                  </button>
                </div>
              </div>
              </div>


              {/* <div className="flex items-center">
        <button className="flex items-center mr-4 hover:text-red-500">
          <HeartIcon className="w-5 h-5 text-red-300" />
          <span className="ml-2 text-sm">
            {(data.userLikes as Array<string>).length}
          </span>
        </button> 
        </div> */}
            </div>


            <JustLogin />
          </div>
        ) : (
          <div>
            <div className='p-16 text-center text-gray-700 dark:text-white'>
              You have reached the place where you can see what the world is
            </div>
            <JustLogin />
          </div>
        )}
      </PublicLayout>
      
    </div>
  );
};

export default TopMovies;
