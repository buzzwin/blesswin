import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@lib/context/auth-context';
import { useUser } from '@lib/context/user-context';
import { SEO } from '@components/common/seo';
import { UserHomeCover } from '@components/user/user-home-cover';
import { UserHomeAvatar } from '@components/user/user-home-avatar';
import { UserDetails } from '@components/user/user-details';
import { UserNav } from '@components/user/user-nav';

import { Loading } from '@components/ui/loading';

import { FollowButton } from '@components/ui/follow-button';
import { variants } from '@components/user/user-header';
import { UserEditProfile } from '@components/user/user-edit-profile';
import type { ReactNode } from 'react';
import { UserShare } from '@components/user/user-share';

export function UserHomeLayout({ children }: { children: ReactNode }): JSX.Element {
  const { user, isAdmin } = useAuth();
  const { user: userData, loading } = useUser();

  const {
    query: { id }
  } = useRouter();

  const coverData = userData?.coverPhotoURL
    ? { src: userData.coverPhotoURL, alt: userData.name }
    : null;

  const profileData = userData
    ? { src: userData.photoURL, alt: userData.name }
    : null;

  const { id: userId } = user ?? {};

  const isOwner = userData?.id === userId;

  return (
    <>
      {userData && (
        <SEO
          title={`${`${userData.name} (@${userData.username})`} / Buzzwin`}
        />
      )}
      <motion.section {...variants} exit={undefined}>
        {loading ? (
          <Loading className='mt-5' />
        ) : (
          <>
            <UserHomeCover coverData={coverData} />
            <div className='relative flex flex-col gap-3 px-4 py-3'>
              <div className='flex justify-between'>
                <UserHomeAvatar profileData={profileData} />
                {isOwner ? (
                  <UserEditProfile />
                ) : (
                  <div className='flex gap-2 self-start'>
                    <UserShare username={userData?.username ?? (Array.isArray(id) ? id[0] : id) ?? ''} />
                    <FollowButton
                      userTargetId={userData?.id ?? ''}
                      userTargetUsername={userData?.username ?? (Array.isArray(id) ? id[0] : id) ?? ''}
                    />
                    {isAdmin && <UserEditProfile hide />}
                  </div>
                )}
              </div>
              {userData && <UserDetails {...userData} />}
            </div>
          </>
        )}
      </motion.section>
      {(userData ?? !loading) && (
        <>
          <UserNav />
          {children}
        </>
      )}
    </>
  );
}
