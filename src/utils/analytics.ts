// Privacy-friendly telemetry & analytics integration point
// Respects user privacy: zero PII collection, zero cookies, zero invasive third-party tracking.

export type AnalyticsEvent = 
  | 'start_chat'
  | 'match_found'
  | 'message_sent'
  | 'chat_ended'
  | 'page_view'
  | 'skip_chat';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private enabled: boolean = true;

  public track(event: AnalyticsEvent, properties?: EventProperties): void {
    if (!this.enabled) return;

    // Safely emit to window dataLayer if present (Google Tag Manager / Analytics)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event,
        ...properties,
        timestamp: Date.now()
      });
    }

    // In development or local debugging
    if ((import.meta as any).env?.DEV) {
      console.log(`[Analytics Event: ${event}]`, properties || {});
    }
  }

  public trackPageView(path: string, title: string): void {
    this.track('page_view', { path, title });
  }
}

export const analytics = new AnalyticsService();
