# Amazon Fire TV Developer Friction Log – PulseMotion TV

**Target Platform:** Amazon Fire TV (Fire OS / WebView / ARM Architecture)
**Developer:** Adam Babinicz
**Project:** PulseMotion TV – On-Device AI Fitness & Pose Coach
**Hackathon:** Amazon Developer Hackathon 2026

---

## Log Entry 1: USB Video Device (Webcam) Ingestion in Fire OS WebView

- **Specific Task Attempted:** Access an external USB camera plugged into the Fire TV via standard HTML5 `navigator.mediaDevices.getUserMedia({ video: true })` within the Fire OS web runtime.
- **Steps Taken:**
  1. Connected a UVC-compliant USB webcam via an OTG adapter cable to the Fire TV Stick.
  2. Verified camera power and USB connectivity in Android system settings.
  3. Attempted to enumerate media devices and request the video stream inside the web application.
- **Expected Result:** Fire OS prompts the standard camera permission dialog and returns the camera stream directly into the `<video>` element.
- **Actual Result:** `navigator.mediaDevices.enumerateDevices()` returned an empty video input array on certain Fire OS versions, requiring native permissions or a Cordova/Capacitor bridge wrapper with explicit `android.hardware.usb.host` declarations.
- **Severity Rating:** **High** (Blocks web developers from easily building interactive camera apps without native Android wrappers).
- **Workaround Used:** Implemented an automatic camera fallback detection pipeline and packaged the web assets inside a lightweight wrapper declaring explicit USB host and camera permissions.
- **Actionable Suggestion for Amazon:** Provide native WebRTC / UVC camera passthrough support out of the box in the Fire OS WebView engine for certified USB cameras.

---

## Log Entry 2: Spatial Navigation Focus Traps with Dynamic TV Overlays

- **Specific Task Attempted:** Maintain continuous D-pad remote focus when transitioning between workout selection screens, real-time exercise tracking, and the workout summary dialog.
- **Steps Taken:**
  1. Built a dynamic DOM tree where workout state changes unmount previous view elements and mount summary modals.
  2. Navigated using the physical Fire TV Remote D-Pad (Up, Down, Left, Right, Select).
- **Expected Result:** Focus should automatically bind to the primary interactive element on newly rendered views (e.g., "Start Workout" or "Finish").
- **Actual Result:** When dynamic React/DOM elements unmounted, focus was occasionally lost to `document.body`, requiring the user to press multiple directional keys to regain visible focus outlines.
- **Severity Rating:** **Medium** (Degrades the 10-foot living room experience if not handled carefully).
- **Workaround Used:** Built a dedicated React `useTVFocusTrap` hook and explicit `spatialNavigation` coordinator that intercepts keycode events and forcibly refocuses the active primary node on view transitions.
- **Actionable Suggestion for Amazon:** Release an official `@amazon/firetv-spatial-navigation` npm package offering zero-config focus trapping and directional navigation for modern React/Vue web applications.

---

## Log Entry 3: Sustained AI Inference Thermal Budgeting on Fire TV Sticks

- **Specific Task Attempted:** Run real-time MediaPipe Pose 33-landmark inference continuously for 15+ minutes during a workout.
- **Steps Taken:**
  1. Initialized MediaPipe Pose running via WebAssembly SIMD and WebGL 2.0.
  2. Captured camera frames at 30 FPS.
- **Expected Result:** Steady 30 FPS frame rate throughout long workouts.
- **Actual Result:** After ~8-10 minutes of continuous inference on compact Fire TV Sticks, thermal management reduced CPU clock speeds, dropping inference rates to ~18-20 FPS.
- **Severity Rating:** **Medium** (Affects smooth visual overlay tracking).
- **Workaround Used:** Implemented an adaptive throttling loop that analyzes pose landmarks every 2nd frame when motion velocity is low, reducing CPU load by 35% without noticeable loss in coaching accuracy.
- **Actionable Suggestion for Amazon:** Include hardware-accelerated WebNN (Web Neural Network API) runtime support in the Fire OS browser engine to offload machine learning models directly to the NPU/GPU with minimal thermal footprint.
