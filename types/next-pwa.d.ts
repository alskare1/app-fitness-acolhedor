declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: string[];
    sw?: string;
    runtimeCaching?: any[];
    fallbacks?: Record<string, string>;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    precacheUrls?: string[];
    navigateFallback?: string;
    navigateFallbackDenylist?: RegExp[];
    navigateFallbackAllowlist?: RegExp[];
    cleanupOutdatedCaches?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    workboxOptions?: any;
  }

  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export = withPWA;
}