import { test } from "node:test";
import assert from "node:assert/strict";

import {
  detectTvEnvironment,
  isFireTvRemoteKeyCode,
  FIRE_TV_REMOTE_KEYCODES,
} from "./fireTvEnvironment";
import { requestCameraRuntimePermission } from "./cameraPermissions";

// ---------------------------------------------------------------------------
// fireTvEnvironment
// ---------------------------------------------------------------------------

test("detectTvEnvironment: Fire TV Stick UA (AFT build code) is detected", () => {
  const ua =
    "Mozilla/5.0 (Linux; Android 9; AFTMM Build/PS7664.3732N) AppleWebKit/537.36 (KHTML, like Gecko) Silk/114.1.165 like Chrome/114.0.5735.196 Safari/537.36";
  const env = detectTvEnvironment(ua);
  assert.equal(env.isFireTv, true);
  assert.equal(env.isSilkBrowser, true);
  assert.equal(env.isTvLike, true);
});

test("detectTvEnvironment: plain desktop browser UA is not TV-like", () => {
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
  const env = detectTvEnvironment(ua);
  assert.equal(env.isFireTv, false);
  assert.equal(env.isTvLike, false);
  assert.equal(env.isSilkBrowser, false);
});

test("detectTvEnvironment: platform defaults to browser without cordova", () => {
  const env = detectTvEnvironment("some-ua");
  assert.equal(env.platform, "browser");
});

test("isFireTvRemoteKeyCode: 89/90/227/228 map to the documented Fire TV keys", () => {
  assert.equal(
    isFireTvRemoteKeyCode(FIRE_TV_REMOTE_KEYCODES.KEYCODE_MEDIA_REWIND),
    true,
  );
  assert.equal(
    isFireTvRemoteKeyCode(FIRE_TV_REMOTE_KEYCODES.KEYCODE_MEDIA_FAST_FORWARD),
    true,
  );
  assert.equal(
    isFireTvRemoteKeyCode(FIRE_TV_REMOTE_KEYCODES.FIRE_TV_TRACK_PREVIOUS),
    true,
  );
  assert.equal(
    isFireTvRemoteKeyCode(FIRE_TV_REMOTE_KEYCODES.FIRE_TV_TRACK_NEXT),
    true,
  );
  assert.equal(isFireTvRemoteKeyCode(13), false); // D-pad center: in TV_KEY_MAP, not this set
});

// ---------------------------------------------------------------------------
// cameraPermissions
// ---------------------------------------------------------------------------

test("cameraPermissions: browser build (no cordova bridge) resolves granted", async () => {
  const saved = (globalThis as { window?: unknown }).window;
  delete (globalThis as { window?: unknown }).window;
  try {
    const granted = await requestCameraRuntimePermission();
    assert.equal(granted, true);
  } finally {
    (globalThis as { window?: unknown }).window = saved;
  }
});

test("cameraPermissions: cordova bridge — already granted short-circuits", async () => {
  let requested = false;
  (globalThis as unknown as { window: unknown }).window = {
    cordova: {
      plugins: {
        permissions: {
          CAMERA: "android.permission.CAMERA",
          hasPermission: (_p: string, success: (ok: boolean) => void) =>
            success(true),
          requestPermission: () => {
            requested = true;
          },
        },
      },
    },
  };
  try {
    const granted = await requestCameraRuntimePermission();
    assert.equal(granted, true);
    assert.equal(requested, false);
  } finally {
    delete (globalThis as { window?: unknown }).window;
  }
});

test("cameraPermissions: cordova bridge — request succeeds", async () => {
  (globalThis as unknown as { window: unknown }).window = {
    cordova: {
      plugins: {
        permissions: {
          CAMERA: "android.permission.CAMERA",
          hasPermission: (_p: string, success: (ok: boolean) => void) =>
            success(false),
          requestPermission: (
            _p: string,
            success: (s: Array<{ hasPermission: boolean }>) => void,
          ) => success([{ hasPermission: true }]),
        },
      },
    },
  };
  try {
    assert.equal(await requestCameraRuntimePermission(), true);
  } finally {
    delete (globalThis as { window?: unknown }).window;
  }
});

test("cameraPermissions: cordova bridge — request denied resolves false", async () => {
  (globalThis as unknown as { window: unknown }).window = {
    cordova: {
      plugins: {
        permissions: {
          CAMERA: "android.permission.CAMERA",
          hasPermission: (_p: string, success: (ok: boolean) => void) =>
            success(false),
          requestPermission: (
            _p: string,
            success: (s: Array<{ hasPermission: boolean }>) => void,
          ) => success([{ hasPermission: false }]),
        },
      },
    },
  };
  try {
    assert.equal(await requestCameraRuntimePermission(), false);
  } finally {
    delete (globalThis as { window?: unknown }).window;
  }
});

test("cameraPermissions: cordova bridge — bridge error resolves false, never throws", async () => {
  (globalThis as unknown as { window: unknown }).window = {
    cordova: {
      plugins: {
        permissions: {
          CAMERA: "android.permission.CAMERA",
          hasPermission: (_p: string, _s: unknown, error: () => void) =>
            error(),
          requestPermission: () => undefined,
        },
      },
    },
  };
  try {
    assert.equal(await requestCameraRuntimePermission(), false);
  } finally {
    delete (globalThis as { window?: unknown }).window;
  }
});
