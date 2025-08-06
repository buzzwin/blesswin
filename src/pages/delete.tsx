import router from 'next/router';
import { useState } from 'react';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { PublicLayout } from '@components/layout/pub_layout';

const DataDeletionInstructions = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implement data deletion request submission logic
  };
  const handleBack = async (): Promise<void> => {
    try {
      await router.push('/');
    } catch (error) {
      //// console.error(
      //'An error occurred while navigating to the homepage:',
      //error
      //);
    }
  };

  return (
    <div>
      <SEO title='Data Deletion / Buzzwin' />
      <MainHeader
        useActionButton
        title='Data Deletion Instructions'
        action={handleBack}
      />
      <section>
        <div className='mx-auto max-w-4xl px-4 py-8'>
          <h1 className='mb-4 text-3xl font-bold'>
            Data Deletion Instructions
          </h1>

          <p className='mb-4'>
            To request the deletion of your personal data, please send an email
            to{' '}
            <a className='text-blue-800' href='mailto:link2sources@gmail.com'>
              link2sources@gmail.com
            </a>
            <div className='mt-4 grid grid-cols-1 gap-4'>
              <a
                className='mb-4 text-blue-800 dark:text-white'
                href='https://www.buzzwin.com/terms'
              >
                Terms of Service
              </a>

              <a
                className='mb-4 text-blue-800 dark:text-white'
                href='https://www.buzzwin.com/privacy'
              >
                Privacy Policy
              </a>

              <a
                className='mb-4 text-blue-800 dark:text-white'
                href='https://www.buzzwin.com/delete'
              >
                Data Deletion
              </a>
            </div>
          </p>
        </div>
      </section>
    </div>
  );
};

export default DataDeletionInstructions;
