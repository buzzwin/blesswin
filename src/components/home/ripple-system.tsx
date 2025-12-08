import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionShell } from '@components/layout/section-shell';
import type { User } from '@lib/types/user'; // Assuming User type location, will verify if needed, but for now using any or generic object if type not found easily. actually let's check imports in index.tsx. index.tsx uses useAuth which returns user.

// Let's check where User type is defined or just use 'any' for now if I can't find it quickly, but better to be precise.
// index.tsx imports useAuth from '@lib/context/auth-context'.
// I'll use a generic interface for now or just 'any' to avoid build errors if I'm unsure, but I should try to be safe.
// Actually, I can just accept `user: any` or `user: boolean` if only existence is checked.
// In index.tsx: `const user = authContext.user;` and `user` is used in `user && (...)`.
// So passing `user` as a prop is fine.

interface RippleSystemProps {
  user: any; // Using any to avoid type import issues for now, can refine later.
}

export function RippleSystem({ user }: RippleSystemProps): JSX.Element {
  return (
    <SectionShell variant='dark'>
      <div className='mx-auto w-full max-w-6xl px-6'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
            Reactions, Join, and Ripples
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300'>
            Express yourself with reactions, join actions to create impact, and
            watch ripples spread.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {/* Reactions */}
          <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
                <span className='text-2xl'>✨</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                Simple Reactions
              </h3>
            </div>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>
              Show your appreciation with quick reactions:
            </p>
            <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
              <li className='flex items-center gap-2'>
                <span>✨</span>
                <span>
                  <strong>Inspired</strong> - This moved you
                </span>
              </li>
              <li className='flex items-center gap-2'>
                <span>🙏</span>
                <span>
                  <strong>Grateful</strong> - You're thankful
                </span>
              </li>
              <li className='flex items-center gap-2'>
                <span>💚</span>
                <span>
                  <strong>Sent Love</strong> - You care
                </span>
              </li>
            </ul>
          </div>

          {/* Join This Action */}
          <div className='rounded-xl border-2 border-purple-300 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-800'>
                <span className='text-2xl'>🌱</span>
              </div>
              <h3 className='text-xl font-bold text-purple-900 dark:text-purple-100'>
                Join This Action
              </h3>
            </div>
            <p className='mb-4 text-purple-800 dark:text-purple-200'>
              <strong>This is different.</strong> When you join an action,
              you're not just reacting—you're committing to do the same action
              yourself and creating a ripple.
            </p>
            <ul className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5'>✓</span>
                <span>Shares their ritual participation</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5'>✓</span>
                <span>Links to the original ritual</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5'>✓</span>
                <span>Extends the ripple chain</span>
              </li>
            </ul>
            <div className='mt-4 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50'>
              <p className='text-xs font-medium text-purple-900 dark:text-purple-100'>
                💡 Example: Someone shares "Just finished my breathing ritual".
                You click "Join This Ritual" to participate, then share your own participation. Now
                you're both part of the same ritual community!
              </p>
            </div>
          </div>
        </div>

        {/* Ripple Visualization */}
        <div className='mt-12 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800'>
          <h3 className='mb-6 text-center text-xl font-bold text-gray-900 dark:text-white'>
            See the Ripple in Action
          </h3>
          <div className='flex flex-col items-center gap-4'>
            {/* Original */}
            <div className='w-full max-w-md rounded-lg border-2 border-purple-300 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
              <div className='mb-2 text-xs font-semibold uppercase text-purple-600 dark:text-purple-400'>
                Original Action
              </div>
              <p className='text-sm text-purple-900 dark:text-purple-100'>
                "Cooked a healthy meal for my family"
              </p>
            </div>

            {/* Connector */}
            <div className='h-8 w-0.5 bg-purple-200 dark:bg-purple-800' />

            {/* Joined 1 */}
            <div className='w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
              <div className='mb-2 flex items-center gap-2'>
                <span className='text-xs'>🌱</span>
                <span className='text-xs font-semibold text-purple-600 dark:text-purple-400'>
                  Joined @originaluser
                </span>
              </div>
              <p className='text-sm text-gray-900 dark:text-white'>
                "I joined @originaluser in: Made a nutritious dinner tonight"
              </p>
            </div>

            {/* Connector */}
            <div className='h-8 w-0.5 bg-purple-200 dark:bg-purple-800' />

            {/* Joined 2 */}
            <div className='w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
              <div className='mb-2 flex items-center gap-2'>
                <span className='text-xs'>🌱</span>
                <span className='text-xs font-semibold text-purple-600 dark:text-purple-400'>
                  Joined @originaluser
                </span>
              </div>
              <p className='text-sm text-gray-900 dark:text-white'>
                "I also cooked healthy! Made a big batch of soup"
              </p>
            </div>

            <div className='mt-4 text-center'>
              <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Impact is spreading! 🌱
              </p>
            </div>
          </div>
        </div>

        {user && (
          <div className='mt-8 text-center'>
            <Link href='/home'>
              <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-purple-700'>
                Start Creating Ripples
                <ArrowRight className='h-4 w-4' />
              </a>
            </Link>
          </div>
        )}
      </div>
    </SectionShell>
  );
}
