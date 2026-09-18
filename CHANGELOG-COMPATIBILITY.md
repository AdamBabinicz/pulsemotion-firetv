# CHANGELOG — Zgodność z wymaganiami jury (Build, Ship, Shape: Amazon Developer Hackathon — Fire TV Track)

Data: 2026-09-18 · Baza: commit `ab6eee5` (HEAD z GitHuba) · Zmiany: 4 pliki kodu + 1 nowy test

## Co naprawiono (i dlaczego)

### 1. Runtime permission CAMERA — Fire OS / Android 6+ (wymóg „demo-ready app on Fire OS")

**Problem:** Wpis `<uses-permission android:name="android.permission.CAMERA"/>` w manifeście
NIE wystarcza — od Androida 6 (Fire OS 5+) zgoda musi zostać wywołana w runtime. Bez
`cordova-plugin-android-permissions` system po cichu odmawia i `getUserMedia` kończy się
`NotAllowedError`: na Fire TV Sticku użytkownik widzi „Camera Access Denied" zamiast treningu.

**Zmiany:**
- **NOWY `src/utils/cameraPermissions.ts`** — promise `requestCameraRuntimePermission()`:
  sprawdza `hasPermission(CAMERA)`, w razie braku woła `requestPermission(CAMERA)` przez
  natywny most Cordova; twardy guard `window.cordova` (w czystym web buildzie zwraca
  `true` natychmiast — zachowanie przeglądarki bez zmian); każdy błąd mostu kończy się
  `false`, nigdy wyjątkiem.
- **`cordova/config.xml`** — dodany wpis `<plugin name="cordova-plugin-android-permissions" />`
  (linia 38), komentarz wyjaśniający dlaczego.
- **`src/components/PoseCamera.tsx`** — w `startCamera()` wywołanie
  `requestCameraRuntimePermission()` **przed** pierwszym `getUserMedia` (linia 576);
  odmowa → stan `cameraFailureReason = "denied"` z czytelnym UI (linia 1046–1060).

### 2. Fire TV w kodzie — weryfikowalna integracja z platformą (kryterium „Tech Implementation: leverage the required APIs, SDKs, or device capabilities")

**Zmiany:**
- **NOWY `src/utils/fireTvEnvironment.ts`** — pasywna detekcja Fire TV / Fire OS:
  sygnatury `AFT*` w UA (udokumentowany kod urządzeń Fire TV), Silk, Android TV,
  most `window.cordova`; eksport `FIRE_TV_REMOTE_KEYCODES` (89 = KEYCODE_MEDIA_REWIND,
  90 = KEYCODE_MEDIA_FAST_FORWARD, 227/228 = Fire TV track-previous/next) spójny z
  `TV_KEYCODE_MAP` w `tvNavigation.ts`; helper `isFireTvRemoteKeyCode()`.
- **`src/components/PoseCamera.tsx`** — `detectTvEnvironment()` w komponencie (linia 241):
  przełącznik przód/tył kamery ukrywany na urządzeniach TV (Stick ma co najwyżej jedną kamerę,
  a zwykle żadną).

### 3. Spójna ścieżka „brak kamery" — Fire TV Stick bez kamery (kryteria „Design: complete, coherent product experience" i „Potential Impact")

**Zmiany w `src/components/PoseCamera.tsx`:**
- Gdy system odmówi kamery w runtime, fokus D-pada **automatycznie przechodzi** na przycisk
  „Symulator AI" (`demoButtonRef` + `useEffect`, linie 245, 304–307) — użytkownik TV dostaje
  gotową, czytelną alternatywę zamiast ślepej uliczki.
- Przycisk „Symulator AI" dostaje wyraźną bursztynową obwódkę + podpowiedź
  `t.studioModeDesc` w stanie `denied` (linie 1058–1060, 1078–1090).
- Wykorzystuje istniejące stringi tłumaczeń (`cameraNoDevice`, `cameraDenied`, `studioMode`) —
  zero zmian w `translations.ts`, zero nowych kluczy.

### 4. Testy jednostkowe dla nowych modułów

- **NOWY `src/utils/fireTvAndPermissions.test.ts`** — 9 testów: detekcja UA Fire TV Stick
  (AFTMM + Silk) i zwykłej przeglądarki, mapa kodów klawiszy 89/90/227/228, oraz 5 ścieżek
  uprawnień kamery (brak mostu = granted, już przyznana, zgoda po promptcie, odmowa, błąd
  mostu bez wyjątku).

## Weryfikacja (realne uruchomienia w tej sesji)

| Sprawdzenie | Wynik |
|---|---|
| `npm run lint` (tsc --noEmit, strict) | ✅ czysto, 0 błędów |
| `npm test` (tsx --test) | ✅ **31/31 pass** (22 istniejące + 9 nowych), 0 fail |
| `npm run build` (vite build) | ✅ sukces: `dist/assets/index-*.js 400.13 kB │ gzip 117.40 kB`, 1695 modułów |

## Zmienione/nowe pliki (pełne wersje w paczce)

| Plik | Typ | Rozmiar zmiany |
|---|---|---|
| `src/utils/cameraPermissions.ts` | NOWY | 91 linii |
| `src/utils/fireTvEnvironment.ts` | NOWY | 89 linii |
| `src/utils/fireTvAndPermissions.test.ts` | NOWY | 9 testów |
| `src/components/PoseCamera.tsx` | ZMIENIONY | +74 / −17 |
| `cordova/config.xml` | ZMIENIONY | +9 |

## Tabela zgodności (wymóg jury → dowód w kodzie)

| Wymóg jury (verbatim z regulaminu) | Dowód: plik:linia | Status |
|---|---|---|
| „Launch a demo-ready app on Fire OS or Vega OS. Use React Native, web technologies, or Android… any framework is fine" | `package.json` (React 19 + Vite 6 + TS); `cordova/config.xml` (pakowanie pod Fire OS) | ✅ |
| „Priority categories: AI-enhanced viewing, sports, fitness, family entertainment, multi-modal UX, computer vision" | `src/components/PoseCamera.tsx` (MediaPipe pose), `src/utils/exerciseClassifier.ts` (5 ćwiczeń + rep FSM), `src/utils/voiceCommander.ts` (głos), `src/utils/audioCoach.ts` (lektor) | ✅ 5/6 kategorii |
| „A public GitHub code repository: all source code, assets, and instructions" | repo + README (Quick Start, skrypty dev/build/preview/test/lint/clean) | ✅ (po push) |
| „open-source license visible at the top of the repo (in the About section)" | `LICENSE` (MIT) w katalogu głównym | ✅ |
| „must actually call your track's required technology in code… Fire TV is the exception: any framework works, as long as your demo video shows the project running on an actual Fire TV device or the Fire TV/Vega simulator" | Kod: `tvNavigation.ts:68,99-102` (TV_KEYCODE_MAP 89/90/227/228), `fireTvEnvironment.ts` (detekcja Fire OS), `config.xml:56-68` (LEANBACK_LAUNCHER + banner 320×180), `config.xml:46,51` (CAMERA + required="false"). WIDEO: **do nagrania po Twojej stronie** (reguła binarna — ujęcie aplikacji na Fire TV/symulatorze) | ✅ kod / ⚠️ wideo |
| „Product feedback on every tool, API, or SDK you used…" | Pole formularza Devpost (treść gotowa z wcześniejszej wiadomości) | 🟡 do wklejenia |
| „Which track(s) and mini challenge(s) you're entering" | Pole formularza: „Fire TV" | 🟡 do wklejenia |
| „If your project existed before the hackathon, a clear explanation…" | `git log` (wszystkie commity 17–18.09.2026) + wyliczenie w treści zgłoszenia | 🟡 do wklejenia |
| „Optional: Friction log entries… up to a 10% judging bonus" | README sekcja 🧱 Friction Log (5 punktów) → skopiować do formularza | 🟡 do wklejenia (up to 10%) |

## Jedyne otwarte pozycje (poza kodem)

1. **Wideo demo** — scena aplikacji na Fire TV / symulatorze Vega (wymóg binarny regulaminu).
2. **Push do GitHuba** — zaaplikuj paczkę, commit + push (jury sprawdza publiczne repo).
3. **Pola formularza Devpost** — feedback per narzędzie, track, wyjaśnienie pre-existing, friction log.
