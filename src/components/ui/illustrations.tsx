// Decorative SVG illustrations — warm bohemian palette (#C9A96E amber, #C97D60 terracotta, #9CAF88 sage)

/** Generic empty-state illustration — subtle dashed circle with dots. Works on light and dark. */
export function EmptyStateIllustration(): JSX.Element {
  return (
    <svg
      viewBox='0 0 120 112'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='mx-auto h-24 w-24'
      aria-hidden='true'
    >
      {/* Dashed outer ring */}
      <circle cx='60' cy='56' r='42' stroke='rgba(201,169,110,0.22)' strokeWidth='1.5' strokeDasharray='5,7' />
      {/* Inner ring */}
      <circle cx='60' cy='56' r='30' stroke='rgba(201,169,110,0.12)' strokeWidth='1' />
      {/* Three dots */}
      <circle cx='60' cy='46' r='4.5' fill='rgba(201,169,110,0.38)' />
      <circle cx='47' cy='64' r='4' fill='rgba(201,169,110,0.28)' />
      <circle cx='73' cy='64' r='4' fill='rgba(181,96,60,0.3)' />
      {/* Sparkle above */}
      <path d='M60,6 L61.4,2.5 L62.8,6 L66.3,7.4 L62.8,8.8 L61.4,12.3 L60,8.8 L56.5,7.4 Z' fill='rgba(201,169,110,0.55)' />
      {/* Scatter dots */}
      <circle cx='18' cy='48' r='2.5' fill='rgba(201,169,110,0.18)' />
      <circle cx='102' cy='60' r='2' fill='rgba(201,169,110,0.18)' />
      <circle cx='60' cy='104' r='2.5' fill='rgba(201,169,110,0.14)' />
      <circle cx='100' cy='26' r='2' fill='rgba(201,169,110,0.16)' />
      <circle cx='20' cy='80' r='1.5' fill='rgba(181,96,60,0.16)' />
    </svg>
  );
}

/** Open book with three floating pages. Designed for dark backgrounds (login page). */
export function OpenBookHero(): JSX.Element {
  return (
    <svg
      viewBox='0 0 400 220'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='mx-auto w-full max-w-[380px]'
      aria-hidden='true'
    >
      <defs>
        <linearGradient id='obh-page' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#C9A96E' stopOpacity='0.22' />
          <stop offset='100%' stopColor='#C97D60' stopOpacity='0.1' />
        </linearGradient>
      </defs>

      {/* ── Open book ── */}
      <path d='M58,170 Q118,152 188,164 L188,226 Q118,216 58,226 Z' fill='url(#obh-page)' stroke='rgba(201,169,110,0.38)' strokeWidth='1.5' />
      <path d='M192,164 Q262,152 322,170 L322,226 Q262,216 192,226 Z' fill='url(#obh-page)' stroke='rgba(201,169,110,0.38)' strokeWidth='1.5' />
      <line x1='190' y1='158' x2='190' y2='230' stroke='rgba(201,169,110,0.55)' strokeWidth='3' strokeLinecap='round' />

      {/* Left page rules */}
      <line x1='78' y1='185' x2='168' y2='183' stroke='rgba(201,169,110,0.22)' strokeWidth='1.5' strokeLinecap='round' />
      <line x1='78' y1='197' x2='168' y2='195' stroke='rgba(201,169,110,0.16)' strokeWidth='1.5' strokeLinecap='round' />
      <line x1='78' y1='209' x2='138' y2='207' stroke='rgba(201,169,110,0.11)' strokeWidth='1.5' strokeLinecap='round' />

      {/* Right page rules */}
      <line x1='212' y1='183' x2='302' y2='185' stroke='rgba(201,169,110,0.22)' strokeWidth='1.5' strokeLinecap='round' />
      <line x1='212' y1='195' x2='302' y2='197' stroke='rgba(201,169,110,0.16)' strokeWidth='1.5' strokeLinecap='round' />
      <line x1='212' y1='207' x2='272' y2='209' stroke='rgba(201,169,110,0.11)' strokeWidth='1.5' strokeLinecap='round' />

      {/* ── Floating page 1 — message (left, tilted) ── */}
      <g transform='translate(56,52) rotate(-11)'>
        <rect x='0' y='0' width='76' height='96' rx='10' fill='rgba(255,248,235,0.07)' stroke='rgba(201,169,110,0.3)' strokeWidth='1.5' />
        <rect x='14' y='22' width='48' height='5' rx='2.5' fill='rgba(201,169,110,0.42)' />
        <rect x='14' y='34' width='36' height='5' rx='2.5' fill='rgba(201,169,110,0.28)' />
        <rect x='14' y='46' width='44' height='5' rx='2.5' fill='rgba(201,169,110,0.2)' />
        <circle cx='22' cy='72' r='7' fill='rgba(181,96,60,0.38)' />
        <rect x='35' y='68' width='28' height='4' rx='2' fill='rgba(201,169,110,0.24)' />
        <rect x='35' y='76' width='20' height='4' rx='2' fill='rgba(201,169,110,0.15)' />
      </g>

      {/* ── Floating page 2 — photo (centre, slight tilt) ── */}
      <g transform='translate(152,14) rotate(4)'>
        <rect x='0' y='0' width='76' height='96' rx='10' fill='rgba(255,248,235,0.07)' stroke='rgba(201,169,110,0.3)' strokeWidth='1.5' />
        <rect x='12' y='16' width='52' height='40' rx='6' fill='rgba(201,169,110,0.1)' stroke='rgba(201,169,110,0.26)' strokeWidth='1.2' />
        <path d='M12,53 L26,35 L38,47 L50,30 L64,53 Z' fill='rgba(201,169,110,0.28)' />
        <circle cx='54' cy='24' r='6' fill='rgba(201,169,110,0.38)' />
        <rect x='12' y='66' width='38' height='4' rx='2' fill='rgba(201,169,110,0.28)' />
        <rect x='12' y='76' width='28' height='4' rx='2' fill='rgba(201,169,110,0.17)' />
      </g>

      {/* ── Floating page 3 — heart (right, tilted) ── */}
      <g transform='translate(248,46) rotate(13)'>
        <rect x='0' y='0' width='76' height='96' rx='10' fill='rgba(255,248,235,0.07)' stroke='rgba(201,169,110,0.3)' strokeWidth='1.5' />
        <path d='M38,28 C38,24 34,20 30,22 C26,20 22,24 22,28 C22,35 30,43 38,50 C46,43 54,35 54,28 C54,24 50,20 46,22 C42,20 38,24 38,28 Z' fill='rgba(181,96,60,0.42)' />
        <rect x='14' y='62' width='48' height='4' rx='2' fill='rgba(201,169,110,0.28)' />
        <rect x='20' y='72' width='36' height='4' rx='2' fill='rgba(201,169,110,0.18)' />
        <rect x='24' y='82' width='28' height='4' rx='2' fill='rgba(201,169,110,0.11)' />
      </g>

      {/* ── Dashed flow lines ── */}
      <path d='M94,148 Q94,162 136,167' stroke='rgba(201,169,110,0.18)' strokeWidth='1.5' strokeDasharray='3,5' fill='none' />
      <path d='M190,110 L190,157' stroke='rgba(201,169,110,0.18)' strokeWidth='1.5' strokeDasharray='3,5' fill='none' />
      <path d='M286,142 Q266,158 244,168' stroke='rgba(201,169,110,0.18)' strokeWidth='1.5' strokeDasharray='3,5' fill='none' />

      {/* ── 4-pointed sparkles ── */}
      <path d='M34,46 L36.2,40 L38.4,46 L44.4,48.2 L38.4,50.4 L36.2,56.4 L34,50.4 L28,48.2 Z' fill='rgba(201,169,110,0.55)' />
      <path d='M340,22 L342,17 L344,22 L349,24 L344,26 L342,31 L340,26 L335,24 Z' fill='rgba(201,169,110,0.45)' />
      <path d='M368,112 L369.4,108 L370.8,112 L374.8,113.4 L370.8,114.8 L369.4,118.8 L368,114.8 L364,113.4 Z' fill='rgba(181,96,60,0.4)' />
      <path d='M18,130 L19.2,127 L20.4,130 L23.4,131.2 L20.4,132.4 L19.2,135.4 L18,132.4 L15,131.2 Z' fill='rgba(156,175,136,0.5)' />

      {/* ── Scatter dots ── */}
      <circle cx='46' cy='112' r='2.5' fill='rgba(201,169,110,0.28)' />
      <circle cx='346' cy='90' r='2' fill='rgba(181,96,60,0.28)' />
      <circle cx='152' cy='6' r='2.5' fill='rgba(201,169,110,0.38)' />
      <circle cx='252' cy='8' r='3.5' fill='rgba(156,175,136,0.32)' />
      <circle cx='374' cy='160' r='2' fill='rgba(201,169,110,0.22)' />
      <circle cx='18' cy='90' r='1.5' fill='rgba(201,169,110,0.2)' />
    </svg>
  );
}

/** Closed book illustration for the "No Buzzes yet" empty state. Works on light and dark. */
export function EmptyBuzzesIllustration(): JSX.Element {
  return (
    <svg
      viewBox='0 0 180 160'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='mx-auto h-36 w-36'
      aria-hidden='true'
    >
      {/* Book body */}
      <rect x='44' y='38' width='92' height='104' rx='8' fill='rgba(201,169,110,0.12)' stroke='rgba(201,169,110,0.38)' strokeWidth='1.5' />
      {/* Spine */}
      <rect x='44' y='38' width='14' height='104' rx='7' fill='rgba(181,96,60,0.18)' stroke='rgba(181,96,60,0.32)' strokeWidth='1.2' />
      {/* Spine highlight */}
      <rect x='47' y='50' width='5' height='80' rx='2.5' fill='rgba(181,96,60,0.15)' />

      {/* Cover decoration */}
      <line x1='70' y1='72' x2='124' y2='72' stroke='rgba(201,169,110,0.32)' strokeWidth='1.5' strokeLinecap='round' />
      <line x1='70' y1='84' x2='110' y2='84' stroke='rgba(201,169,110,0.22)' strokeWidth='1.5' strokeLinecap='round' />
      <line x1='70' y1='96' x2='118' y2='96' stroke='rgba(201,169,110,0.16)' strokeWidth='1.5' strokeLinecap='round' />

      {/* Bookmark ribbon */}
      <path d='M116,38 L116,66 L110,58 L104,66 L104,38 Z' fill='rgba(181,96,60,0.45)' />

      {/* Centre star on cover */}
      <path d='M90,112 L91.8,107 L93.6,112 L98.6,113.8 L93.6,115.6 L91.8,120.6 L90,115.6 L85,113.8 Z' fill='rgba(201,169,110,0.35)' />

      {/* Sparkle above */}
      <path d='M90,18 L92,12 L94,18 L100,20 L94,22 L92,28 L90,22 L84,20 Z' fill='rgba(201,169,110,0.62)' />

      {/* Small side sparkles */}
      <path d='M40,34 L41.2,31 L42.4,34 L45.4,35.2 L42.4,36.4 L41.2,39.4 L40,36.4 L37,35.2 Z' fill='rgba(201,169,110,0.42)' />
      <path d='M138,30 L139,28 L140,30 L142,31 L140,32 L139,34 L138,32 L136,31 Z' fill='rgba(181,96,60,0.42)' />

      {/* Scatter dots */}
      <circle cx='34' cy='88' r='3' fill='rgba(201,169,110,0.2)' />
      <circle cx='146' cy='78' r='2.5' fill='rgba(156,175,136,0.24)' />
      <circle cx='148' cy='120' r='2' fill='rgba(201,169,110,0.18)' />
      <circle cx='32' cy='130' r='2' fill='rgba(181,96,60,0.18)' />
      <circle cx='152' cy='52' r='1.5' fill='rgba(201,169,110,0.22)' />
    </svg>
  );
}

/** Subtle wave divider — terracotta gradient fades to page background. */
export function HeroWave(): JSX.Element {
  return (
    <svg
      viewBox='0 0 1200 48'
      preserveAspectRatio='none'
      xmlns='http://www.w3.org/2000/svg'
      className='block h-10 w-full'
      aria-hidden='true'
    >
      <path
        d='M0,28 C200,52 400,4 600,28 C800,52 1000,4 1200,28 L1200,48 L0,48 Z'
        fill='#f5f1ea'
      />
    </svg>
  );
}

/** Same wave for dark mode. */
export function HeroWaveDark(): JSX.Element {
  return (
    <svg
      viewBox='0 0 1200 48'
      preserveAspectRatio='none'
      xmlns='http://www.w3.org/2000/svg'
      className='block h-10 w-full'
      aria-hidden='true'
    >
      <path
        d='M0,28 C200,52 400,4 600,28 C800,52 1000,4 1200,28 L1200,48 L0,48 Z'
        fill='#110d07'
      />
    </svg>
  );
}

/** Decorative corner ornaments + dashed halo ring — overlaid on the Buzzbook cover page. */
export function BuzzbookCoverOrnament(): JSX.Element {
  return (
    <svg
      viewBox='0 0 300 300'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='pointer-events-none absolute inset-0 h-full w-full'
      aria-hidden='true'
    >
      {/* Dashed halo ring centred at (150,125) — behind the emoji */}
      <circle cx='150' cy='120' r='56' stroke='rgba(201,169,110,0.22)' strokeWidth='1.5' strokeDasharray='5,7' />
      <circle cx='150' cy='120' r='46' stroke='rgba(201,169,110,0.12)' strokeWidth='1' />

      {/* Corner ornament — top-left */}
      <path d='M22,22 L22,52' stroke='rgba(201,169,110,0.4)' strokeWidth='2' strokeLinecap='round' />
      <path d='M22,22 L52,22' stroke='rgba(201,169,110,0.4)' strokeWidth='2' strokeLinecap='round' />
      <path d='M28,28 L28,44' stroke='rgba(201,169,110,0.18)' strokeWidth='1' strokeLinecap='round' />
      <path d='M28,28 L44,28' stroke='rgba(201,169,110,0.18)' strokeWidth='1' strokeLinecap='round' />

      {/* Corner ornament — top-right */}
      <path d='M278,22 L278,52' stroke='rgba(201,169,110,0.4)' strokeWidth='2' strokeLinecap='round' />
      <path d='M278,22 L248,22' stroke='rgba(201,169,110,0.4)' strokeWidth='2' strokeLinecap='round' />
      <path d='M272,28 L272,44' stroke='rgba(201,169,110,0.18)' strokeWidth='1' strokeLinecap='round' />
      <path d='M272,28 L256,28' stroke='rgba(201,169,110,0.18)' strokeWidth='1' strokeLinecap='round' />

      {/* Corner ornament — bottom-left */}
      <path d='M22,278 L22,248' stroke='rgba(201,169,110,0.4)' strokeWidth='2' strokeLinecap='round' />
      <path d='M22,278 L52,278' stroke='rgba(201,169,110,0.4)' strokeWidth='2' strokeLinecap='round' />

      {/* Corner ornament — bottom-right */}
      <path d='M278,278 L278,248' stroke='rgba(201,169,110,0.4)' strokeWidth='2' strokeLinecap='round' />
      <path d='M278,278 L248,278' stroke='rgba(201,169,110,0.4)' strokeWidth='2' strokeLinecap='round' />

      {/* Sparkle — top-centre */}
      <path d='M150,50 L152,44 L154,50 L160,52 L154,54 L152,60 L150,54 L144,52 Z' fill='rgba(201,169,110,0.5)' />
      {/* Sparkle — left */}
      <path d='M52,108 L53.4,104.5 L54.8,108 L58.3,109.4 L54.8,110.8 L53.4,114.3 L52,110.8 L48.5,109.4 Z' fill='rgba(201,169,110,0.4)' />
      {/* Sparkle — right */}
      <path d='M246,96 L247.2,93 L248.4,96 L251.4,97.2 L248.4,98.4 L247.2,101.4 L246,98.4 L243,97.2 Z' fill='rgba(181,96,60,0.38)' />

      {/* Scatter dots */}
      <circle cx='38' cy='150' r='3' fill='rgba(201,169,110,0.18)' />
      <circle cx='262' cy='140' r='2.5' fill='rgba(201,169,110,0.18)' />
      <circle cx='150' cy='206' r='3' fill='rgba(201,169,110,0.15)' />
    </svg>
  );
}
