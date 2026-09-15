import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { ExerciseDefinition, ExerciseMetrics } from "../types";
import {
  Trophy,
  Flame,
  Clock,
  Award,
  Play,
  RotateCcw,
  CheckCircle,
  X,
} from "lucide-react";
import { Language, ThemeMode, translations } from "../data/translations";

interface WorkoutSummaryModalProps {
  exercise: ExerciseDefinition;
  metrics: ExerciseMetrics;
  onNextExercise: () => void;
  onRepeat: () => void;
  onClose?: () => void;
  lang: Language;
  theme: ThemeMode;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  exercise,
  metrics,
  onNextExercise,
  onRepeat,
  onClose,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isDark = theme === "dark";
  const exTranslation = t.exercises[exercise.id as keyof typeof t.exercises];
  const exName = exTranslation?.name || exercise.name;

  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10B981", "#38BDF8", "#F59E0B", "#FFFFFF"],
      });
    } catch {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getAccuracyFeedback = (score: number) => {
    if (score >= 90)
      return { title: t.setCompletedTitle, desc: t.setCompletedDescMaster };
    if (score >= 75)
      return { title: t.setCompletedTitle, desc: t.setCompletedDescGood };
    return { title: t.setCompletedTitle, desc: t.setCompletedDescRetry };
  };

  const feedback = getAccuracyFeedback(metrics.averageAccuracy);

  return (
    <div
      id="workout-summary-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        id="workout-summary-card"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center transition-colors ${
          isDark
            ? "bg-neutral-900 border-neutral-700 text-white"
            : "bg-white border-neutral-200 text-neutral-900"
        }`}
      >
        {/* Close 'X' Button */}
        {onClose && (
          <button
            id="btn-close-summary-modal"
            type="button"
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full border transition-colors ${
              isDark
                ? "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white border-neutral-700"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 border-neutral-300"
            }`}
            title={lang === "pl" ? "Zamknij (Esc)" : "Close (Esc)"}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Victory Trophy Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/30 border border-emerald-500/40 flex items-center justify-center text-emerald-500 mb-4 shadow-xl shadow-emerald-500/20">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-emerald-500">
          {t.setCompletedTitle}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 mb-2 tracking-tight">
          {exName}
        </h2>
        <p
          className={`text-xs sm:text-sm max-w-md mb-6 leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}
        >
          {feedback.desc}
        </p>

        {/* Metrics Grid */}
        <div className="w-full grid grid-cols-3 gap-3 mb-6">
          <div
            className={`p-3.5 rounded-2xl border flex flex-col items-center ${
              isDark
                ? "bg-neutral-950/60 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <Award className="w-5 h-5 text-emerald-500 mb-1" />
            <span className="text-2xl font-mono font-bold text-emerald-500">
              {metrics.averageAccuracy}%
            </span>
            <span
              className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
            >
              {t.accuracyScore}
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex flex-col items-center ${
              isDark
                ? "bg-neutral-950/60 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <Flame className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-2xl font-mono font-bold text-amber-500">
              {metrics.caloriesBurned.toFixed(1)}
            </span>
            <span
              className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
            >
              {t.energyBurned}
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex flex-col items-center ${
              isDark
                ? "bg-neutral-950/60 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <Clock className="w-5 h-5 text-sky-500 mb-1" />
            <span className="text-2xl font-mono font-bold">
              {formatTime(metrics.elapsedSeconds)}
            </span>
            <span
              className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
            >
              {t.timeSpent}
            </span>
          </div>
        </div>

        {/* AI Health Badge */}
        <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-left mb-6">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-300">
              {lang === "pl"
                ? "Wzorzec biomechaniczny: "
                : "Biomechanical pattern: "}
            </span>
            <span className={isDark ? "text-neutral-300" : "text-neutral-600"}>
              {t.safePatternBadge}
            </span>
          </div>
        </div>

        {/* TV Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            id="btn-next-exercise"
            type="button"
            onClick={onNextExercise}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            {t.nextExerciseBtn}
          </button>

          <button
            id="btn-repeat-exercise"
            type="button"
            onClick={onRepeat}
            className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base border transition-all active:scale-95 ${
              isDark
                ? "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {t.repeatSetBtn}
          </button>
        </div>

        {/* Tertiary Close / Dismiss Link */}
        {onClose && (
          <button
            id="btn-dismiss-summary"
            type="button"
            onClick={onClose}
            className={`mt-4 text-xs font-medium hover:underline transition-colors ${
              isDark
                ? "text-neutral-400 hover:text-neutral-200"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {lang === "pl"
              ? "Wróć do podglądu ćwiczenia (Esc)"
              : "Return to exercise view (Esc)"}
          </button>
        )}
      </div>
    </div>
  );
};
