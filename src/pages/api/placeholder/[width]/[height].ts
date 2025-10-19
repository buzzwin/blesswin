import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  const { width, height } = req.query;
  
  const w = parseInt(width as string) || 300;
  const h = parseInt(height as string) || 450;
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="10" y="10" width="${w-20}" height="${h-20}" fill="none" stroke="white" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="50%" y="50%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
        No Image
      </text>
      <text x="50%" y="60%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.8">
        ${w} × ${h}
      </text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  res.status(200).send(svg);
}
