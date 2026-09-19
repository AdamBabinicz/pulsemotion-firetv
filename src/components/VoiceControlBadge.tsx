import React, { useState } from "react";
import {
  Mic,
  MicOff,
  HelpCircle,
  X,
  CheckCircle2,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Language, ThemeMode, translations } from "../data/translations";

interface VoiceControlBadgeProps {
  isListening: boolean;
  onToggleListening: () => void;
  lastCommandText: string | null;
  lang: Language;
  theme: ThemeMode;
}

export const VoiceControlBadge: React.FC<VoiceControlBadgeProps> = ({
  isListening,
  onToggleListening,
  lastCommandText,
  lang,
  theme,
}) => {
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const t = translations[lang];
  const isDark = theme === "dark";

  return (
    <div className="relative flex items-center gap-1 sm:gap-2">
      {/* Voice Recognition Status Pill — 10-Foot UI ready with focus rings */}
      <button
        id="btn-toggle-voice"
        onClick={onToggleListening}
        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
          isListening
            ? "bg-rose-500/20 text-rose-400 border-rose-500/50 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/20"
            : isDark
              ? "bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 border-neutral-700 hover:border-neutral-600"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300"
        }`}
        title={
          isListening
            ? `${t.voiceControlActive} (Klawisz V)`
            : `${t.voiceControlOff} (Klawisz V)`
        }
        aria-label={
          isListening
            ? `${t.voiceControlActive} (Klawisz V)`
            : `${t.voiceControlOff} (Klawisz V)`
        }
      >
        <div className="relative flex items-center justify-center">
          {isListening ? (
            <>
              <span className="absolute -inset-1 bg-rose-500 rounded-full animate-ping opacity-60" />
              <Mic className="w-4 h-4 text-rose-500 relative z-10 animate-pulse" />
            </>
          ) : (
            <MicOff className="w-4 h-4 opacity-70" />
          )}
        </div>
        <span className="hidden sm:inline-block whitespace-nowrap">
          {isListening ? t.voiceControlActive : t.voiceControlTitle}
        </span>
        <span
          className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
            isListening
              ? "bg-rose-500/30 text-rose-200"
              : isDark
                ? "bg-neutral-700 text-neutral-300"
                : "bg-neutral-200 text-neutral-600"
          }`}
        >
          V
        </span>
        {isListening && (
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </button>

      {/* Help Dialog Trigger */}
      <button
        id="btn-voice-help"
        onClick={() => setShowHelp(!showHelp)}
        className={`p-1.5 sm:p-2 rounded-xl border text-xs sm:text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
          isDark
            ? "bg-neutral-800/90 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border-neutral-700"
            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-300"
        }`}
        title={t.voiceCommandsHelpTitle}
        aria-label={t.voiceCommandsHelpTitle}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Floating toast when voice command is recognized */}
      {lastCommandText && (
        <div className="absolute top-12 left-0 sm:left-auto sm:right-0 z-50 whitespace-nowrap px-3.5 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xl shadow-emerald-500/40 border border-emerald-300 transition-all animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0" />
          <span>
            {t.recognizedBadge}: „{lastCommandText}”
          </span>
        </div>
      )}

      {/* Voice Commands Cheat Sheet Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl p-4 sm:p-6 border shadow-2xl relative max-h-[90vh] flex flex-col ${
              isDark
                ? "bg-neutral-900 border-neutral-700 text-white"
                : "bg-white border-neutral-200 text-neutral-900"
            }`}
          >
            <button
              id="btn-close-voice-help"
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-500/20 text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  {t.voiceCommandsHelpTitle}
                </h3>
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Amazon Fire TV Voice & Remote
                  Ready
                </span>
              </div>
            </div>

            <p
              className={`text-xs sm:text-sm mb-3 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
            >
              {t.voiceControlTooltip}
            </p>

            {/* Scrollable list of commands */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
              {t.voiceCommandsList.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm gap-2 ${
                    isDark
                      ? "bg-neutral-950/70 border-neutral-800"
                      : "bg-neutral-50 border-neutral-200"
                  }`}
                >
                  <span className="font-bold text-emerald-500 dark:text-emerald-400 font-mono text-left">
                    {item.cmd}
                  </span>
                  <span
                    className={`text-right shrink-0 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
                  >
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-700/50 flex items-center justify-between">
              <span
                className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
              >
                {isListening ? t.voiceControlListening : t.voiceControlOff}{" "}
                (Skrót: klawisz V)
              </span>
              <button
                id="btn-voice-help-action"
                onClick={() => {
                  if (!isListening) onToggleListening();
                  setShowHelp(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {isListening ? "Rozumiem" : "Włącz mikrofon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
