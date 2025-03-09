interface AnalyticsUser {
  anonymousId: () => string | null;
}

interface Analytics {
  _writeKey: string;
  page: () => void;
  track: (event: string, properties?: any) => void;
  identify: (userId: string, traits?: any) => void;
  group: (groupId: string, traits?: any) => void;
  user: () => AnalyticsUser;
}

declare global {
  interface Window {
    analytics: Analytics;
  }
}

export {}; 