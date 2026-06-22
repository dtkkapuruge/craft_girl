'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Declare custom window properties for standard tracking scripts
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    ttq: any;
  }
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

// Reusable track functions that pages/components can call
export const trackEvent = (
  eventName: 'ViewContent' | 'AddToCart' | 'Purchase',
  data: {
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
  }
) => {
  const payload = {
    content_name: data.content_name,
    content_ids: data.content_ids,
    content_type: data.content_type || 'product',
    value: data.value || 0,
    currency: data.currency || 'LKR',
  };

  // Meta Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, payload);
    console.log(`[Meta Pixel] Tracked event "${eventName}":`, payload);
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(eventName, {
      content_name: payload.content_name,
      content_id: payload.content_ids?.[0], // TikTok expects content_id
      content_type: payload.content_type,
      value: payload.value,
      currency: payload.currency,
    });
    console.log(`[TikTok Pixel] Tracked event "${eventName}":`, payload);
  }
};

export default function PixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const w = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    // 1. Initialize Meta Pixel (Facebook)
    if (META_PIXEL_ID && !w.fbq) {
      const fbq: any = function (...args: any[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
        fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];

      w.fbq = fbq;
      w._fbq = fbq;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);

      w.fbq('init', META_PIXEL_ID);
      w.fbq('track', 'PageView');
    }

    // 2. Initialize TikTok Pixel
    if (TIKTOK_PIXEL_ID && !w.ttq) {
      const ttqMethods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off',
        'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
      ];

      const ttq: any = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      ttq.methods = ttqMethods;
      ttq.setAndDefer = (obj: any, method: string) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        obj[method] = (...args: any[]) => obj.push([method, ...args]); // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      ttqMethods.forEach((method) => ttq.setAndDefer(ttq, method));

      ttq.load = (sdkId: string) => {
        const pixelSrc = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[sdkId] = [];
        ttq._t = ttq._t || {};
        ttq._t[sdkId] = +new Date();
        ttq._o = ttq._o || {};

        const pixelScript = document.createElement('script');
        pixelScript.type = 'text/javascript';
        pixelScript.async = true;
        pixelScript.src = `${pixelSrc}?sdkid=${sdkId}`;
        document.head.appendChild(pixelScript);
      };

      w.ttq = ttq;
      w.ttq.load(TIKTOK_PIXEL_ID);
      w.ttq.page();
    }
  }, []);

  // 3. Track pageviews on route changes
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
    if (window.ttq) {
      window.ttq.page();
    }
  }, [pathname, searchParams]);

  return null; // This is a headless analytics provider component
}
