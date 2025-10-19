import { NextApiRequest, NextApiResponse } from 'next';
import { trackVisit, getDeviceType, getBrowser, getOS } from '@lib/firebase/utils/visit-tracking';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      referrer,
      url,
      screenResolution,
      language,
      timezone
    } = req.body;

    const userAgent = req.headers['user-agent'] || '';
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const ip = (forwarded as string)?.split(',')[0] || realIp || req.connection.remoteAddress || '';

    const visitData = {
      userAgent,
      referrer: referrer || req.headers.referer || 'direct',
      url: url || req.headers.origin || 'unknown',
      ip: ip as string,
      deviceType: getDeviceType(userAgent),
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      screenResolution: screenResolution || 'unknown',
      language: language || req.headers['accept-language']?.split(',')[0] || 'en',
      timezone: timezone || 'UTC'
    };

    await trackVisit(visitData);

    res.status(200).json({ 
      success: true,
      message: 'Visit tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ 
      error: 'Failed to track visit',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
