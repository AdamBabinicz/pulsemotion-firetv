import React, { useState } from 'react';
import { Mic, MicOff, HelpCircle, X, CheckCircle2, Volume2 } from 'lucide-react';
import { Language, ThemeMode, translations } from '../data/translations';

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
  const isDark = theme === 'dark';

  return (
    <div className="relative flex items-center gap-2">
      {/* Voice Recognition Status Pill */}
      <button
        id="btn-toggle-voice"
        onClick={onToggleListening}
        className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
          isListening
            ? 'bg-rose-500/15 text-rose-500 border-rose-500/40 ring-2 ring-rose-500/20 shadow-md shadow-rose-500/10'
            : isDark
            ? 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
        }`}
        title={isListening ? t.voiceControlActive : t.voiceControlOff}
      >
        <div className="relative flex items-center justify-center">
          {isListening ? (
            <>
              <span className="absolute w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-60" />
              <Mic className="w-4 h-4 text-rose-500 relative z-10" />
            </>
          ) : (
            <MicOff className="w-4 h-4 opacity-70" />
          )}
        </div>
        <span className="hidden sm:inline">
          {isListening ? t.voiceControlActive : t.voiceControlTitle}
        </span>
      </button>

      {/* Help Dialog Trigger */}
      <button
        id="btn-voice-help"
        onClick={() => setShowHelp(!showHelp)}
        className={`p-1.5 sm:p-2 rounded-xl border text-xs transition-colors ${
          isDark
            ? 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-700'
            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-300'
        }`}
        title={t.voiceCommandsHelpTitle}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Floating toast when voice command is recognized */}
      {lastCommandText && (
        <div className="absolute top-12 left-0 sm:left-auto sm:right-0 z-50 whitespace-nowrap px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-xl shadow-emerald-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {t.recognizedBadge}: „{lastCommandText}”
          </span>
        </div>
      )}

      {/* Voice Commands Cheat Sheet Modal / Popover */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative ${
              isDark
                ? 'bg-neutral-900 border-neutral-700 text-white'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-500/10 text-neutral-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold tracking-tight">
                {t.voiceCommandsHelpTitle}
              </h3>
            </div>

            <p className={`text-xs mb-4 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {t.voiceControlTooltip}
            </p>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {t.voiceCommandsList.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isDark
                      ? 'bg-neutral-950/60 border-neutral-800'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {item.cmd}
                  </span>
                  <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-700/50 flex items-center justify-between">
              <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {isListening ? t.voiceControlListening : t.voiceControlOff}
              </span>
              <button
                onClick={() => {
                  if (!isListening) onToggleListening();
                  setShowHelp(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors"
              >
                {isListening ? 'OK' : t.voiceControlOff}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
