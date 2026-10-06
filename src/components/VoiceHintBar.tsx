import React, { useMemo } from "react";
import { Sparkles, Mic, MicOff, Tv } from "lucide-react";
import { Language, TranslationSchema } from "../data/translations";
import { detectTvEnvironment } from "../utils/fireTvEnvironment";

interface VoiceHintBarProps {
  isDark: boolean;
  isVoiceListening: boolean;
  language: Language;
  t: TranslationSchema;
  onToggleVoice: () => void;
}

export function VoiceHintBar({
  isDark,
  isVoiceListening,
  language,
  t,
  onToggleVoice,
}: VoiceHintBarProps) {
  const tvEnv = useMemo(() => detectTvEnvironment(), []);

  return (
    <div
      id="voice-quick-hint-bar"
      className={`w-full max-w-full overflow-hidden border-b px-3 sm:px-8 py-2 flex items-center justify-between text-xs transition-colors ${
        isDark
          ? "bg-neutral-900/50 border-neutral-800/60 text-neutral-400"
          : "bg-emerald-50/50 border-emerald-100 text-emerald-900"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden truncate">
        {tvEnv.isTvLike ? (
          <Tv className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        )}

        <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
          {tvEnv.isTvLike
            ? t.tvRemoteActionShort
            : isVoiceListening
              ? t.voiceReadyLabel
              : t.voiceLabel}
        </span>

        <span className="truncate opacity-90">
          {tvEnv.isTvLike
            ? t.tvRemoteHintBar
            : isVoiceListening
              ? t.voiceHintBar
              : t.voiceMicMutedHint}
        </span>
      </div>

      {!tvEnv.isTvLike && (
        <div className="hidden md:flex items-center gap-2 shrink-0 ml-2">
          <button
            onClick={onToggleVoice}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:underline"
          >
            {isVoiceListening ? (
              <>
                <Mic className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>{t.voiceActiveKeyV}</span>
              </>
            ) : (
              <>
                <MicOff className="w-3 h-3" />
                <span>{t.voiceEnableKeyV}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
