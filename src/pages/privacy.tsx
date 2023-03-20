import React from 'react';

interface Props {
  companyName: string;
}

const PrivacyPolicy: React.FC<Props> = () => {
  const companyName = 'Buzzwin';
  return (
    <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
      <div className='light:text-gray-900 mb-8 text-3xl font-extrabold leading-9 dark:text-white sm:text-4xl sm:leading-10'>
        {companyName} Privacy Policy
      </div>
      <div className='prose mb-8 max-w-none'>
        <p>
          At {companyName}, we respect the privacy of our users and are
          committed to protecting their personal information. This Privacy
          Policy outlines the types of personal information we collect from our
          users and how we use, store, and protect that information.
        </p>
        <div className='pt-2 pb-2 text-xl'>
          1. Personal Information We Collect
        </div>
        <p>
          When you sign up for an account on {companyName}, we collect certain
          personal information from you, including:
        </p>
        <ul>
          <li>Your name</li>
          <li>Your email address</li>
          <li>Your location</li>
          <li>Your gender</li>
          <li>Your birthdate</li>
          <li>Your username and password</li>
          <li>
            Your profile picture and other information you choose to share on
            your profile
          </li>
        </ul>
        <div>
          We also collect information about your use of {companyName} for
          example.
        </div>
        <ul>
          <li>Your watching history and show ratings</li>
          <li>Your show reviews and comments</li>
          <li>Your show and groups</li>
          <li>Your interactions with other users on {companyName}</li>
        </ul>
        <div>
          We may also collect information from third-party sources, such as your
          social media accounts, if you choose to link them to your{' '}
          {companyName} account.
        </div>
        <div className='pt-2 pb-2 text-xl'>
          2. How We Use Your Personal Information
        </div>
        <p>We use your personal information to:</p>
        <ul>
          <li>Create and maintain your account on {companyName}</li>
          <li>
            Personalize your experience on {companyName}, such as recommending
            shows you may like
          </li>
          <li>Communicate with you about your account and our services</li>
          <li>
            Enforce our terms of service and protect the security of our users
            and our website
          </li>
          <li>Conduct research and analysis to improve our services</li>
        </ul>
        <p>We will never sell your personal information to third parties.</p>
        <h2>3. How We Store and Protect Your Personal Information</h2>
        <p>
          We store your personal information on secure servers and take
          reasonable measures to protect it from unauthorized access, use, and
          disclosure. However, no method of transmission over the internet or
          electronic storage is completely secure, so we cannot guarantee the
          absolute security of your personal information.
        </p>
        <p>
          We will retain your personal information for as long as necessary to
          fulfill the purposes outlined in this Privacy Policy, unless a longer
          retention period is required by law.
        </p>
        <h2>4. Your Rights and Choices</h2>
        <p>
          You have the right to access, correct, and delete your personal
          information at any time.
        </p>
        <p>
          You may also have the right to restrict or object to our processing of
          your personal information, or to request that we transfer your
          personal information to another party.
        </p>
        <p>
          You may exercise these rights by contacting us at{' '}
          <a
            href='mailto:
            '
          >
            link2sources@gmail.com
          </a>
          .
        </p>
        <p>
          You may also have the right to lodge a complaint with your local data
          protection authority.
        </p>
        <h2>5. Changes to Our Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          to our practices or for other operational, legal, or regulatory
          reasons.
        </p>
        <p>
          We will post any changes to this Privacy Policy on this page and will
          indicate at the top of the page the date these terms were last
          revised.
        </p>
        <p>
          If we make any material changes to this Privacy Policy, we will notify
          you by email or through a message posted on the website.
        </p>

        <div className='pt-2 pb-2 text-xl'>6. Contact Us</div>

        <p>
          If you have any questions about this Privacy Policy, please contact us
          at{' '}
          <a
            href='mailto:
            '
          >
            link2sources@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
