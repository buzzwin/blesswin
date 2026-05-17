import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { auth } from '@lib/firebase/app';
import { useBuzz } from '@lib/hooks/useBuzz';
import { getBuzzByToken } from '@lib/firebase/utils/buzz';
import { SignBuzzForm } from '@components/buzz/sign-buzz-form';
import { HeroIcon } from '@components/ui/hero-icon';
import { HeroWave, HeroWaveDark } from '@components/ui/illustrations';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', trip: '✈️',
  movie: '🎬', series: '📺', gamenight: '🎮', bookclub: '📚',
  diwali: '🪔', christmas: '🎄', eid: '🌙', custom: '✨'
};

const GROUP_OCCASIONS = new Set(['trip', 'movie', 'series', 'gamenight', 'bookclub']);

function buzzHeading(buzz: { occasion: string; recipientName: string }): string {
  return GROUP_OCCASIONS.has(buzz.occasion)
    ? `${buzz.recipientName} Buzzbook`
    : `${buzz.recipientName}'s Buzzbook`;
}

// Serialisable subset of Buzz — used only for SSR meta tags
type BuzzMeta = {
  title: string;
  recipientName: string;
  occasion: string;
  totalSignatures: number;
  revealAtISO: string;
};

type Props = {
  initialMeta: BuzzMeta | null;
};

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Props>> {
  const { token } = context.params ?? {};
  if (typeof token !== 'string') return { props: { initialMeta: null } };

  try {
    const buzz = await getBuzzByToken(token);
    if (!buzz) return { props: { initialMeta: null } };

    return {
      props: {
        initialMeta: {
          title: buzz.title,
          recipientName: buzz.recipientName,
          occasion: buzz.occasion,
          totalSignatures: buzz.totalSignatures,
          revealAtISO: buzz.revealAt.toDate().toISOString()
        }
      }
    };
  } catch {
    return { props: { initialMeta: null } };
  }
}

const SITE_URL = 'https://buzzwin.com';
const OG_IMAGE = `${SITE_URL}/assets/buzzbook-og.svg`;

export default function SignBuzzPage({ initialMeta }: Props): JSX.Element {
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : null;
  const { buzz, loading, notFound } = useBuzz(token);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/b/${token ?? ''}`
    : `${SITE_URL}/b/${token ?? ''}`;

  const alreadySigned =
    !!auth.currentUser?.uid && !!buzz?.signedBy.includes(auth.currentUser.uid);

  const isRevealed = buzz?.status === 'revealed';
  const isPastReveal = buzz ? Date.now() >= buzz.revealAt.toMillis() : false;

  const emoji = buzz ? (OCCASION_EMOJI[buzz.occasion] ?? '✨') : '📖';
  const revealDate = buzz?.revealAt.toDate().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  // Build meta from SSR data — always accurate for social crawlers
  const metaRevealDate = initialMeta
    ? new Date(initialMeta.revealAtISO).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      })
    : null;

  const metaTitle = initialMeta
    ? `${OCCASION_EMOJI[initialMeta.occasion] ?? '📖'} ${initialMeta.title}`
    : 'Join a Buzzbook — Buzzwin';

  const metaDescription = initialMeta
    ? `${initialMeta.totalSignatures} ${initialMeta.totalSignatures === 1 ? 'page' : 'pages'} added · ${GROUP_OCCASIONS.has(initialMeta.occasion) ? 'Opens' : 'Reveals'} ${metaRevealDate} · Add yours now`
    : 'Add your page to a group Buzzbook — messages and photos, revealed together.';

  const pageUrl = `${SITE_URL}/b/${token ?? ''}`;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        {/* Open Graph — what WhatsApp / iMessage / Telegram read */}
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Buzzwin' />
        <meta property='og:url' content={pageUrl} />
        <meta property='og:title' content={metaTitle} />
        <meta property='og:description' content={metaDescription} />
        <meta property='og:image' content={OG_IMAGE} />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:image:type' content='image/svg+xml' />

        {/* Twitter / X card */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@Buzzwin' />
        <meta name='twitter:title' content={metaTitle} />
        <meta name='twitter:description' content={metaDescription} />
        <meta name='twitter:image' content={OG_IMAGE} />

        <meta name='theme-color' content='#C97D60' />
      </Head>

      <div className='min-h-screen bg-[#f5f1ea] dark:bg-[#110d07]'>
        {/* Minimal top bar */}
        <header className='flex items-center justify-between border-b border-[#e8d8c4] bg-[#faf8f4] px-4 py-3 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
          <Link href='/'>
            <a className='font-display text-lg font-bold text-[#1a1108] dark:text-[#F5EFE6]'>Buzzwin</a>
          </Link>
          <Link href='/buzzes/new'>
            <a className='text-sm text-[#6b5744] transition hover:text-[#C9A96E] dark:text-[#9E8B76] dark:hover:text-[#C9A96E]'>
              Start your own →
            </a>
          </Link>
        </header>

        {/* Hero banner */}
        {!loading && buzz && (
          <div className='relative overflow-hidden text-center' style={{ background: 'linear-gradient(135deg, #C97D60 0%, #B56540 60%, #8a4020 100%)' }}>
            {/* SVG scatter decoration */}
            <svg viewBox='0 0 400 140' fill='none' xmlns='http://www.w3.org/2000/svg' className='pointer-events-none absolute inset-0 h-full w-full' aria-hidden='true'>
              {/* Sparkles */}
              <path d='M38,28 L40,22 L42,28 L48,30 L42,32 L40,38 L38,32 L32,30 Z' fill='rgba(245,239,230,0.22)' />
              <path d='M362,18 L363.6,14 L365.2,18 L369.2,19.6 L365.2,21.2 L363.6,25.2 L362,21.2 L358,19.6 Z' fill='rgba(245,239,230,0.18)' />
              <path d='M18,85 L19.2,82 L20.4,85 L23.4,86.2 L20.4,87.4 L19.2,90.4 L18,87.4 L15,86.2 Z' fill='rgba(245,239,230,0.16)' />
              <path d='M380,70 L381,68 L382,70 L384,71 L382,72 L381,74 L380,72 L378,71 Z' fill='rgba(245,239,230,0.2)' />
              {/* Dots */}
              <circle cx='60' cy='15' r='3' fill='rgba(245,239,230,0.12)' />
              <circle cx='340' cy='110' r='2.5' fill='rgba(245,239,230,0.1)' />
              <circle cx='20' cy='50' r='2' fill='rgba(245,239,230,0.1)' />
              <circle cx='385' cy='45' r='2' fill='rgba(245,239,230,0.12)' />
              <circle cx='200' cy='8' r='3' fill='rgba(245,239,230,0.1)' />
              {/* Subtle grid lines */}
              <line x1='0' y1='0' x2='400' y2='140' stroke='rgba(245,239,230,0.03)' strokeWidth='40' />
              <line x1='400' y1='0' x2='0' y2='140' stroke='rgba(245,239,230,0.03)' strokeWidth='40' />
            </svg>

            <div className='relative px-4 py-10'>
              <span className='text-5xl'>{emoji}</span>
              <h1 className='mt-3 font-display text-3xl font-extrabold leading-tight text-[#F5EFE6] sm:text-4xl'>
                {buzzHeading(buzz)}
              </h1>
              <p className='mt-2 text-[rgba(245,239,230,0.75)]'>
                {buzz.totalSignatures}{' '}
                {buzz.totalSignatures === 1 ? 'page' : 'pages'} added ·{' '}
                {GROUP_OCCASIONS.has(buzz.occasion) ? 'Opens' : 'Reveals'}{' '}
                {revealDate}
              </p>
            </div>

            {/* Wave transition — light/dark */}
            <span className='dark:hidden'><HeroWave /></span>
            <span className='hidden dark:block'><HeroWaveDark /></span>
          </div>
        )}

        <main className='mx-auto max-w-md px-4 py-6'>
          {/* ── Loading ── */}
          {loading && (
            <div className='flex flex-col items-center gap-3 py-24 text-[#9E8B76]'>
              <HeroIcon iconName='ArrowPathIcon' className='h-8 w-8 animate-spin' />
              <span className='text-sm'>Loading…</span>
            </div>
          )}

          {/* ── Not found ── */}
          {!loading && notFound && (
            <div className='flex flex-col items-center gap-4 py-24 text-center'>
              <span className='text-5xl'>🤔</span>
              <div>
                <p className='font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>
                  This Buzz doesn&apos;t exist
                </p>
                <p className='mt-1 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                  The link might be wrong or the Buzz was deleted.
                </p>
              </div>
              <Link href='/'>
                <a className='text-sm font-medium text-[#C9A96E] hover:text-[#E8B86D]'>
                  Go to Buzzwin
                </a>
              </Link>
            </div>
          )}

          {/* ── Buzz found ── */}
          {!loading && buzz && (
            <div className='space-y-4'>
              {/* ── Already revealed ── */}
              {(isRevealed || isPastReveal) && (
                <div className='rounded-2xl border-2 border-[rgba(201,169,110,0.4)] bg-[rgba(201,169,110,0.06)] p-6 text-center dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.08)]'>
                  <span className='text-3xl'>📖</span>
                  <p className='mt-2 font-display font-bold text-[#8a6520] dark:text-[#C9A96E]'>
                    The Buzzbook is open!
                  </p>
                  <Link href={`/buzzes/${buzz.id}/reveal`}>
                    <a className='mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#C97D60] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B56540]'>
                      Open the Buzzbook
                      <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
                    </a>
                  </Link>
                </div>
              )}

              {/* ── Already signed ── */}
              {!isRevealed && !isPastReveal && alreadySigned && (
                <div className='rounded-2xl border-2 border-[rgba(156,175,136,0.4)] bg-[rgba(156,175,136,0.06)] p-6 text-center dark:border-[rgba(156,175,136,0.3)] dark:bg-[rgba(156,175,136,0.08)]'>
                  <span className='text-3xl'>{OCCASION_EMOJI[buzz.occasion] ?? '✅'}</span>
                  <p className='mt-2 font-display font-bold text-[#5a7a48] dark:text-[#9CAF88]'>
                    {GROUP_OCCASIONS.has(buzz.occasion)
                      ? 'Your page is in!'
                      : "You've already added your page!"}
                  </p>
                  <p className='mt-1 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    {GROUP_OCCASIONS.has(buzz.occasion)
                      ? 'Share the link so others can add their page too.'
                      : 'Know someone else who should add theirs?'}
                  </p>
                  <button
                    onClick={() => void navigator.clipboard.writeText(shareUrl)}
                    className='mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[rgba(156,175,136,0.3)] bg-[#faf8f4] px-4 py-2 text-sm font-medium text-[#5a7a48] transition hover:bg-[rgba(156,175,136,0.1)] dark:border-[rgba(156,175,136,0.2)] dark:bg-[#1c1510] dark:text-[#9CAF88]'
                  >
                    <HeroIcon iconName='LinkIcon' className='h-3.5 w-3.5' />
                    Copy link to share
                  </button>
                </div>
              )}

              {/* ── Sign form ── */}
              {!isRevealed && !isPastReveal && !alreadySigned && (
                <div className='rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-6 shadow-sm dark:border-[#2a1d10] dark:bg-[#1c1510]'>
                  <h2 className='mb-1 font-display text-xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
                    {GROUP_OCCASIONS.has(buzz.occasion)
                      ? `Leave your page in the ${buzz.recipientName} Buzzbook 📖`
                      : `Leave a page for ${buzz.recipientName} 📖`}
                  </h2>
                  <p className='mb-5 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    {GROUP_OCCASIONS.has(buzz.occasion)
                      ? "Write a memory, share a photo. Everyone's pages are revealed together."
                      : "A message, a memory, a photo — anything goes. It'll be a surprise."}
                  </p>
                  <SignBuzzForm buzz={buzz} shareUrl={shareUrl} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
