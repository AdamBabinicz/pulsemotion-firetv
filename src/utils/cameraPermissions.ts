/**
 * Runtime CAMERA permission bridge for the Cordova (Fire OS / Android) build.
 *
 * Why this exists (hackathon requirement W7):
 *   Android 6+ (Fire OS 5+) requires an explicit runtime permission request
 *   before getUserMedia can open the camera inside the Cordova WebView.
 *   The manifest entry in cordova/config.xml only *declares* the permission —
 *   without `cordova-plugin-android-permissions` the system silently denies
 *   the request and the user sees "Camera Access Denied" instead of a prompt.
 *
 * Safety: every path is guarded so that the pure web/Vite build (browser,
 * Silk on Fire TV without the native shell) is untouched — when
 * `window.cordova` is absent the promise resolves immediately and the
 * browser's own permission flow / getUserMedia error handling applies.
 */

declare global {
  interface Window {
    cordova?: {
      plugins?: {
        permissions?: {
          CAMERA: string;
          hasPermission: (
            permission: string,
            success: (status: boolean) => void,
            error?: (err: unknown) => void,
          ) => void;
          requestPermission: (
            permission: string,
            success: (status: Array<{ hasPermission: boolean }> | boolean) => void,
            error: (err: unknown) => void,
          ) => void;
        };
      };
    };
  }
}

/**
 * Request the CAMERA runtime permission through the native Cordova bridge.
 *
 * Resolves:
 *   true  → permission granted (or bridge absent: browser build — defer to
 *           getUserMedia), safe to call getUserMedia,
 *   false → user (or system) denied the request — UI should show the
 *           "cameraDenied" state and offer the AI Simulation fallback.
 */
export function requestCameraRuntimePermission(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const perms =
      typeof window !== "undefined"
        ? window.cordova?.plugins?.permissions
        : undefined;

    // Browser / Vite dev build: no native bridge → let the Web permission
    // flow handle it exactly as before.
    if (!perms || typeof perms.requestPermission !== "function") {
      resolve(true);
      return;
    }

    try {
      perms.hasPermission(
        perms.CAMERA,
        (alreadyGranted) => {
          if (alreadyGranted) {
            resolve(true);
            return;
          }
          perms.requestPermission(
            perms.CAMERA,
            (status) => {
              const first = Array.isArray(status) ? status[0] : status;
              const granted =
                first === undefined ||
                first === null ||
                (typeof first === "object" ? first.hasPermission !== false : true);
              resolve(granted);
            },
            () => resolve(false),
          );
        },
        () => resolve(false),
      );
    } catch {
      // Any bridge misbehaviour must never brick the workout — fall back to
      // the web flow (getUserMedia will surface a readable error if denied).
      resolve(true);
    }
  });
}
