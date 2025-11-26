import { useRouter } from 'next/router';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import Link from 'next/link';

export default function DisclaimerPage(): JSX.Element {
  const router = useRouter();

  return (
    <HomeLayout>
      <SEO
        title='Medical Disclaimer & Liability Notice | Buzzwin'
        description='Important medical disclaimer and liability notice for Buzzwin wellness platform.'
        keywords='disclaimer, medical advice, liability, wellness, health'
      />

      <SectionShell className='py-12'>
        <div className='mx-auto max-w-4xl px-6'>
          <Link
            href='/'
            className='mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='font-medium'>Back</span>
          </Link>

          <div className='mb-8 flex items-center gap-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30'>
              <AlertTriangle className='h-8 w-8 text-yellow-600 dark:text-yellow-400' />
            </div>
            <h1 className='text-4xl font-light text-gray-900 dark:text-white'>
              Medical Disclaimer & Liability Notice
            </h1>
          </div>

          <div className='prose prose-lg dark:prose-invert max-w-none'>
            <div className='mb-8 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-6 dark:border-yellow-400 dark:bg-yellow-900/20'>
              <p className='mb-0 text-lg font-semibold text-yellow-900 dark:text-yellow-200'>
                Important: Please read this disclaimer carefully before using
                Buzzwin.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
              Medical Disclaimer
            </h2>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              <strong>
                Buzzwin is NOT intended to provide medical advice, diagnosis, or
                treatment.
              </strong>{' '}
              The content, information, and services provided on this platform
              are for informational and educational purposes only and are not
              intended to be a substitute for professional medical advice,
              diagnosis, or treatment.
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              Always seek the advice of your physician or other qualified health
              provider with any questions you may have regarding a medical
              condition. Never disregard professional medical advice or delay in
              seeking it because of something you have read or learned on this
              platform.
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              The wellness guidance, yoga poses, meditation techniques,
              mindfulness practices, and other content provided by our AI agents
              are general in nature and may not be appropriate for your specific
              health condition, physical limitations, or circumstances.
            </p>

            <h2 className='mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white'>
              Not a Substitute for Professional Care
            </h2>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              If you have or suspect you may have a medical or psychological
              condition, please consult with a qualified healthcare professional
              before starting any new wellness practice, exercise program, or
              making changes to your health routine.
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              The information provided on Buzzwin should not be used for
              diagnosing or treating a health problem or disease, or prescribing
              any medication or other treatment.
            </p>

            <h2 className='mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white'>
              Limitation of Liability
            </h2>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              <strong>
                The creators, operators, and contributors to Buzzwin are not
                responsible for any harm, injury, loss, or damage that may
                result from your use of this platform or reliance on any
                information or guidance provided herein.
              </strong>
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              By using Buzzwin, you acknowledge and agree that:
            </p>
            <ul className='mb-4 ml-6 list-disc text-gray-700 dark:text-gray-300'>
              <li>You use the platform at your own risk</li>
              <li>
                The platform is provided &quot;as is&quot; without warranties of
                any kind
              </li>
              <li>
                No guarantee is made regarding the accuracy, completeness, or
                usefulness of any information provided
              </li>
              <li>
                The creators are not liable for any direct, indirect,
                incidental, special, or consequential damages
              </li>
              <li>
                You are solely responsible for your health and wellness
                decisions
              </li>
            </ul>

            <h2 className='mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white'>
              Emergency Situations
            </h2>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              If you think you may have a medical emergency, call your doctor or
              emergency services (911 in the United States) immediately. Buzzwin
              is not equipped to handle medical emergencies.
            </p>

            <h2 className='mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white'>
              Assumption of Risk
            </h2>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              By using Buzzwin, you acknowledge that you understand and accept
              the risks associated with wellness practices, including but not
              limited to yoga, meditation, and mindfulness exercises. You agree
              to assume full responsibility for any risks, injuries, or damages
              that may result from your participation in any activities
              suggested or recommended on this platform.
            </p>

            <h2 className='mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white'>
              No Endorsement
            </h2>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              Reference to any specific product, service, or practice does not
              constitute an endorsement or recommendation by Buzzwin. Any views
              or opinions expressed are those of the AI agents and do not
              necessarily reflect the views of the platform creators.
            </p>

            <h2 className='mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white'>
              Changes to Disclaimer
            </h2>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              We reserve the right to modify this disclaimer at any time. Your
              continued use of Buzzwin after any changes constitutes your
              acceptance of the modified disclaimer.
            </p>

            <div className='mt-8 rounded-lg border-l-4 border-red-500 bg-red-50 p-6 dark:border-red-400 dark:bg-red-900/20'>
              <p className='mb-0 font-semibold text-red-900 dark:text-red-200'>
                By using Buzzwin, you acknowledge that you have read,
                understood, and agree to this disclaimer. If you do not agree
                with any part of this disclaimer, please do not use this
                platform.
              </p>
            </div>

            <div className='mt-8 text-sm text-gray-500 dark:text-gray-400'>
              <p>
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </SectionShell>
    </HomeLayout>
  );
}
