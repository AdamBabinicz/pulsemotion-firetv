import React from "react";
import { ExerciseDefinition, ExerciseMetrics, FormQuality } from "../types";
import {
  Flame,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  Smartphone,
  SmartphoneCharging,
} from "lucide-react";
import { Language, ThemeMode, translations } from "../data/translations";
import { setTvFocus } from "../utils/tvNavigation";

interface WorkoutHUDProps {
  exercise: ExerciseDefinition;
  metrics: ExerciseMetrics;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetSet: () => void;
  lang: Language;
  theme: ThemeMode;
  isWakeLockActive?: boolean;
  onToggleWakeLock?: () => void;
}

// Map progress percent to standard Tailwind width classes (no inline-styles)
function getProgressWidthClass(pct: number): string {
  if (pct <= 0) return "w-0";
  if (pct >= 100) return "w-full";
  const step = Math.min(100, Math.max(0, Math.round(pct / 5) * 5));

  const widthClasses: Record<number, string> = {
    0: "w-0",
    5: "w-[5%]",
    10: "w-[10%]",
    15: "w-[15%]",
    20: "w-1/5",
    25: "w-1/4",
    30: "w-[30%]",
    35: "w-[35%]",
    40: "w-2/5",
    45: "w-[45%]",
    50: "w-1/2",
    55: "w-[55%]",
    60: "w-3/5",
    65: "w-[65%]",
    70: "w-[70%]",
    75: "w-3/4",
    80: "w-4/5",
    85: "w-[85%]",
    90: "w-[90%]",
    95: "w-[95%]",
    100: "w-full",
  };

  return widthClasses[step] || "w-0";
}

export const WorkoutHUD: React.FC<WorkoutHUDProps> = ({
  exercise,
  metrics,
  isMuted,
  onToggleMute,
  onResetSet,
  lang,
  theme,
  isWakeLockActive = false,
  onToggleWakeLock,
}) => {
  const t = translations[lang];
  const isDark = theme === "dark";
  const progressPercent = Math.min(
    100,
    Math.round((metrics.reps / exercise.targetRepsOrSeconds) * 100),
  );
  const progressWidthClass = getProgressWidthClass(progressPercent);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (quality: FormQuality) => {
    switch (quality) {
      case "perfect":
        return (
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 animate-pulse shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            <span className="font-bold text-xs sm:text-sm">
              {lang === "pl" ? "Idealna Forma (100%)" : "Perfect Form (100%)"}
            </span>
          </div>
        );
      case "needs_correction":
        return (
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 animate-bounce shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
            <span className="font-bold text-xs sm:text-sm">
              {lang === "pl" ? "Popraw Pozycję!" : "Correct Posture!"}
            </span>
          </div>
        );
      case "good":
        return (
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30 shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-sky-500" />
            <span className="font-bold text-xs sm:text-sm">
              {lang === "pl" ? "W Trakcie Ruchu" : "In Motion"}
            </span>
          </div>
        );
      default:
        return (
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border shrink-0 ${
              isDark
                ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                : "bg-neutral-100 text-neutral-600 border-neutral-200"
            }`}
          >
            <span className="font-semibold text-xs sm:text-sm">
              {lang === "pl" ? "Gotowy do startu" : "Ready"}
            </span>
          </div>
        );
    }
  };

  // Obsługa nawigacji D-padem pilota Fire TV pomiędzy przyciskami w HUD
  const handleControlKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentControl: "wakelock" | "sound" | "reset",
  ) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      if (currentControl === "reset") {
        const soundBtn = document.getElementById("btn-toggle-sound");
        if (soundBtn) setTvFocus(soundBtn);
      } else if (currentControl === "sound" && onToggleWakeLock) {
        const wakeLockBtn = document.getElementById("btn-hud-wakelock");
        if (wakeLockBtn) setTvFocus(wakeLockBtn);
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      if (currentControl === "wakelock") {
        const soundBtn = document.getElementById("btn-toggle-sound");
        if (soundBtn) setTvFocus(soundBtn);
      } else if (currentControl === "sound") {
        const resetBtn = document.getElementById("btn-reset-set");
        if (resetBtn) setTvFocus(resetBtn);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      // Nawigacja w górę do aktywnej karty selektora ćwiczeń
      const activeExerciseCard = document.querySelector<HTMLElement>(
        '#exercise-selector-container button[aria-selected="true"], [data-tv-zone="exercise-selector"] button[data-tv-focusable="true"]',
      );
      if (activeExerciseCard) {
        setTvFocus(activeExerciseCard);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      // Nawigacja w dół do kontrolek kamery
      const cameraToggleBtn = document.getElementById(
        "btn-toggle-camera-power",
      );
      const simulatorToggleBtn = document.getElementById("btn-toggle-demo");
      if (cameraToggleBtn) {
        setTvFocus(cameraToggleBtn);
      } else if (simulatorToggleBtn) {
        setTvFocus(simulatorToggleBtn);
      }
    }
  };

  const cardBgClass = isDark
    ? "bg-neutral-900/90 border-neutral-800 text-white"
    : "bg-white border-neutral-200 text-neutral-900 shadow-sm";

  const labelClass = isDark ? "text-neutral-400" : "text-neutral-500";

  return (
    <div
      id="workout-hud-container"
      data-tv-zone="workout-hud"
      className="w-full flex flex-col gap-2.5 sm:gap-3"
    >
      {/* Top TV Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Reps / Target Counter */}
        <div
          id="hud-reps-card"
          className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-md flex flex-col transition-colors ${cardBgClass}`}
        >
          <span
            className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold ${labelClass}`}
          >
            {exercise.isTimeBased ? t.timeCounter : t.repsCounter}
          </span>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="text-3xl sm:text-5xl font-extrabold font-mono tracking-tight">
              {metrics.reps}
            </span>
            <span
              className={`text-xs sm:text-base font-semibold font-mono ${labelClass}`}
            >
              / {exercise.targetRepsOrSeconds}{" "}
              {exercise.isTimeBased ? t.secUnit : t.repsUnit}
            </span>
          </div>
        </div>

        {/* Accuracy Gauge */}
        <div
          id="hud-accuracy-card"
          className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-md flex flex-col transition-colors ${cardBgClass}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold ${labelClass}`}
            >
              {t.formQualityLabel}
            </span>
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-5xl font-extrabold font-mono text-emerald-500 tracking-tight">
              {metrics.averageAccuracy > 0 ? metrics.averageAccuracy : 100}
            </span>
            <span className="text-sm sm:text-lg font-bold text-emerald-600">
              %
            </span>
          </div>
        </div>

        {/* Calories Burned */}
        <div
          id="hud-calories-card"
          className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-md flex flex-col transition-colors ${cardBgClass}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold ${labelClass}`}
            >
              {t.caloriesLabel}
            </span>
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-5xl font-extrabold font-mono text-amber-500 tracking-tight">
              {metrics.caloriesBurned.toFixed(1)}
            </span>
            <span
              className={`text-[10px] sm:text-xs font-semibold ${labelClass}`}
            >
              {t.caloriesUnit}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div
          id="hud-timer-card"
          className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-md flex flex-col transition-colors ${cardBgClass}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold ${labelClass}`}
            >
              {t.durationLabel}
            </span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500" />
          </div>
          <div className="mt-1">
            <span className="text-3xl sm:text-5xl font-extrabold font-mono tracking-tight">
              {formatTime(metrics.elapsedSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar with Rep Segments (Zero inline-styles) */}
      <div
        id="hud-progress-card"
        className={`w-full p-2.5 sm:p-3.5 rounded-2xl border flex flex-col gap-1.5 transition-colors ${cardBgClass}`}
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className={labelClass}>{t.setProgress}</span>
          <span className="font-mono font-bold">{progressPercent}%</span>
        </div>
        <div
          className={`w-full h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 ${
            isDark ? "bg-neutral-800" : "bg-neutral-200"
          }`}
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-300 ease-out shadow-md ${progressWidthClass}`}
          />
        </div>
      </div>

      {/* Real-time Coach Audio & Visual Alert Banner */}
      <div
        id="hud-feedback-banner"
        className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-md flex flex-wrap items-center justify-between gap-3 sm:gap-4 transition-colors ${cardBgClass}`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {getStatusBadge(metrics.formQuality)}
          <div className="flex flex-col min-w-0">
            <span
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate ${labelClass}`}
            >
              {t.coachFeedbackLabel}
            </span>
            <span className="text-sm sm:text-lg font-bold tracking-wide truncate">
              {metrics.feedbackMessage ||
                (lang === "pl"
                  ? "Rozpocznij ćwiczenie przed kamerą"
                  : "Start exercising before camera")}
            </span>
          </div>
        </div>

        {/* Action Controls dostosowane do pilota Fire TV */}
        <div
          id="hud-actions-group"
          data-tv-zone="hud-actions"
          className="flex items-center gap-1.5 sm:gap-2 shrink-0"
        >
          {/* Przycisk: Nie wygaszaj ekranu (Screen Wake Lock) */}
          {onToggleWakeLock && (
            <button
              id="btn-hud-wakelock"
              type="button"
              tabIndex={0}
              data-tv-focusable="true"
              onKeyDown={(e) => handleControlKeyDown(e, "wakelock")}
              onClick={onToggleWakeLock}
              className={`min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] p-2 sm:px-3 sm:py-2.5 rounded-xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 ${
                isWakeLockActive
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10"
                  : isDark
                    ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border-neutral-700"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-300"
              }`}
              title={
                isWakeLockActive
                  ? lang === "pl"
                    ? "Ekran stale włączony (Kliknij, aby wyłączyć)"
                    : "Screen kept awake (Click to disable)"
                  : lang === "pl"
                    ? "Nie wygaszaj ekranu (Zablokuj usypianie telefonu)"
                    : "Keep screen awake (Prevent phone from sleeping)"
              }
              aria-label={
                isWakeLockActive
                  ? lang === "pl"
                    ? "Ekran czuwa"
                    : "Screen awake"
                  : lang === "pl"
                    ? "Nie wygaszaj"
                    : "Keep awake"
              }
            >
              {isWakeLockActive ? (
                <SmartphoneCharging className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isWakeLockActive
                  ? lang === "pl"
                    ? "Ekran czuwa"
                    : "Screen awake"
                  : lang === "pl"
                    ? "Nie wygaszaj"
                    : "Keep awake"}
              </span>
            </button>
          )}

          {/* Przycisk: Wycisz / Włącz dźwięk trenera */}
          <button
            id="btn-toggle-sound"
            type="button"
            tabIndex={0}
            data-tv-focusable="true"
            onKeyDown={(e) => handleControlKeyDown(e, "sound")}
            onClick={onToggleMute}
            className={`min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] p-2 sm:px-3 sm:py-2.5 rounded-xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 ${
              isMuted
                ? isDark
                  ? "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                  : "bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
            title={
              isMuted
                ? lang === "pl"
                  ? "Włącz dźwięk"
                  : "Unmute Voice"
                : lang === "pl"
                  ? "Wycisz dźwięk"
                  : "Mute Voice"
            }
            aria-label={isMuted ? t.soundMuted : t.soundActive}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            )}
            <span className="hidden sm:inline">
              {isMuted ? t.soundMuted : t.soundActive}
            </span>
          </button>

          {/* Przycisk: Resetuj serię */}
          <button
            id="btn-reset-set"
            type="button"
            tabIndex={0}
            data-tv-focusable="true"
            onKeyDown={(e) => handleControlKeyDown(e, "reset")}
            onClick={onResetSet}
            className={`min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] p-2 sm:px-3 sm:py-2.5 rounded-xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 ${
              isDark
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
            }`}
            title={
              t.resetBtn || (lang === "pl" ? "Resetuj serię" : "Reset Set")
            }
            aria-label={t.resetBtn}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{t.resetBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
