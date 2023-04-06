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
    <>
      <SEO title='Best Movies to Watch / Buzzwin' />
      <MainHeader useActionButton title='Top Movies' action={handleBack} />
      <PublicLayout
        title='Best Movies to Watch / Buzzwin'
        description='Best Movies to Watch according to ChatGPT'
        ogImage='https://www.themoviedb.org/t/p/w600_and_h900_bestv2/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'
      >
        <div className='relative grid grid-cols-1 gap-4 overflow-hidden rounded-xl bg-gray-100 p-4 shadow-md sm:grid-cols-2'>
          <div className='relative grid grid-cols-1 gap-6 overflow-hidden rounded-xl bg-white p-4 shadow-md'>
            <h1 className='mb-4 w-full text-3xl font-bold text-red-500'>
              Best movies - according to ChatGPT.
            </h1>
            <h2>The Shawshank Redemption </h2>
            <p>
              Powerful storytelling, memorable performances, and a strong
              message of hope and redemption.
            </p>
            <h2>The Godfather </h2>A masterful adaptation of Mario Puzo's novel,
            featuring iconic performances, a compelling narrative, and
            exceptional direction by Francis Ford Coppola.
            <h2>Pulp Fiction </h2>
            <p>
              Quentin Tarantino's unique nonlinear storytelling, memorable
              dialogue, and stylized violence, which influenced a generation of
              filmmakers.
            </p>
            <h2>The Dark Knight</h2>
            <p>
              A groundbreaking superhero film with a complex and
              thought-provoking narrative, exceptional performances
              (particularly Heath Ledger as The Joker), and impressive action
              sequences. Schindler's List - A powerful and emotional portrayal
              of the Holocaust, featuring outstanding performances and masterful
              direction by Steven Spielberg. The Godfather Part II - A rare
              example of a sequel that lives up to the original, with a complex
              narrative structure, excellent performances, and an exploration of
              themes like power and family.
            </p>
            <h2>Forrest Gump </h2>
            <p>
              A heartwarming and engaging story that combines history, romance,
              and drama, anchored by Tom Hanks' iconic performance.{' '}
            </p>
            <h2>The Empire Strikes Back </h2>
            <p>
              Widely considered the best film in the Star Wars saga, featuring a
              darker and more complex narrative, iconic characters, and
              memorable plot twists
            </p>
            <h2>Inception </h2>
            <p>
              A visually stunning and intellectually challenging film that
              explores the nature of dreams and reality, with an original story
              and impressive special effects.
            </p>
            <h2>The Lord of the Rings: The Return of the King</h2>{' '}
            <p>
              The epic conclusion to Peter Jackson's ambitious adaptation of
              J.R.R. Tolkien's fantasy series, featuring breathtaking visuals,
              stirring performances, and a satisfying narrative resolution.
            </p>
          </div>
        </div>
      </PublicLayout>
    </>
  );
};

export default TopMovies;
