import React, { useRef, useEffect } from "react";
import { EXERCISES } from "../data/exercises";
import { ExerciseDefinition } from "../types";
import {
  Dumbbell,
  Activity,
  Compass,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Language, ThemeMode, translations } from "../data/translations";
import {
  findNextSpatialElement,
  TvDirection,
  setTvFocus,
} from "../utils/tvNavigation";

interface ExerciseSelectorProps {
  currentExercise: ExerciseDefinition;
  onSelect: (exercise: ExerciseDefinition) => void;
  lang: Language;
  theme: ThemeMode;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  currentExercise,
  onSelect,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isDark = theme === "dark";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Strength":
        return <Dumbbell className="w-4 h-4 text-emerald-500" />;
      case "Cardio":
        return <Activity className="w-4 h-4 text-rose-500" />;
      case "Balance":
        return <Compass className="w-4 h-4 text-sky-500" />;
      default:
        return <Zap className="w-4 h-4 text-amber-500" />;
    }
  };

  // Płynne przewijanie do aktywnego ćwiczenia przy zmianie
  useEffect(() => {
    const activeEl = document.getElementById(
      `exercise-tab-${currentExercise.id}`,
    );
    if (activeEl && scrollContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentExercise.id]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  // Obsługa D-pada pilota Fire TV wewnątrz paska ćwiczeń
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % EXERCISES.length;
      const nextExercise = EXERCISES[nextIndex];
      onSelect(nextExercise);
      const nextEl = document.getElementById(`exercise-tab-${nextExercise.id}`);
      if (nextEl) setTvFocus(nextEl);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex =
        (currentIndex - 1 + EXERCISES.length) % EXERCISES.length;
      const prevExercise = EXERCISES[prevIndex];
      onSelect(prevExercise);
      const prevEl = document.getElementById(`exercise-tab-${prevExercise.id}`);
      if (prevEl) setTvFocus(prevEl);
    } else if (e.key === "ArrowUp") {
      // Skocz w górę do najbliższego elementu kontrolnego (np. aparat/symulator/header)
      const currentTarget = e.currentTarget;
      const upTarget = findNextSpatialElement(currentTarget, TvDirection.UP);
      if (upTarget) {
        e.preventDefault();
        setTvFocus(upTarget);
      }
    } else if (e.key === "ArrowDown") {
      // Skocz w dół do akcji treningu / HUD / stopki
      const currentTarget = e.currentTarget;
      const downTarget = findNextSpatialElement(
        currentTarget,
        TvDirection.DOWN,
      );
      if (downTarget) {
        e.preventDefault();
        setTvFocus(downTarget);
      }
    }
  };

  return (
    <div
      className="w-full flex flex-col gap-2"
      data-tv-zone="exercise-selector"
      role="region"
      aria-label={t.selectExerciseLabel}
    >
      <div className="flex items-center justify-between px-1">
        <span
          className={`text-xs uppercase font-bold tracking-wider ${
            isDark ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          {t.selectExerciseLabel}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            {t.tvCarouselMode}
          </span>
          {/* Strzałki nawigacyjne dla myszy/ekranu dotykowego */}
          <div className="flex items-center gap-1">
            <button
              onClick={scrollLeft}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300"
              }`}
              aria-label={t.tvNavigation.dpadLeft}
              title={t.tvNavigation.dpadLeft}
              tabIndex={-1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollRight}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300"
              }`}
              aria-label={t.tvNavigation.dpadRight}
              title={t.tvNavigation.dpadRight}
              tabIndex={-1}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Karuzela ćwiczeń z obsługą D-pad TV */}
      <div
        ref={scrollContainerRef}
        role="tablist"
        aria-label={t.selectExerciseLabel}
        className="grid grid-flow-col auto-cols-max sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 scroll-smooth snap-x touch-pan-x tv-scroll-smooth tv-hide-scrollbar"
      >
        {EXERCISES.map((ex, index) => {
          const isSelected = ex.id === currentExercise.id;
          const exTrans = t.exercises[ex.id as keyof typeof t.exercises];
          const exName = exTrans?.name || ex.name;
          const exCategory = exTrans?.category || ex.category;

          return (
            <button
              key={ex.id}
              id={`exercise-tab-${ex.id}`}
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              data-tv-focusable="true"
              data-tv-focused={isSelected ? "true" : "false"}
              onClick={() => onSelect(ex)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`snap-start w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 min-h-[48px] rounded-2xl border text-left transition-all ${
                isSelected
                  ? isDark
                    ? "bg-neutral-800 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "bg-white border-emerald-500 ring-2 ring-emerald-500/40 shadow-md text-neutral-900"
                  : isDark
                    ? "bg-neutral-900/90 hover:bg-neutral-800/90 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                    : "bg-neutral-100 hover:bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isSelected
                    ? "bg-emerald-500/20"
                    : isDark
                      ? "bg-neutral-800"
                      : "bg-neutral-200"
                }`}
              >
                {getCategoryIcon(ex.category)}
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span
                  className={`text-xs sm:text-sm font-bold truncate ${
                    isSelected
                      ? isDark
                        ? "text-white"
                        : "text-neutral-950"
                      : isDark
                        ? "text-neutral-300"
                        : "text-neutral-800"
                  }`}
                  title={exName}
                >
                  {exName}
                </span>
                <span
                  className={`text-[10px] sm:text-[11px] truncate ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                >
                  {ex.targetRepsOrSeconds}{" "}
                  {ex.isTimeBased ? t.secUnit : t.repsUnit} • {exCategory}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
