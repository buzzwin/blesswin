import { addDoc, serverTimestamp } from 'firebase/firestore';
import { visitsCollection } from '@lib/firebase/collections';

export interface VisitData {
  timestamp: any; // serverTimestamp
  userAgent: string;
  referrer: string;
  url: string;
  ip?: string;
  country?: string;
  city?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenResolution?: string;
  language: string;
  timezone: string;
}

export async function trackVisit(visitData: Omit<VisitData, 'timestamp'>): Promise<void> {
  try {
    await addDoc(visitsCollection, {
      ...visitData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking visit:', error);
    // Don't throw error to avoid breaking the user experience
  }
}

export function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  
  if (/tablet|ipad/.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

export function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome') && !ua.includes('edg')) {
    return 'Chrome';
  }
  if (ua.includes('firefox')) {
    return 'Firefox';
  }
  if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'Safari';
  }
  if (ua.includes('edg')) {
    return 'Edge';
  }
  if (ua.includes('opera')) {
    return 'Opera';
  }
  
  return 'Unknown';
}

export function getOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) {
    return 'Windows';
  }
  if (ua.includes('mac')) {
    return 'macOS';
  }
  if (ua.includes('linux')) {
    return 'Linux';
  }
  if (ua.includes('android')) {
    return 'Android';
  }
  if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    return 'iOS';
  }
  
  return 'Unknown';
}
