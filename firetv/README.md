# PulseMotion TV — Fire TV Web App (hosted / packaged)

This folder turns the Vite web build into a **Fire TV Web App** that runs on
Fire OS through Amazon's own Web App environment, instead of being described as
"just a website".

Amazon officially supports three Fire TV web app models
([Getting Started with Web Apps](https://developer.amazon.com/docs/fire-tv/getting-started-with-web-apps.html)):

| Model | What it is | Used here |
| :-- | :-- | :-- |
| **Hosted app** | Assets live on a web server; the device downloads them before running | ✅ primary demo path |
| **Packaged app** | Same app, assets bundled in a `.zip` | ✅ offline / Appstore path |
| **HTML5 hybrid app** | Native shell (Cordova) wrapping web content | ✅ `../cordova/config.xml` |

All three are the *same* React + TypeScript + Vite codebase. No rewrite to
Kotlin or React Native is required — the Fire TV track explicitly allows
"web technologies … any framework is fine".

---

## A. Run on Fire TV via the Amazon Web App Tester (hosted)

Amazon's **Web App Tester** is the supported way to launch a hosted HTML5 app on
a real Fire TV device
([Install and Use the Amazon Web App Tester](https://developer.amazon.com/docs/fire-tv/webapp-app-tester.html)).

```bash
# 1. Build the production bundle
pnpm build

# 2. Serve it so the Fire TV can reach it over your LAN (or deploy to Netlify)
pnpm preview --host 0.0.0.0 --port 3000
```

1. Install **Web App Tester** from the Amazon Appstore on your Fire TV.
2. Open the Web App Tester → **Hosted Apps** tab.
3. Enter your URL — `https://<your-host>/` or `http://<your-lan-ip>:3000/`.
   You can instead drop `amazon.testerurls.json` (repo root) into the device so
   the URL list is preloaded.
4. Select **Test App** → PulseMotion launches full-screen on Fire OS.
5. Drive the whole app with the **Fire TV remote** (D-Pad + media keys).

> Optional: enable Chrome DevTools from the tester's Menu → *Enable Devtools*.

## B. Run as a Packaged app (offline)

A packaged Fire TV web app "looks and works like a normal web project folder".
Zip the contents of `dist/` (with `index.html` at the zip root) and load it:

```bash
./firetv/package-firetv.sh          # → firetv/pulsemotion-firetv.zip
```

Then: Web App Tester → **Packaged Apps** tab → enter the `.zip` URL, or copy the
zip to `/sdcard/amazonwebapps/` on the device and press **Sync List** → **Test App**.

## C. Fire OS (Cordova) build — hybrid

`../cordova/config.xml` packages the same `dist/` as a native Fire OS app with
LEANBACK_LAUNCHER, banner 320×180, `camera required="false"`, and the runtime
CAMERA permission bridge (`src/utils/cameraPermissions.ts` + `cordova-plugin-android-permissions`).

---

## Device used for benchmarking

**Fire TV Stick 4K Max (2nd Gen, 2023)** — build model `AFTKRT`, **Fire OS 8**
(Android 11, API 30), MediaTek MT8696T, 4× Cortex-A55 up to 2.0 GHz,
GPU GE9215 up to 850 MHz, **2 GB LPDDR4**, 16 GB storage, Wi-Fi 6E
([device specs](https://developer.amazon.com/docs/device-specs/device-specifications-fire-tv-streaming-media-player.html)).

Fire OS was chosen over Vega OS (Fire TV Stick 4K Select = Vega OS 1.1) because
the whole pose pipeline (MediaPipe + WASM SIMD + Canvas 2D) is benchmarked on
Fire OS 8, giving one coherent story: **Fire OS 8 → Fire TV Web App → PulseMotion**.
