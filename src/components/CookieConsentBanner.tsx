import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, Settings2, Check, X } from "lucide-react";
import { ThemeMode, TranslationSchema } from "../data/translations";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
}

interface CookieConsentBannerProps {
  t: TranslationSchema;
  theme: ThemeMode;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  onOpenSettings: () => void;
}

const COOKIE_STORAGE_KEY = "pulsemotion_cookie_consent";

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  t,
  theme,
  isSettingsOpen,
  onCloseSettings,
  onOpenSettings,
}) => {
  const isDark = theme === "dark";
  const [hasChosen, setHasChosen] = useState<boolean>(true);
  const [analyticsAllowed, setAnalyticsAllowed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (stored) {
        const parsed: CookiePreferences = JSON.parse(stored);
        setAnalyticsAllowed(!!parsed.analytics);
        setHasChosen(true);
      } else {
        setHasChosen(false);
      }
    } catch {
      setHasChosen(false);
    }
  }, []);

  const saveConsent = (analytics: boolean) => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics,
    };
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setAnalyticsAllowed(analytics);
    setHasChosen(true);
    onCloseSettings();

    if (typeof window !== "undefined") {
      const win = window as any;
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({
        event: "consent_update",
        analytics_storage: analytics ? "granted" : "denied",
      });
    }
  };

  return (
    <>
      {!hasChosen && !isSettingsOpen && (
        <div
          id="cookie-consent-banner"
          role="region"
          aria-label="Cookie banner"
          className={`fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 border-t shadow-2xl transition-colors duration-300 ${
            isDark
              ? "bg-neutral-950/95 border-neutral-800 text-neutral-100"
              : "bg-white/95 border-neutral-200 text-neutral-900 shadow-neutral-900/10"
          }`}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div
                className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                  isDark
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                }`}
              >
                <Cookie className="w-6 h-6" />
              </div>
              <div>
                <h3
                  className={`text-base font-semibold tracking-wide ${
                    isDark ? "text-white" : "text-neutral-950"
                  }`}
                >
                  {t.cookieBanner.title}
                </h3>
                <p
                  className={`text-xs md:text-sm mt-1 leading-relaxed ${
                    isDark ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  {t.cookieBanner.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0">
              <button
                type="button"
                onClick={onOpenSettings}
                className={`px-4 py-2 text-xs md:text-sm font-medium rounded-xl border transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isDark
                    ? "border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    : "border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                }`}
              >
                <Settings2 className="w-4 h-4" />
                <span>{t.cookieBanner.settings}</span>
              </button>
              <button
                type="button"
                onClick={() => saveConsent(false)}
                className={`px-4 py-2 text-xs md:text-sm font-medium rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isDark
                    ? "border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    : "border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                }`}
              >
                {t.cookieBanner.necessaryOnly}
              </button>
              <button
                type="button"
                onClick={() => saveConsent(true)}
                className="px-5 py-2 text-xs md:text-sm font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors shadow-lg shadow-emerald-500/20"
              >
                {t.cookieBanner.acceptAll}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preferencji */}
      {isSettingsOpen && (
        <div
          id="cookie-settings-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div
            className={`relative w-full max-w-xl border rounded-2xl shadow-2xl p-6 overflow-hidden transition-colors ${
              isDark
                ? "bg-neutral-950 border-neutral-800 text-neutral-100"
                : "bg-white border-neutral-200 text-neutral-900"
            }`}
          >
            <div
              className={`flex items-center justify-between pb-4 border-b ${
                isDark ? "border-neutral-800" : "border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    isDark
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-neutral-950"
                    }`}
                  >
                    {t.cookieModal.title}
                  </h2>
                  <p
                    className={`text-xs ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {t.cookieModal.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseSettings}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  isDark
                    ? "bg-neutral-900/60 border-neutral-800"
                    : "bg-neutral-50 border-neutral-200"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-sm ${
                        isDark ? "text-white" : "text-neutral-950"
                      }`}
                    >
                      {t.cookieModal.necessaryTitle}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      {t.cookieModal.alwaysActive}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {t.cookieModal.necessaryDesc}
                  </p>
                </div>
                <div className="p-1 text-emerald-500">
                  <Check className="w-5 h-5" />
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  isDark
                    ? "bg-neutral-900/60 border-neutral-800"
                    : "bg-neutral-50 border-neutral-200"
                }`}
              >
                <div>
                  <span
                    className={`font-semibold text-sm ${
                      isDark ? "text-white" : "text-neutral-950"
                    }`}
                  >
                    {t.cookieModal.analyticsTitle}
                  </span>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {t.cookieModal.analyticsDesc}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={analyticsAllowed}
                    onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            <div
              className={`pt-4 border-t flex items-center justify-end gap-3 ${
                isDark ? "border-neutral-800" : "border-neutral-200"
              }`}
            >
              <button
                type="button"
                onClick={onCloseSettings}
                className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
                  isDark
                    ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
                }`}
              >
                {t.cookieModal.close}
              </button>
              <button
                type="button"
                onClick={() => saveConsent(analyticsAllowed)}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors shadow-lg shadow-emerald-500/20"
              >
                {t.cookieModal.savePreferences}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
