# Szkielet Cordova dla Fire TV (⚠️ NIEZBUDOWANY)

Ten katalog zawiera **tylko szkielet** konfiguracji Cordovy do opakowania
aplikacji webowej w APK dla Fire TV. `cordova build android` **nie był
uruchamiany** — to punkt wyjścia, nie gotowy pipeline.

## Co jest zrobione
- `config.xml`: widget id, allowlist CDN MediaPipe, deklaracja `CAMERA`
  w manifeście, orientacja landscape, fullscreen.

## Co zostało do zrobienia przed pierwszym buildem
1. `npm install -g cordova && cordova platform add android`
2. **Runtime permission CAMERA** — przed pierwszym `getUserMedia` trzeba
   wywołać `cordova.plugins.permissions.requestPermission` (plugin
   `cordova-plugin-android-permissions`); sam wpis w manifeście nie wystarcza
   na Androidzie 6+.
3. Ikony i ekrany splash (`cordova/res/` + sekcja `<icon>`/`<splash>`).
4. Podpis release (`build.json` + keystore) — bez tego tylko debug APK.
5. Walidacja, czy WebView Fire TV (Amazon WebView/Bing?) renderuje Canvas 2D
   i WASM z `index.html` bez dodatkowych flag.

## Jak zbudować (jeśli chcesz spróbować)
```bash
npm run build           # najpierw dist/ przez Vite
# skopiuj dist/ do cordova/www/ albo podepnij przez hooks
cd cordova && cordova build android
```
