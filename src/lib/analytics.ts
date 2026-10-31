import { isSupported, logEvent } from 'firebase/analytics';

type EventParams = Record<string, string | number | boolean | null>;

/**
 * Fire-and-forget analytics event.
 *
 * Mirrors the defensive pattern used for `page_view` in `_app.tsx`: client-only,
 * gated on `isSupported()`, and silent on failure so a blocked or unavailable
 * Analytics SDK can never break a user flow.
 */
export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;

  void isSupported()
    .then((supported) => {
      if (!supported) return;

      return import('firebase/analytics').then(({ getAnalytics }) => {
        logEvent(getAnalytics(), name, params);
      });
    })
    .catch(() => {
      // Silently fail - analytics must never block app functionality
    });
}
