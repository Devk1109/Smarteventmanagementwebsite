// Development mode utilities for testing without full OAuth setup

export const isDevelopmentMode = (): boolean => {
  // Check if we're in development or if Google OAuth isn't configured
  return import.meta.env.DEV || !import.meta.env.VITE_SUPABASE_URL;
};

export const createMockGoogleToken = (email: string): string => {
  return `mock-token-${email}-${Date.now()}`;
};

export const shouldUseMockAuth = (): boolean => {
  // Use mock auth if we're in dev mode and Google provider isn't set up
  return isDevelopmentMode();
};
