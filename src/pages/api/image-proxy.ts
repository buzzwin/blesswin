import type { NextApiRequest, NextApiResponse } from 'next';

interface ImageProxyResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageProxyResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { url, fallback } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ success: false, error: 'URL parameter is required' });
    return;
  }

  try {
    // Try to fetch the original image
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD', // Only check if the image exists
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      // Image exists, return the original URL
      res.status(200).json({
        success: true,
        imageUrl: url
      });
    } else {
      // Image doesn't exist, use fallback
      const fallbackUrl = fallback as string || '/api/placeholder/300/450';
      res.status(200).json({
        success: true,
        imageUrl: fallbackUrl
      });
    }
  } catch (error) {
    // Network error or timeout, use fallback
    const fallbackUrl = fallback as string || '/api/placeholder/300/450';
    res.status(200).json({
      success: true,
      imageUrl: fallbackUrl
    });
  }
}
