import React from "react";
import { ExerciseDefinition } from "../types";
import { Language, ThemeMode, translations } from "../data/translations";
import { CheckCircle2, Target, Sparkles } from "lucide-react";

interface VirtualCoachGuideProps {
  exercise: ExerciseDefinition;
  stage: string;
  lang: Language;
  theme: ThemeMode;
}

// Map machine stages to human-readable Polish and English descriptions
function formatStageName(stage: string, lang: Language): string {
  const normalized = (stage || "").toUpperCase().trim();

  const stageTranslations: Record<string, { pl: string; en: string }> = {
    RIGHT_UP: { pl: "Prawe kolano w górze", en: "Right Knee Up" },
    LEFT_UP: { pl: "Lewe kolano w górze", en: "Left Knee Up" },
    STANDING: { pl: "Pozycja wyprostowana", en: "Standing Upright" },
    DOWN: { pl: "Dół (pełne ugięcie)", en: "Down (Full Flex)" },
    UP: { pl: "Góra (wyprost)", en: "Up (Extension)" },
    BOTTOM: { pl: "Głęboki przysiad", en: "Deep Squat" },
    HOLD: { pl: "Utrzymanie pozycji", en: "Hold & Balance" },
    BALANCING: { pl: "Utrzymanie równowagi", en: "Balancing" },
    PEAK: { pl: "Szczyt wznosu", en: "Peak Elevation" },
    RAISED: { pl: "Ramiona uniesione", en: "Arms Raised" },
    READY: { pl: "Gotowy do startu", en: "Ready to Start" },
  };

  if (stageTranslations[normalized]) {
    return stageTranslations[normalized][lang];
  }

  return stage;
}

export const VirtualCoachGuide: React.FC<VirtualCoachGuideProps> = ({
  exercise,
  stage,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isDark = theme === "dark";

  const exTrans = t.exercises[exercise.id as keyof typeof t.exercises];

  const exerciseName: string = exTrans?.name || exercise.name;
  const exerciseDesc: string = exTrans?.description || exercise.description;
  const cuesList: string[] = exTrans?.cues || [];
  const musclesList: string[] =
    exTrans?.muscles || exercise.targetMuscles || [];
  const formattedStage = formatStageName(stage, lang);

  return (
    <div
      id="virtual-coach-guide"
      className={`h-full rounded-2xl border p-5 flex flex-col justify-between transition-colors shadow-sm ${
        isDark
          ? "bg-neutral-900 border-neutral-800 text-neutral-100"
          : "bg-white border-neutral-200 text-neutral-900"
      }`}
    >
      <div>
        {/* Category & Difficulty Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            {exercise.category.toUpperCase()}
          </span>
          <span
            className={`text-xs font-medium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
          >
            {lang === "pl"
              ? "Poziom: Średniozaawansowany"
              : "Level: Intermediate"}
          </span>
        </div>

        {/* Exercise Title & Description */}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
          {exerciseName}
        </h2>
        <p
          className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
        >
          {exerciseDesc}
        </p>

        {/* Motion Reference & Animated Stick Guide */}
        <div
          id="stickman-guide-canvas"
          className={`relative rounded-xl border p-4 mb-4 flex flex-col items-center justify-center overflow-hidden ${
            isDark
              ? "bg-neutral-950 border-neutral-800"
              : "bg-neutral-50 border-neutral-200"
          }`}
        >
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-500">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === "pl" ? "Wzorzec Ruchu AI" : "AI Motion Pattern"}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {formattedStage}
            </span>
          </div>

          {/* Biomechanical Silhouette Graphic */}
          <div className="h-32 w-full flex items-center justify-center relative py-2">
            <svg viewBox="0 0 100 120" className="h-full drop-shadow-md">
              {/* Head */}
              <circle
                cx="50"
                cy="20"
                r="8"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
              />
              {/* Spine */}
              <line
                x1="50"
                y1="28"
                x2="50"
                y2="70"
                stroke="#38BDF8"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Conditional Limbs based on Exercise Type */}
              {exercise.id === "high_knees" ? (
                <>
                  <line
                    x1="50"
                    y1="38"
                    x2="32"
                    y2="48"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="32"
                    y1="48"
                    x2="26"
                    y2="38"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="38"
                    x2="68"
                    y2="52"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="68"
                    y1="52"
                    x2="74"
                    y2="62"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <line
                    x1="50"
                    y1="70"
                    x2="52"
                    y2="92"
                    stroke="#38BDF8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="52"
                    y1="92"
                    x2="53"
                    y2="114"
                    stroke="#38BDF8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  <line
                    x1="50"
                    y1="70"
                    x2="30"
                    y2="70"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="30"
                    y1="70"
                    x2="30"
                    y2="95"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </>
              ) : exercise.id === "squats" ? (
                <>
                  <line
                    x1="50"
                    y1="38"
                    x2="30"
                    y2="46"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="38"
                    x2="70"
                    y2="46"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="70"
                    x2="32"
                    y2="82"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="32"
                    y1="82"
                    x2="34"
                    y2="110"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="70"
                    x2="68"
                    y2="82"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="68"
                    y1="82"
                    x2="66"
                    y2="110"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </>
              ) : exercise.id === "arm_raises" ? (
                <>
                  <line
                    x1="50"
                    y1="38"
                    x2="20"
                    y2="38"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="38"
                    x2="80"
                    y2="38"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="70"
                    x2="42"
                    y2="112"
                    stroke="#38BDF8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="70"
                    x2="58"
                    y2="112"
                    stroke="#38BDF8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <line
                    x1="50"
                    y1="38"
                    x2="28"
                    y2="52"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="38"
                    x2="72"
                    y2="52"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="70"
                    x2="40"
                    y2="112"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="50"
                    y1="70"
                    x2="60"
                    y2="112"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </div>

          <span className="text-[11px] font-medium text-neutral-400 mt-1">
            {lang === "pl"
              ? "Kluczowy kąt docelowy: 90° (lub pełny wyprost)"
              : "Target joint angle: 90° (or full extension)"}
          </span>
        </div>

        {/* Proper Form Instructions / Cues */}
        <div className="space-y-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            {lang === "pl" ? "Zasady poprawnej formy" : "Form Checklist"}
          </span>
          <div className="space-y-1.5">
            {cuesList.map((cue: string, idx: number) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 leading-relaxed ${
                  isDark
                    ? "bg-neutral-800/60 border-neutral-700/60"
                    : "bg-neutral-50 border-neutral-200"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span
                  className={isDark ? "text-neutral-200" : "text-neutral-700"}
                >
                  {cue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target Muscle Groups */}
      <div className="pt-3 border-t border-neutral-800/60 dark:border-neutral-800">
        <span
          className={`text-[11px] font-medium block mb-1.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
        >
          {lang === "pl" ? "Zaangażowane mięśnie:" : "Target Muscles:"}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {musclesList.map((m: string, idx: number) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                isDark
                  ? "bg-neutral-800 text-neutral-300 border-neutral-700"
                  : "bg-neutral-100 text-neutral-700 border-neutral-200"
              }`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
