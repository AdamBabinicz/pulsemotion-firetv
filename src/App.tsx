import React, { useState, useEffect, useCallback } from "react";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { ExerciseSelector } from "./components/ExerciseSelector";
import { WorkoutHUD } from "./components/WorkoutHUD";
import { PoseCamera } from "./components/PoseCamera";
import { VirtualCoachGuide } from "./components/VirtualCoachGuide";
import { WorkoutSummaryModal } from "./components/WorkoutSummaryModal";
import { TvRemoteOverlay } from "./components/TvRemoteOverlay";
import { Footer } from "./components/Footer";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { PrivacyPolicyModal } from "./components/PrivacyPolicyModal";
import { TermsModal } from "./components/TermsModal";

// Nowo wydzielone komponenty i hooki
import { AppHeader } from "./components/AppHeader";
import { VoiceHintBar } from "./components/VoiceHintBar";
import { PausedBanner } from "./components/PausedBanner";
import { useWakeLock } from "./hooks/useWakeLock";
import { useWorkoutSession } from "./hooks/useWorkoutSession";
import { useVoiceNavigation } from "./hooks/useVoiceNavigation";
import { useTvRemote } from "./hooks/useTvRemote";

import { Language, ThemeMode, translations } from "./data/translations";

export default function App() {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("pulsemotion_lang") as Language) || "pl";
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("pulsemotion_theme") as ThemeMode) || "dark";
  });

  const t = translations[language];
  const isDark = theme === "dark";

  // Modale prawne
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
  const [externalDemoTrigger, setExternalDemoTrigger] = useState<
    number | boolean
  >(false);

  // Synchronizacja motywu i języka w DOM / Storage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("pulsemotion_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pulsemotion_lang", language);
  }, [language]);

  const handleToggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "pl" ? "en" : "pl"));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // 1. Hook sesji treningowej
  const workout = useWorkoutSession(language);

  // 2. Hook Screen Wake Lock
  const wakeLock = useWakeLock({
    language,
    isPaused: workout.isPaused,
    isCompleted: workout.isCompleted,
  });

  // 3. Hook sterowania głosem
  const voice = useVoiceNavigation({
    language,
    currentExercise: workout.currentExercise,
    isCompleted: workout.isCompleted,
    isPausedRef: workout.isPausedRef,
    currentRepsRef: workout.currentRepsRef,
    setIsPaused: workout.setIsPaused,
    setIsCompleted: workout.setIsCompleted,
    setIsMuted: workout.setIsMuted,
    setMetrics: workout.setMetrics,
    handleSelectExercise: workout.handleSelectExercise,
    handleResetSet: workout.handleResetSet,
    handleNextExercise: workout.handleNextExercise,
    handlePrevExercise: workout.handlePrevExercise,
    handleToggleTheme,
    handleToggleLanguage,
    setExternalDemoTrigger,
  });

  // 4. Hook pilota Fire TV i skrótów
  useTvRemote({
    currentExercise: workout.currentExercise,
    reps: workout.metrics.reps,
    isPaused: workout.isPaused,
    isCompleted: workout.isCompleted,
    isPrivacyOpen,
    isTermsOpen,
    isCookieSettingsOpen,
    currentRepsRef: workout.currentRepsRef,
    setIsPaused: workout.setIsPaused,
    setIsCompleted: workout.setIsCompleted,
    setIsPrivacyOpen,
    setIsTermsOpen,
    setIsCookieSettingsOpen,
    handleNextExercise: workout.handleNextExercise,
    handlePrevExercise: workout.handlePrevExercise,
    handleResetSet: workout.handleResetSet,
    handleToggleMute: workout.handleToggleMute,
    handleToggleVoice: voice.handleToggleVoice,
    handleToggleWakeLock: wakeLock.handleToggleWakeLock,
    language,
  });

  return (
    <div
      id="app-root-container"
      className={`tv-safe-zone min-h-screen w-full max-w-full overflow-x-hidden flex flex-col font-sans transition-colors duration-300 ${
        isDark
          ? "bg-neutral-950 text-neutral-100"
          : "bg-neutral-50 text-neutral-900"
      }`}
    >
      <AppHeader
        language={language}
        theme={theme}
        isDark={isDark}
        t={t}
        isVoiceListening={voice.isVoiceListening}
        lastVoiceCommand={voice.lastVoiceCommand}
        onToggleVoice={voice.handleToggleVoice}
        isWakeLockActive={wakeLock.isWakeLockActive}
        isWakeLockSupported={wakeLock.isWakeLockSupported}
        onToggleWakeLock={wakeLock.handleToggleWakeLock}
        onToggleLanguage={handleToggleLanguage}
        onToggleTheme={handleToggleTheme}
      />

      <VoiceHintBar
        isDark={isDark}
        isVoiceListening={voice.isVoiceListening}
        language={language}
        t={t}
        onToggleVoice={voice.handleToggleVoice}
      />

      {workout.isPaused && (
        <PausedBanner
          t={t}
          language={language}
          isCompleteOrMaxReps={
            workout.currentRepsRef.current >=
            workout.currentExercise.targetRepsOrSeconds
          }
          onResume={() => {
            if (
              workout.currentRepsRef.current >=
              workout.currentExercise.targetRepsOrSeconds
            ) {
              workout.handleNextExercise();
            } else {
              workout.setIsPaused(false);
            }
          }}
        />
      )}

      <main
        id="app-main-content"
        className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8 flex flex-col gap-3 sm:gap-6 overflow-x-hidden"
      >
        <ExerciseSelector
          currentExercise={workout.currentExercise}
          onSelect={workout.handleSelectExercise}
          lang={language}
          theme={theme}
        />

        <WorkoutHUD
          exercise={workout.currentExercise}
          metrics={workout.metrics}
          isMuted={workout.isMuted}
          onToggleMute={workout.handleToggleMute}
          onResetSet={workout.handleResetSet}
          lang={language}
          theme={theme}
          isWakeLockActive={wakeLock.isWakeLockActive}
          onToggleWakeLock={wakeLock.handleToggleWakeLock}
        />

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-6 items-stretch w-full max-w-full">
          <div className="order-1 lg:order-2 lg:col-span-7 w-full max-w-full flex flex-col">
            <PoseCamera
              onPoseDetected={workout.handlePoseDetected}
              formQuality={workout.metrics.formQuality}
              currentAngle={workout.metrics.currentAngle ?? 180}
              exerciseId={workout.currentExercise.id}
              lang={language}
              theme={theme}
              externalDemoTrigger={externalDemoTrigger}
              onDemoModeChange={(isActive) => {
                if (!isActive) setExternalDemoTrigger(false);
              }}
              isWorkoutCompleted={workout.isCompleted}
              isPaused={workout.isPaused}
            />
          </div>

          <div className="order-2 lg:order-1 lg:col-span-5 w-full max-w-full flex flex-col">
            <VirtualCoachGuide
              exercise={workout.currentExercise}
              stage={workout.metrics.stage ?? ""}
              lang={language}
              theme={theme}
            />
          </div>
        </div>
      </main>

      <Footer
        t={t}
        theme={theme}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenCookieSettings={() => setIsCookieSettingsOpen(true)}
      />

      <TvRemoteOverlay
        onPrev={workout.handlePrevExercise}
        onNext={workout.handleNextExercise}
        onAction={
          workout.isCompleted
            ? workout.handleNextExercise
            : workout.handleResetSet
        }
        onToggleSound={workout.handleToggleMute}
        isMuted={workout.isMuted}
        lang={language}
        theme={theme}
      />

      {workout.isCompleted && (
        <WorkoutSummaryModal
          exercise={workout.currentExercise}
          metrics={workout.metrics}
          onNextExercise={workout.handleNextExercise}
          onRepeat={workout.handleResetSet}
          onClose={workout.handleCloseModal}
          lang={language}
          theme={theme}
        />
      )}

      <CookieConsentBanner
        t={t}
        theme={theme}
        isSettingsOpen={isCookieSettingsOpen}
        onCloseSettings={() => setIsCookieSettingsOpen(false)}
        onOpenSettings={() => setIsCookieSettingsOpen(true)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        t={t}
        theme={theme}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        t={t}
        theme={theme}
      />

      <ScrollToTopButton lang={language} theme={theme} />
    </div>
  );
}
