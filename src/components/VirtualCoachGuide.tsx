import React from 'react';
import { ExerciseDefinition } from '../types';
import { Target, Check, Info } from 'lucide-react';
import { Language, ThemeMode, translations } from '../data/translations';

interface VirtualCoachGuideProps {
  exercise: ExerciseDefinition;
  stage: string;
  lang: Language;
  theme: ThemeMode;
}

export const VirtualCoachGuide: React.FC<VirtualCoachGuideProps> = ({
  exercise,
  stage,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const exTranslation = t.exercises[exercise.id as keyof typeof t.exercises];

  const exName = exTranslation?.name || exercise.name;
  const exDesc = exTranslation?.description || exercise.description;
  const exCategory = exTranslation?.category || exercise.category;
  const exDifficulty = exTranslation?.difficulty || exercise.difficulty;
  const exCues = exTranslation?.cues || exercise.keyCues;
  const exMuscles = exTranslation?.muscles || exercise.targetMuscles;

  return (
    <div
      className={`w-full h-full rounded-2xl border p-5 sm:p-6 flex flex-col justify-between overflow-hidden relative shadow-xl transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
      }`}
    >
      {/* Background Subtle Grid Accent */}
      <div
        className={`absolute inset-0 [background-size:16px_16px] pointer-events-none ${
          isDark
            ? 'bg-[radial-gradient(#262626_1px,transparent_1px)] opacity-30'
            : 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-60'
        }`}
      />

      {/* Header Info */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            {exCategory}
          </span>
          <span className={`text-xs font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {t.levelLabel} <span className="font-bold">{exDifficulty}</span>
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          {exName}
        </h2>
        <p className={`text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {exDesc}
        </p>
      </div>

      {/* Dynamic Animated Avatar / Pose Kinematic Blueprint */}
      <div
        className={`relative z-10 my-3 flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors ${
          isDark
            ? 'bg-neutral-950/70 border-neutral-800/80'
            : 'bg-neutral-50 border-neutral-200'
        }`}
      >
        <div className="text-[11px] font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <Target className="w-3.5 h-3.5" />
          {t.motionPattern} • {stage || t.properPosture}
        </div>

        {/* Minimalist SVG Kinematic Blueprint for Exercise */}
        <div className="w-32 h-40 flex items-center justify-center">
          <svg viewBox="0 0 100 140" className="w-full h-full">
            {/* Head */}
            <circle cx="50" cy="20" r="10" fill="none" stroke="#10B981" strokeWidth="3.5" />
            {/* Spine */}
            <line x1="50" y1="30" x2="50" y2="70" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />

            {/* Dynamic Arms based on exercise */}
            {exercise.id === 'jumping_jacks' ? (
              <>
                <line x1="50" y1="40" x2="25" y2="15" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="50" y1="40" x2="75" y2="15" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
              </>
            ) : exercise.id === 'arm_raises' ? (
              <>
                <line x1="50" y1="40" x2="15" y2="40" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="50" y1="40" x2="85" y2="40" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="50" y1="40" x2="28" y2="55" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="50" y1="40" x2="72" y2="55" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
              </>
            )}

            {/* Dynamic Legs based on exercise */}
            {exercise.id === 'squats' ? (
              <>
                <line x1="50" y1="70" x2="28" y2="85" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                <line x1="28" y1="85" x2="28" y2="120" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="70" x2="72" y2="85" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                <line x1="72" y1="85" x2="72" y2="120" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                <path d="M 28 85 A 12 12 0 0 1 40 85" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,2" />
              </>
            ) : exercise.id === 'jumping_jacks' ? (
              <>
                <line x1="50" y1="70" x2="20" y2="120" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="70" x2="80" y2="120" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              </>
            ) : exercise.id === 'tree_pose' ? (
              <>
                <line x1="50" y1="70" x2="50" y2="125" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="70" x2="75" y2="85" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="75" y1="85" x2="52" y2="95" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="50" y1="70" x2="35" y2="125" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="70" x2="65" y2="125" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              </>
            )}
          </svg>
        </div>

        <div className="text-center mt-1">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {t.targetAngleCue}
          </span>
        </div>
      </div>

      {/* Biomechanical Cues */}
      <div className="relative z-10 flex flex-col gap-1.5">
        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          <Info className="w-3.5 h-3.5" />
          {t.rulesTitle}
        </span>
        <ul className="flex flex-col gap-1.5">
          {exCues.map((cue, idx) => (
            <li
              key={idx}
              className={`text-xs flex items-start gap-2 p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-neutral-950/50 text-neutral-300 border-neutral-800'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Target Muscles */}
      <div className={`relative z-10 mt-3 pt-2.5 border-t flex flex-wrap gap-1.5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <span className={`text-xs font-semibold w-full mb-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {t.musclesTitle}
        </span>
        {exMuscles.map((muscle, idx) => (
          <span
            key={idx}
            className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
              isDark
                ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                : 'bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}
          >
            {muscle}
          </span>
        ))}
      </div>
    </div>
  );
};
