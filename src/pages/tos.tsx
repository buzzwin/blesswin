import React from 'react';
import { useRouter } from 'next/router';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';

const Terms: React.FC = () => {
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
      <SEO title='TOS / Buzzwin' />
      <MainHeader
        useActionButton
        title='Terms of Service'
        action={handleBack}
      />
      <section>
        <div>
          <p>
            <div className='mx-auto max-w-4xl px-4 py-8'>
              <h1 className='mb-4 text-3xl font-bold'>Terms of Service</h1>

              <p className='mb-4'>
                Welcome to [buzzwin.com] (the &quot;Site&quot;). These terms of
                service (&quot;Terms&quot;) apply to your use of the Site and
                any services or features available on or through the Site. By
                using the Site, you agree to be bound by these Term
              </p>
              <h2 className='mb-4 text-2xl font-bold'>Your Account</h2>
              <p className='mb-4'>
                If you create an account on the Site, you are responsible for
                maintaining the confidentiality of your account and password and
                for restricting access to your computer or device. You agree to
                accept responsibility for all activities that occur under your
                account or password.
              </p>
              <h2 className='mb-4 text-2xl font-bold'>User Content</h2>
              <p className='mb-4'>
                The Site may allow you to upload, submit, store, send or receive
                content, including text, images, audio and video (collectively,
                &quot;User Content&quot;). You retain ownership of any User
                Content that you submit or upload to the Site, subject to the
                rights, licenses and permissions granted in these Terms. You
                represent and warrant that you have all necessary rights,
                licenses and permissions to submit or upload any User Content to
                the Site, and that the use of such User Content by us or our
                users, partners or affiliates in connection with the Site does
                not violate any rights of any third party. We may use, modify,
                adapt, reproduce, distribute, and display User Content in
                connection with the Site and our business operations, subject to
                the terms of our Privacy Policy. You agree not to upload,
                submit, store, send or receive any User Content that: Infringes
                any intellectual property rights or other rights of any third
                party; Contains any material that is defamatory, obscene,
                pornographic, or otherwise offensive or harmful; Contains any
                viruses, Trojan horses, worms, time bombs, or other computer
                programming routines that are intended to damage, interfere
                with, surreptitiously intercept or expropriate any system, data,
                or personal information; Is false, misleading, or inaccurate in
                any way. We reserve the right to remove or modify any User
                Content for any reason, without notice or liability to you.
              </p>
              <h2 className='mb-4 text-2xl font-bold'>Intellectual Property</h2>
              <p className='mb-4'>
                The Site and its entire contents, features, and functionality
                (including but not limited to all information, software, text,
                displays, images, video, and audio, and the design, selection,
                and arrangement thereof), are owned by us, our licensors, or
                other providers of such material and are protected by United
                States and international copyright, trademark, patent, trade
                secret, and other intellectual property or proprietary rights
                laws. These Terms permit you to use the Site for your personal,
                non-commercial use only. You must not reproduce, distribute,
                modify, create derivative works of, publicly display, publicly
                perform, republish, download, store, or transmit any of the
                material on our Site, except as follows: Your computer or device
                may temporarily store copies of such materials in RAM incidental
                to your accessing and viewing those materials. You may store
                files that are automatically cached by your Web browser for
                display enhancement purposes. You may print or download one copy
                of a reasonable number of pages of the Site for your own
                personal, non-commercial use and not for further reproduction,
                publication, or distribution. If we provide desktop, mobile, or
                other applications for download, you may download a single copy
                to your computer or mobile device solely for your own personal,
                non-commercial use, provided you agree to be bound by our end
                user license agreement for such applications. If you believe
                that your intellectual property rights have been violated on the
                Site, please contact us at [contact email].
              </p>
              <h2 className='mb-4 text-2xl font-bold'>
                Disclaimer of Liability
              </h2>
              <p className='mb-4'>
                The Site is provided on an &quot;as is&quot; and &quot;as
                available&quot; basis. You agree that your use of the Site is at
                your sole risk. To the fullest extent permitted by law, we
                disclaim all warranties, express or implied, in connection with
                the Site and your use thereof, including, without limitation,
                the implied warranties of merchantability, fitness for a
                particular purpose, and non-infringement. We make no warranties
                or representations about the accuracy or completeness of the
                Site content or the content of any sites linked to the Site and
                we will assume no liability or responsibility for any (1)
                errors, mistakes, or inaccuracies of content, (2) personal
                injury or property damage, of any nature whatsoever, resulting
                from your access to and use of the Site, (3) any unauthorized
                access to or use of our secure servers and/or any and all
                personal information and/or financial information stored
                therein, (4) any interruption or cessation of transmission to or
                from the Site, (5) any bugs, viruses, trojan horses, or the like
                which may be transmitted to or through the Site by any third
                party, and/or (6) any errors or omissions in any content or for
                any loss or damage of any kind incurred as a result of the use
                of any content posted, emailed, transmitted, or otherwise made
                available via the Site. We do not warrant, endorse, guarantee,
                or assume responsibility for any product or service advertised
                or offered by a third party through the Site, any hyperlinked
                website, or any website or mobile application featured in any
                banner or other advertising, and we will not be a party to or in
                any way be responsible for monitoring any transaction between
                you and third-party providers of products or services. As with
                the purchase of a product or service through any medium or in
                any environment, you should use your best judgment and exercise
                caution where appropriate. We do not endorse, warrant, or
                guarantee any products, services, or content offered by any
                third-party providers, and we will not be a party to or in any
                way be responsible for monitoring any transaction between you
                and any third-party providers of products or services. In
                jurisdictions where limitations or exclusions of liability are
                not allowed, our liability will be limited to the greatest
                extent permitted by law.
              </p>
            </div>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Terms;
