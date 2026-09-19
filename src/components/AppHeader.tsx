import React, { useState } from "react";
import {
  Activity,
  ShieldCheck,
  Tv,
  Smartphone,
  SmartphoneCharging,
  Languages,
  Sun,
  Moon,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { VoiceControlBadge } from "./VoiceControlBadge";
import { Language, ThemeMode, translations } from "../data/translations";

interface AppHeaderProps {
  language: Language;
  theme: ThemeMode;
  isDark: boolean;
  t: (typeof translations)["pl"];
  isVoiceListening: boolean;
  lastVoiceCommand: string | null;
  onToggleVoice: () => void;
  isWakeLockActive: boolean;
  isWakeLockSupported: boolean;
  onToggleWakeLock: () => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
}

export function AppHeader({
  language,
  theme,
  isDark,
  t,
  isVoiceListening,
  lastVoiceCommand,
  onToggleVoice,
  isWakeLockActive,
  isWakeLockSupported,
  onToggleWakeLock,
  onToggleLanguage,
  onToggleTheme,
}: AppHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header
      id="app-header"
      className={`w-full max-w-full overflow-hidden border-b sticky top-0 z-30 px-2.5 sm:px-8 py-2 sm:py-3 flex items-center justify-between transition-colors ${
        isDark
          ? "border-neutral-800/80 bg-neutral-900/80 backdrop-blur-xl"
          : "border-neutral-200/80 bg-white/85 backdrop-blur-xl shadow-sm"
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 shadow-md shadow-emerald-500/20 shrink-0">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 font-bold" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1
              className={`text-sm sm:text-base lg:text-lg font-black tracking-tight whitespace-nowrap ${
                isDark ? "text-white" : "text-neutral-950"
              }`}
            >
              {t.appTitle}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {t.appSubtitle}
            </span>
          </div>
          <span
            className={`text-[10px] sm:text-xs flex items-center gap-1 truncate ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{t.privacyBadge}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <div
          id="hint-tv-navigation"
          className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
            isDark
              ? "bg-neutral-800/70 border-neutral-700/80 text-neutral-300"
              : "bg-neutral-100 border-neutral-200 text-neutral-700"
          }`}
        >
          <Tv className="w-4 h-4 text-emerald-500" />
          <span>{t.tvModeHint}</span>
        </div>

        <VoiceControlBadge
          isListening={isVoiceListening}
          onToggleListening={onToggleVoice}
          lastCommandText={lastVoiceCommand}
          lang={language}
          theme={theme}
        />

        <button
          id="btn-header-wakelock"
          type="button"
          onClick={onToggleWakeLock}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
            isWakeLockActive
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/10"
              : isDark
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300"
          }`}
          title={
            !isWakeLockSupported
              ? language === "pl"
                ? "Przeglądarka nie obsługuje blokady wygaszania ekranu"
                : "Browser does not support Screen Wake Lock"
              : isWakeLockActive
                ? language === "pl"
                  ? "Ekran stale włączony (Kliknij, aby wyłączyć)"
                  : "Screen kept awake (Click to disable)"
                : language === "pl"
                  ? "Nie wygaszaj ekranu (Zalecane na smartfonie)"
                  : "Keep screen awake (Recommended for mobile)"
          }
        >
          {isWakeLockActive ? (
            <SmartphoneCharging className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 animate-pulse" />
          ) : (
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
          )}
          <span className="hidden xs:inline sm:inline">
            {isWakeLockActive
              ? language === "pl"
                ? "Ekran: WŁ."
                : "Awake: ON"
              : language === "pl"
                ? "Nie wygaszaj"
                : "Keep Awake"}
          </span>
        </button>

        <button
          id="btn-toggle-lang"
          type="button"
          onClick={onToggleLanguage}
          className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
            isDark
              ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
          }`}
          title={language === "pl" ? "Switch to English" : "Przełącz na Polski"}
        >
          <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          <span>{language.toUpperCase()}</span>
        </button>

        <button
          id="btn-toggle-theme"
          type="button"
          onClick={onToggleTheme}
          className={`p-1.5 sm:p-2 rounded-xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
            isDark
              ? "bg-neutral-800 hover:bg-neutral-700 text-amber-400 border-neutral-700"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
          }`}
          title={isDark ? t.themeLight : t.themeDark}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>

        <button
          id="btn-toggle-fullscreen"
          type="button"
          onClick={toggleFullscreen}
          className={`hidden sm:flex p-2 rounded-xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
            isDark
              ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300"
          }`}
          title={
            isFullscreen
              ? language === "pl"
                ? "Wyłącz pełny ekran"
                : "Exit Fullscreen"
              : language === "pl"
                ? "Pełny ekran TV"
                : "TV Fullscreen"
          }
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
