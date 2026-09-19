# CHANGELOG — Judging Compliance & Fire TV Platform Integration (Build, Ship, Shape: Amazon Developer Hackathon — Fire TV Track)

> **Overview:** This document tracks every technical update made to PulseMotion TV, with each section kept aligned to the Amazon Developer Hackathon evaluation criteria and Fire TV platform guidelines. Detailed requirement mappings can be found in [`SUBMISSION-CHECKLIST.md`](./SUBMISSION-CHECKLIST.md).

---

## Release 2026-09-19 — Frontend Refactor & WCAG / A11y Hardening

**Date:** 2026-09-19 · **Commits:** `0ed5120` (component decomposition & responsive polish) + `75afed0` (biomechanical utility extraction + heading hierarchy fix) · **Base:** `f2717da` · **Changes:** 7 new modules + 6 refactored files

> **Overview:** This release continues the code-quality and accessibility (WCAG / a11y) hardening pass. It decomposes the two monolithic components (`App.tsx`, `PoseCamera.tsx`) into focused custom hooks and pure utilities, and it resolves a set of Lighthouse / WCAG accessibility and small-screen layout defects. Detailed requirement mappings remain in [`SUBMISSION-CHECKLIST.md`](./SUBMISSION-CHECKLIST.md).

### What Was Fixed (and Why)

#### 1. Component Decomposition — `App.tsx` → Custom Hooks (Criterion: maintainable, review-ready codebase)

**Issue:** `App.tsx` had grown into a ~1,300-line monolith that entangled four unrelated concerns — workout/session state, voice navigation, screen wake-lock, and TV remote handling — inside a single component. This made the file hard to review, impractical to unit-test in isolation, and a recurring source of merge friction.

**Changes:**

- **NEW `src/hooks/useWorkoutSession.ts`** (257 lines) — the workout session state machine: exercise selection, rep counting, per-exercise progression, and continuation of the existing persistence behaviour, all moved out of the component body.
- **NEW `src/hooks/useVoiceNavigation.ts`** (281 lines) — `SpeechRecognition` wiring and voice-command dispatch (hands-free control).
- **NEW `src/hooks/useWakeLock.ts`** (140 lines) — Screen Wake Lock API lifecycle (acquire/release across visibility changes) so the screen stays awake during a workout.
- **NEW `src/hooks/useTvRemote.ts`** (313 lines) — Fire TV D-pad keycode interception and focus coordination for the 10-foot experience.
- **`src/App.tsx`** — is now a thin composition root. It imports the four hooks (`App.tsx:18–21`) and simply wires them together: `useWorkoutSession(language)` (`:66`), `useWakeLock({ … })` (`:69`), `useVoiceNavigation({ … })` (`:76`), and `useTvRemote({ … })` (`:96`).

Three presentational blocks were also lifted out of `App.tsx` into their own components: **`src/components/AppHeader.tsx`** (220 lines), **`src/components/PausedBanner.tsx`** (51 lines), and **`src/components/VoiceHintBar.tsx`** (72 lines).

#### 2. `PoseCamera.tsx` → `biomechanicalSimulator.ts` Utility (pure-function extraction)

**Issue:** `PoseCamera.tsx` mixed MediaPipe pose maths (synthetic landmark generation) with rendering and camera-lifecycle concerns, which left the simulation logic untestable and cluttered the component.

**Changes:**

- **NEW `src/utils/biomechanicalSimulator.ts`** (185 lines) — a pure, side-effect-free biomechanical landmark generator exporting `getBiomechanicalLandmarks`.
- **`src/components/PoseCamera.tsx`** — now imports `getBiomechanicalLandmarks` from the utility (`PoseCamera.tsx:4`) and shrank by **−211 lines**, with no change to runtime behaviour.

#### 3. WCAG Heading Hierarchy — Skipped Heading Level (Lighthouse `heading-order`)

**Issue:** Lighthouse / axe flagged a skipped heading level. The camera overlay heading was rendered as `<h3>` directly beneath the page's `<h1>`/`<h2>` structure, skipping a level and violating the best-practice heading order audited under WCAG "Headings and labels".

**Changes:**

- **`src/components/PoseCamera.tsx`** — the camera overlay heading was changed from `<h3 …>` to `<h2 …>` (current line 847). The saved diff removes `<h3 className="text-base sm:text-lg font-bold text-white mb-2">` and adds the byte-identical `<h2 className="text-base sm:text-lg font-bold text-white mb-2">`. Because the classes are unchanged there is **no visual change** — only the semantic level changed, eliminating the skipped level and clearing the Lighthouse violation.

#### 4. Focus-Ring Clipping on Mobile Exercise Tabs (`scroll-padding`)

**Issue:** On small viewports the horizontally scrollable exercise carousel clipped the focus ring (`ring-2`) of the first/last tabs, because the scroll container had no scroll buffer, so the focus indicator was partially hidden — an accessibility and usability defect.

**Changes:**

- **`src/components/ExerciseSelector.tsx:151`** — the carousel container now uses `scroll-p-2` (alongside the existing `p-2 sm:p-0`, `snap-x`, and `tv-scroll-smooth`), giving 0.5rem of scroll padding so focused tab outlines remain fully visible at both ends of the row.
- Reinforced globally by `scroll-padding: 24px;` in **`src/index.css:70`**, keeping focus indicators inside the viewport across all scroll containers.

#### 5. TV Remote Overlay vs Footer Legal Controls Collision (small screens)

**Issue:** The floating TV-remote overlay (`fixed bottom-4 right-4 z-40`) visually collided with the footer's legal controls (Privacy Policy / Terms buttons) on short screens, occluding those controls.

**Changes:**

- **`src/components/Footer.tsx:31`** — the footer container now adds extra bottom padding on small screens (`pb-24 sm:pb-12 md:py-8`), so the legal controls clear the floating overlay.
- **`src/components/TvRemoteOverlay.tsx:29`** — the overlay remains `fixed bottom-4 right-4 z-40`; combined with the footer padding the two no longer overlap on small screens.

### Verification & Test Results

Evidence gathered directly from the repository history and source:

| Check / Claim                                                | Evidence                                                                             | Result                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------- |
| Component decomposition landed                               | `git show --stat 0ed5120` — 12 files, **+1,518 / −1,237**; four hook files present   | ✅ Verified in history    |
| Biomechanical utility extracted                              | `git show --stat 75afed0` — `biomechanicalSimulator.ts` +185 / `PoseCamera.tsx` −211 | ✅ Verified in history    |
| Heading hierarchy fix                                        | `git show 75afed0` diff — `<h3 …>` → `<h2 …>` in `PoseCamera.tsx`                    | ✅ Verified in diff       |
| Mobile tab focus-ring buffer                                 | `src/components/ExerciseSelector.tsx:151` (`scroll-p-2`)                             | ✅ Verified in source     |
| Overlay/footer collision fix                                 | `src/components/Footer.tsx:31`, `src/components/TvRemoteOverlay.tsx:29`              | ✅ Verified in source     |
| `npm run lint` (`tsc --noEmit`), `npm test`, `npm run build` | Not executed in the documentation-review environment (dependencies not installed)    | ⚠️ Run locally to confirm |

> **Note:** The source- and history-level facts above are confirmed. The runtime suites (`lint`, `test`, `build`) are intentionally **not** reported as passed here, because they were not executed while producing this changelog entry — run `npm install && npm run lint && npm test && npm run build` locally to record their final output.

### Modified & New Files

| File                                   | Status       | Delta                                          |
| -------------------------------------- | ------------ | ---------------------------------------------- |
| `src/hooks/useWorkoutSession.ts`       | **NEW**      | 257 lines                                      |
| `src/hooks/useVoiceNavigation.ts`      | **NEW**      | 281 lines                                      |
| `src/hooks/useWakeLock.ts`             | **NEW**      | 140 lines                                      |
| `src/hooks/useTvRemote.ts`             | **NEW**      | 313 lines                                      |
| `src/utils/biomechanicalSimulator.ts`  | **NEW**      | 185 lines                                      |
| `src/components/AppHeader.tsx`         | **NEW**      | 220 lines                                      |
| `src/components/PausedBanner.tsx`      | **NEW**      | 51 lines                                       |
| `src/components/VoiceHintBar.tsx`      | **NEW**      | 72 lines                                       |
| `src/App.tsx`                          | **MODIFIED** | −1,343 lines (now a thin composition root)     |
| `src/components/PoseCamera.tsx`        | **MODIFIED** | −211 lines (`75afed0`) / −52 lines (`0ed5120`) |
| `src/components/ExerciseSelector.tsx`  | **MODIFIED** | `scroll-p-2` focus-ring buffer                 |
| `src/components/Footer.tsx`            | **MODIFIED** | `pb-24 sm:pb-12 md:py-8` overlay clearance     |
| `src/components/VoiceControlBadge.tsx` | **MODIFIED** | composition update                             |

---

## Release 2026-09-18 — Judging Compliance & Fire TV Platform Integration

**Date:** 2026-09-18 · **Base:** `4007905` (previous HEAD from which commit `2545a5c` was created) · **Changes:** 4 source files + 1 new test suite

> **Overview:** This document outlines all technical updates made to ensure strict alignment with the Amazon Developer Hackathon evaluation criteria and platform guidelines. Detailed requirement mappings can be found in [`SUBMISSION-CHECKLIST.md`](./SUBMISSION-CHECKLIST.md).

---

## What Was Fixed (and Why)

### 1. CAMERA Runtime Permission — Fire OS / Android 6+ (Requirement: "Demo-ready app on Fire OS")

**Issue:** Simply declaring `<uses-permission android:name="android.permission.CAMERA"/>` in the manifest is insufficient: on Android 6+ (Fire OS 5+), camera permissions must be requested at runtime. Without `cordova-plugin-android-permissions`, the system silently rejects the request, causing `getUserMedia` to throw a `NotAllowedError`. On a Fire TV Stick, the user would see a "Camera Access Denied" prompt rather than the workout experience.

**Changes:**

- **NEW `src/utils/cameraPermissions.ts`** — Implements `requestCameraRuntimePermission()` returning a Promise: checks `hasPermission(CAMERA)`, requests `requestPermission(CAMERA)` via the native Cordova bridge when needed, includes a strict guard for `window.cordova` (returns `true` immediately in standard browser builds without altering web behavior), and safely catches any bridge errors returning `false` without throwing uncaught exceptions.
- **`cordova/config.xml`** — Added plugin entry `<plugin name="cordova-plugin-android-permissions" />` (line 38) with explanatory commentary.
- **`src/components/PoseCamera.tsx`** — Invokes `requestCameraRuntimePermission()` **before** the initial `getUserMedia` call in `startCamera()` (line 576). If permission is denied, transitions to `cameraFailureReason = "denied"` with intuitive fallback UI (lines 1046–1060).

---

### 2. Native Fire TV Integration in Code (Criterion: "Tech Implementation: leverage the required APIs, SDKs, or device capabilities")

**Changes:**

- **NEW `src/utils/fireTvEnvironment.ts`** — Passive Fire TV / Fire OS environment detection: checks for `AFT*` identifiers in the User Agent (official hardware signatures for Amazon Fire TV devices), Silk browser tokens, Android TV indicators, and `window.cordova` bridge presence. Exports `FIRE_TV_REMOTE_KEYCODES` (89 = `KEYCODE_MEDIA_REWIND`, 90 = `KEYCODE_MEDIA_FAST_FORWARD`, 227/228 = Fire TV track-previous/next), strictly aligned with `TV_KEYCODE_MAP` in `tvNavigation.ts`. Includes the `isFireTvRemoteKeyCode()` helper.
- **`src/components/PoseCamera.tsx`** — Integrates `detectTvEnvironment()` (line 241): hides camera front/rear flip controls on TV devices (as Fire TV Sticks typically support only a single external USB webcam or none).

---

### 3. Graceful "No Camera" Fallback Path (Criteria: "Design: complete, coherent product experience" & "Potential Impact")

**Changes in `src/components/PoseCamera.tsx`:**

- When camera access is denied or unavailable, directional D-pad focus **automatically transitions** to the "AI Simulator" button (`demoButtonRef` + `useEffect`, lines 245, 304–307). This ensures 10-foot TV users receive an immediate, functional alternative instead of hitting a dead end.
- The "AI Simulator" button displays an amber focus outline and descriptive subtitle `t.studioModeDesc` in the `denied` state (lines 1058–1060, 1078–1090).
- Reuses existing localization keys (`cameraNoDevice`, `cameraDenied`, `studioMode`), requiring zero schema modifications in `translations.ts`.

---

### 4. Unit Test Suite for New Modules

- **NEW `src/utils/fireTvAndPermissions.test.ts`** — 9 comprehensive unit tests covering:
  - User Agent detection for Fire TV Sticks (AFTMM + Silk) vs. standard desktop browsers.
  - Remote keycode mappings for 89, 90, 227, and 228.
  - 5 camera permission pathways (absence of native bridge = granted, already granted, permission granted on prompt, permission denied, and graceful handling of bridge exceptions).

---

## Verification & Test Results

| Check / Suite                                | Result                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `npm run lint` (`tsc --noEmit`, strict mode) | ✅ Clean — 0 errors                                                              |
| `npm test` (`tsx --test`)                    | ✅ **31/31 passed** (22 existing + 9 new), 0 failed                              |
| `npm run build` (`vite build`)               | ✅ Succeeded: `dist/assets/index-*.js 400.13 kB │ gzip 117.40 kB`, 1,695 modules |

---

## Modified & New Files

| File                                     | Status       | Delta           |
| ---------------------------------------- | ------------ | --------------- |
| `src/utils/cameraPermissions.ts`         | **NEW**      | 91 lines        |
| `src/utils/fireTvEnvironment.ts`         | **NEW**      | 89 lines        |
| `src/utils/fireTvAndPermissions.test.ts` | **NEW**      | 9 unit tests    |
| `src/components/PoseCamera.tsx`          | **MODIFIED** | +74 / −17 lines |
| `cordova/config.xml`                     | **MODIFIED** | +9 lines        |

---

## Compliance Matrix (Judging Requirements → Technical Implementation)

| Hackathon Requirement (Verbatim from Rules)                                                                                                                                                                                    | Codebase Evidence (File:Line)                                                                                                                                                                                                                                                            | Status                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| _"Launch a demo-ready app on Fire OS or Vega OS. Use React Native, web technologies, or Android… any framework is fine"_                                                                                                       | `package.json` (React 19 + Vite 6 + TypeScript); `cordova/config.xml` (Fire OS package bundle)                                                                                                                                                                                           | ✅ Compliant                         |
| _"Priority categories: AI-enhanced viewing, sports, fitness, family entertainment, multi-modal UX, computer vision"_                                                                                                           | `src/components/PoseCamera.tsx` (MediaPipe Pose), `src/utils/exerciseClassifier.ts` (5 exercises + rep FSM), `src/utils/voiceCommander.ts` (speech recognition), `src/utils/audioCoach.ts` (speech synthesis)                                                                            | ✅ Covers 5 of 6 priority categories |
| _"A public GitHub code repository: all source code, assets, and instructions"_                                                                                                                                                 | Complete repository with thorough `README.md` (Quick Start, scripts for dev, build, preview, test, lint, and clean)                                                                                                                                                                      | ✅ Compliant                         |
| _"Open-source license visible at the top of the repo (in the About section)"_                                                                                                                                                  | `LICENSE` (MIT) present at project root                                                                                                                                                                                                                                                  | ✅ Compliant                         |
| _"Must actually call your track's required technology in code… Fire TV is the exception: any framework works, as long as your demo video shows the project running on an actual Fire TV device or the Fire TV/Vega simulator"_ | Code: `tvNavigation.ts:68,99-102` (`TV_KEYCODE_MAP` 89/90/227/228), `fireTvEnvironment.ts` (Fire OS environment detection), `config.xml:56-68` (`LEANBACK_LAUNCHER` + 320×180 banner), `config.xml:46,51` (`CAMERA` with `required="false"`). Demo video showcases the app in operation. | ✅ Fully compliant                   |
| _"Product feedback on every tool, API, or SDK you used…"_                                                                                                                                                                      | Completed in Devpost submission form across questions 1–5                                                                                                                                                                                                                                | ✅ Submitted                         |
| _"Which track(s) and mini challenge(s) you're entering"_                                                                                                                                                                       | Form selection: "Fire TV" primary track and "Open Source Mini Challenge"                                                                                                                                                                                                                 | ✅ Submitted                         |
| _"If your project existed before the hackathon, a clear explanation…"_                                                                                                                                                         | `git log` confirms all development occurred within the official hackathon timeframe (built from scratch)                                                                                                                                                                                 | ✅ Compliant                         |
| _"Optional: Friction log entries… up to a 10% judging bonus"_                                                                                                                                                                  | Provided via `FRICTION_LOG.md` (covering USB webcam ingestion, spatial navigation focus traps, and thermal budgeting)                                                                                                                                                                    | ✅ Compliant (+10% Bonus)            |

---

## Performance Disclaimers & Scope Clarifications

1. **Performance Budget Table:** References in documentation labeled `Dev-phase measurement` reflect developer-stage testing on a Fire TV Stick 4K Max. The repository does not include a dedicated benchmark harness, these numbers are not reproduced in CI pipelines, and they do not constitute guaranteed production SLAs. The runtime application communicates real-time performance via the live FPS indicator in the HUD badge.
2. **Repository Consistency:** Redundant `env.example` has been removed in favor of standard `.env.example`, ensuring a zero-cloud, zero-API-key footprint is accurately reflected to judges.
