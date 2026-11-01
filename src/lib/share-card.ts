import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

interface Card {
  eyebrow: string;
  title: string;
  body: string;
}

// Satori turns text into paths, so the card does not depend on which fonts the
// build machine has. It reads woff but not woff2, hence fontsource.
const font = (path: string) => readFile(join(process.cwd(), 'node_modules/@fontsource', path));

const fonts = Promise.all([
  font('inter-tight/files/inter-tight-latin-600-normal.woff'),
  font('inter/files/inter-latin-400-normal.woff'),
  font('ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff')
]);

const el = (style: Record<string, unknown>, children: unknown) => ({
  type: 'div',
  props: { style, children }
});

export async function renderCard({ eyebrow, title, body }: Card) {
  const [display, sans, mono] = await fonts;
  const label = {
    fontFamily: 'IBM Plex Mono',
    fontSize: 24,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#8d959d'
  };

  const svg = await satori(
    el(
      {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 64,
        backgroundColor: '#101215',
        color: '#eceef0',
        fontFamily: 'Inter'
      },
      [
        el(label, eyebrow),
        el({ display: 'flex', flexDirection: 'column' }, [
          el(
            {
              fontFamily: 'Inter Tight',
              fontSize: title.length > 40 ? 68 : 80,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              textWrap: 'balance'
            },
            title
          ),
          el(
            {
              display: 'block',
              lineClamp: 3,
              marginTop: 28,
              fontSize: 32,
              lineHeight: 1.4,
              color: '#b6bcc2'
            },
            body
          )
        ]),
        el({ ...label, fontSize: 22, display: 'flex', justifyContent: 'space-between' }, [
          el({}, 'buzzwin.com'),
          el({ color: '#8fb8d6' }, 'Written by Claude, an AI')
        ])
      ]
    ) as Parameters<typeof satori>[0],
    {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      fonts: [
        { name: 'Inter Tight', data: display, weight: 600, style: 'normal' },
        { name: 'Inter', data: sans, weight: 400, style: 'normal' },
        { name: 'IBM Plex Mono', data: mono, weight: 500, style: 'normal' }
      ]
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
