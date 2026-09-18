/**
 * Fire TV / Fire OS capability detection (hackathon requirement W14).
 *
 * A thin, dependency-free module that identifies Amazon Fire TV / Fire OS
 * environments so the app can adapt its UX (auto-fallback to AI Simulation
 * on camera-less Sticks) and so the codebase demonstrably integrates with
 * the Fire TV platform — without pulling in any unverified `@amazon*` npm
 * package that could break `npm run build`.
 *
 * Detection signals (all passive, no network, no permissions):
 *  - Fire TV device user agents contain an "AFT" build code
 *    (e.g. "AFTMM", "AFTS", "AFTR") — the documented Fire TV marker.
 *  - The Amazon Silk browser UA contains "Silk".
 *  - The Android WebView / Cordova shell is detected via `window.cordova`.
 *  - Fire TV remote media keycodes (KEYCODE_MEDIA_REWIND 89,
 *    KEYCODE_MEDIA_FAST_FORWARD 90, Fire TV track-previous 227,
 *    track-next 228) are mapped for reference; the active key handling
 *    lives in `tvNavigation.ts` (TV_KEYCODE_MAP).
 */

export type TvPlatform = "cordova-android" | "browser";

export interface TvEnvironment {
  /** Amazon Fire TV / Fire TV Stick device (AFT* build code in UA). */
  isFireTv: boolean;
  /** Any Amazon device / Fire OS signature in the UA. */
  isAmazonDevice: boolean;
  /** Amazon Silk browser (Fire TV system webview or Silk on desktop). */
  isSilkBrowser: boolean;
  /** Android TV-shaped environment (Fire TV included). */
  isAndroidTv: boolean;
  /** Superset flag: treat the device as a TV (D-pad-first UX). */
  isTvLike: boolean;
  /** Native Cordova shell vs. plain browser build. */
  platform: TvPlatform;
}

/** Fire TV remote keycodes handled by the app (see tvNavigation.ts). */
export const FIRE_TV_REMOTE_KEYCODES = {
  KEYCODE_MEDIA_REWIND: 89,
  KEYCODE_MEDIA_FAST_FORWARD: 90,
  FIRE_TV_TRACK_PREVIOUS: 227,
  FIRE_TV_TRACK_NEXT: 228,
} as const;

export function isFireTvRemoteKeyCode(keyCode: number): boolean {
  return Object.values(FIRE_TV_REMOTE_KEYCODES).includes(
    keyCode as (typeof FIRE_TV_REMOTE_KEYCODES)[keyof typeof FIRE_TV_REMOTE_KEYCODES],
  );
}

export function detectTvEnvironment(
  userAgent: string =
    typeof navigator !== "undefined" ? navigator.userAgent : "",
): TvEnvironment {
  const ua = userAgent.toLowerCase();

  const isAmazonDevice =
    ua.includes("aft") ||
    ua.includes("fire tv") ||
    ua.includes("firetv") ||
    ua.includes("amazon");

  // Fire TV devices advertise an "AFT" build code in the UA string.
  // "aft" alone would false-positive on words containing it, so anchor it
  // to word boundaries: "aftm", "aft s/;"-style codes or "aft(" variants.
  const isFireTv = /aft[a-z0-9(;_\s-]/.test(ua) || ua.includes("fire tv");

  const isSilkBrowser = ua.includes("silk");

  const isAndroidTv =
    (ua.includes("android") && (ua.includes("tv") || isFireTv)) || isFireTv;

  const isCordova =
    typeof window !== "undefined" &&
    typeof window.cordova !== "undefined" &&
    window.cordova !== null;

  const isTvLike = isAndroidTv || (isSilkBrowser && isAmazonDevice);

  return {
    isFireTv,
    isAmazonDevice,
    isSilkBrowser,
    isAndroidTv,
    isTvLike,
    platform: isCordova ? "cordova-android" : "browser",
  };
}
