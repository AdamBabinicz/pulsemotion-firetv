import React from "react";
import { PauseCircle, PlayCircle } from "lucide-react";
import { Language, translations } from "../data/translations";

interface PausedBannerProps {
  t: (typeof translations)["pl"];
  language: Language;
  isCompleteOrMaxReps: boolean;
  onResume: () => void;
}

export function PausedBanner({
  t,
  language,
  isCompleteOrMaxReps,
  onResume,
}: PausedBannerProps) {
  return (
    <div
      id="workout-paused-banner"
      className="w-full max-w-full bg-amber-500/20 border-b border-amber-500/40 px-3 sm:px-8 py-2.5 flex items-center justify-between animate-pulse overflow-hidden"
    >
      <div className="flex items-center gap-2.5 truncate">
        <PauseCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="truncate">
          <span className="font-bold text-sm text-amber-500">
            {t.pausedBanner}
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs text-amber-400/90 truncate">
            {t.pausedBannerDesc}
          </span>
        </div>
      </div>
      <button
        onClick={onResume}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-colors shrink-0"
      >
        <PlayCircle className="w-3.5 h-3.5" />
        <span>
          {isCompleteOrMaxReps
            ? language === "pl"
              ? "Kolejne ćwiczenie"
              : "Next Exercise"
            : language === "pl"
              ? "Wznów (Start)"
              : "Resume (Start)"}
        </span>
      </button>
    </div>
  );
}
