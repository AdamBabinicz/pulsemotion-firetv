import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EXERCISES } from './data/exercises';
import { ExerciseDefinition, ExerciseMetrics, FormQuality, Landmark } from './types';
import { ExerciseTracker } from './utils/exerciseClassifier';
import { audioCoach } from './utils/audioCoach';
import { PoseCamera } from './components/PoseCamera';
import { VirtualCoachGuide } from './components/VirtualCoachGuide';
import { WorkoutHUD } from './components/WorkoutHUD';
import { ExerciseSelector } from './components/ExerciseSelector';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { TvRemoteOverlay } from './components/TvRemoteOverlay';
import { VoiceControlBadge } from './components/VoiceControlBadge';
import { voiceCommander, VoiceCommandEvent } from './utils/voiceCommander';
import { Language, ThemeMode, translations } from './data/translations';
import { Tv, Maximize2, Minimize2, Activity, ShieldCheck, Sun, Moon, Languages } from 'lucide-react';

export default function App() {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('pulsemotion_lang') as Language) || 'pl';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('pulsemotion_theme') as ThemeMode) || 'dark';
  });

  const t = translations[language];

  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const currentExercise = EXERCISES[exerciseIndex];

  const [metrics, setMetrics] = useState<ExerciseMetrics>({
    reps: 0,
    target: currentExercise.targetRepsOrSeconds,
    currentAngle: 180,
    targetAngleMin: 80,
    targetAngleMax: 95,
    formQuality: 'idle',
    feedbackMessage: language === 'pl' ? 'Stań przed kamerą, aby rozpocząć' : 'Stand in front of camera to begin',
    caloriesBurned: 0,
    elapsedSeconds: 0,
    accuracyScores: [],
    averageAccuracy: 100,
    stage: language === 'pl' ? 'Stanie' : 'Standing',
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const [externalDemoTrigger, setExternalDemoTrigger] = useState<boolean>(false);

  const trackerRef = useRef<ExerciseTracker>(new ExerciseTracker(currentExercise.id, language));
  const timerIntervalRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);

  // Sync HTML class for dark/light mode
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pulsemotion_theme', theme);
  }, [theme]);

  // Sync audioCoach, tracker, and voice commander language
  useEffect(() => {
    audioCoach.setLanguage(language);
    trackerRef.current.setLanguage(language);
    voiceCommander.setLanguage(language);
    localStorage.setItem('pulsemotion_lang', language);
  }, [language]);

  // Clean up voice commander on unmount
  useEffect(() => {
    return () => {
      voiceCommander.stop();
    };
  }, []);

  // Synchronize completed state ref
  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  // Toggle Language Handler
  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'pl' ? 'en' : 'pl';
    setLanguageState(nextLang);
  };

  // Toggle Theme Handler
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
  };

  // Handle Exercise Selection Change
  const handleSelectExercise = useCallback((exercise: ExerciseDefinition) => {
    const idx = EXERCISES.findIndex((e) => e.id === exercise.id);
    if (idx !== -1) {
      setExerciseIndex(idx);
    }
    trackerRef.current.setExercise(exercise.id);
    setIsCompleted(false);

    const exTrans = translations[language].exercises[exercise.id as keyof typeof translations['pl']['exercises']];
    const exName = exTrans?.name || exercise.name;
    const exDesc = exTrans?.description || exercise.description;

    setMetrics({
      reps: 0,
      target: exercise.targetRepsOrSeconds,
      currentAngle: 180,
      targetAngleMin: 80,
      targetAngleMax: 95,
      formQuality: 'idle',
      feedbackMessage: `${translations[language].readyPrompt}: ${exName}`,
      caloriesBurned: 0,
      elapsedSeconds: 0,
      accuracyScores: [],
      averageAccuracy: 100,
      stage: translations[language].properPosture,
    });

    audioCoach.speak(language === 'pl' ? `Rozpoczynamy: ${exName}. ${exDesc}` : `Starting ${exName}. ${exDesc}`, true);
  }, [language]);

  // Workout Timer Effect
  useEffect(() => {
    timerIntervalRef.current = window.setInterval(() => {
      if (!isCompletedRef.current) {
        setMetrics((prev) => {
          if (prev.reps === 0 && prev.formQuality === 'idle') {
            return prev;
          }
          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        });
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Process Real-time Camera Landmarks from MediaPipe
  const handlePoseDetected = useCallback(
    (landmarks: Landmark[]) => {
      if (isCompletedRef.current) return;

      const result = trackerRef.current.processFrame(landmarks);

      setMetrics((prev) => {
        let newReps = prev.reps;
        let newScores = [...prev.accuracyScores];
        let newCalories = prev.caloriesBurned;

        if (result.countedRep) {
          newReps += 1;
          const score = result.repAccuracy > 0 ? result.repAccuracy : 90;
          newScores.push(score);
          newCalories += currentExercise.caloriePerRepOrSec;

          // Sound cues
          audioCoach.playRepSuccessTone();

          if (newReps >= currentExercise.targetRepsOrSeconds) {
            // Series completed!
            setIsCompleted(true);
            audioCoach.playWorkoutCompleteChime();
            audioCoach.speak(
              language === 'pl'
                ? 'Gratulacje! Seria treningowa zaliczona pomyślnie!'
                : 'Congratulations! Workout set completed!',
              true
            );
          } else {
            // Voice cue every rep or every 2 reps
            if (newReps % 2 === 0) {
              audioCoach.speak(`${newReps}! ${result.feedbackMessage}`);
            }
          }
        } else if (result.formQuality === 'needs_correction') {
          audioCoach.playFormWarningTone();
          audioCoach.speak(result.feedbackMessage);
        }

        const avgAccuracy =
          newScores.length > 0
            ? Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length)
            : 100;

        return {
          ...prev,
          reps: newReps,
          currentAngle: result.currentAngle,
          targetAngleMin: result.targetAngleMin,
          targetAngleMax: result.targetAngleMax,
          formQuality: result.formQuality,
          feedbackMessage: result.feedbackMessage,
          caloriesBurned: newCalories,
          accuracyScores: newScores,
          averageAccuracy: avgAccuracy,
          stage: result.stage,
        };
      });
    },
    [currentExercise, language]
  );

  // Toggle Mute Audio
  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioCoach.setMuted(nextMuted);
  }, [isMuted]);

  // Reset current workout set
  const handleResetSet = useCallback(() => {
    trackerRef.current.reset();
    setIsCompleted(false);
    setMetrics((prev) => ({
      ...prev,
      reps: 0,
      caloriesBurned: 0,
      elapsedSeconds: 0,
      accuracyScores: [],
      averageAccuracy: 100,
      formQuality: 'idle',
      feedbackMessage: language === 'pl' ? 'Zresetowano serię. Rozpocznij ponownie' : 'Set reset. Start again',
      stage: language === 'pl' ? 'Gotowy' : 'Ready',
    }));
    audioCoach.speak(language === 'pl' ? 'Seria zresetowana. Czekam na Twoją pozycję.' : 'Set reset. Ready when you are.');
  }, [language]);

  // Next exercise progression
  const handleNextExercise = useCallback(() => {
    const nextIdx = (exerciseIndex + 1) % EXERCISES.length;
    handleSelectExercise(EXERCISES[nextIdx]);
  }, [exerciseIndex, handleSelectExercise]);

  // Previous exercise progression
  const handlePrevExercise = useCallback(() => {
    const prevIdx = (exerciseIndex - 1 + EXERCISES.length) % EXERCISES.length;
    handleSelectExercise(EXERCISES[prevIdx]);
  }, [exerciseIndex, handleSelectExercise]);

  // Voice Command Dispatcher
  const handleVoiceAction = useCallback(
    (event: VoiceCommandEvent) => {
      setLastVoiceCommand(event.transcript);
      setTimeout(() => setLastVoiceCommand(null), 2500);

      switch (event.action) {
        case 'next':
          handleNextExercise();
          audioCoach.speak(language === 'pl' ? 'Kolejne ćwiczenie' : 'Next exercise');
          break;
        case 'prev':
          handlePrevExercise();
          audioCoach.speak(language === 'pl' ? 'Poprzednie ćwiczenie' : 'Previous exercise');
          break;
        case 'reset':
          handleResetSet();
          break;
        case 'mute':
          setIsMuted(true);
          audioCoach.setMuted(true);
          break;
        case 'unmute':
          setIsMuted(false);
          audioCoach.setMuted(false);
          audioCoach.speak(language === 'pl' ? 'Głos trenera aktywny' : 'Voice unmuted');
          break;
        case 'toggle_theme':
          handleToggleTheme();
          break;
        case 'toggle_lang':
          handleToggleLanguage();
          break;
        case 'start_demo':
          setExternalDemoTrigger((prev) => !prev);
          break;
      }
    },
    [
      handleNextExercise,
      handlePrevExercise,
      handleResetSet,
      handleToggleTheme,
      handleToggleLanguage,
      language,
    ]
  );

  // Toggle Voice Control Listening
  const handleToggleVoice = useCallback(() => {
    if (isVoiceListening) {
      voiceCommander.stop();
      setIsVoiceListening(false);
      audioCoach.speak(language === 'pl' ? 'Odsłuch wyłączony' : 'Voice control off');
    } else {
      voiceCommander.start(
        (event) => {
          handleVoiceAction(event);
        },
        (error) => {
          console.warn('Speech error:', error);
        }
      );
      setIsVoiceListening(true);
      audioCoach.speak(
        language === 'pl'
          ? 'Sterowanie głosem włączone. Powiedz komendę.'
          : 'Voice control active. Say a command.'
      );
    }
  }, [isVoiceListening, handleVoiceAction, language]);

  // Toggle Fullscreen mode for full TV experience
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard controls (Simulating Fire TV Remote Control)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextExercise();
      } else if (e.key === 'ArrowLeft') {
        handlePrevExercise();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (isCompleted) {
          handleNextExercise();
        } else {
          handleResetSet();
        }
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextExercise, handlePrevExercise, handleResetSet, handleToggleMute, isCompleted]);

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'
      }`}
    >
      {/* Top TV Navigation Bar */}
      <header
        className={`w-full border-b sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between transition-colors ${
          isDark
            ? 'border-neutral-800/80 bg-neutral-900/80 backdrop-blur-xl'
            : 'border-neutral-200/80 bg-white/85 backdrop-blur-xl shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 shadow-md shadow-emerald-500/20">
            <Activity className="w-5 h-5 font-bold" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                {t.appTitle}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {t.appSubtitle}
              </span>
            </div>
            <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {t.privacyBadge}
            </span>
          </div>
        </div>

        {/* Right Status / Toggles / Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* TV Navigation Hint */}
          <div
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark
                ? 'bg-neutral-800/70 border-neutral-700/80 text-neutral-300'
                : 'bg-neutral-100 border-neutral-200 text-neutral-700'
            }`}
          >
            <Tv className="w-4 h-4 text-emerald-500" />
            <span>{t.tvModeHint}</span>
          </div>

          {/* Hands-Free Voice Control Badge & Cheat Sheet */}
          <VoiceControlBadge
            isListening={isVoiceListening}
            onToggleListening={handleToggleVoice}
            lastCommandText={lastVoiceCommand}
            lang={language}
            theme={theme}
          />

          {/* Language Toggle (PL / EN) */}
          <button
            id="btn-toggle-lang"
            onClick={handleToggleLanguage}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs transition-all ${
              isDark
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
            }`}
            title={language === 'pl' ? 'Switch to English' : 'Przełącz na Polski'}
          >
            <Languages className="w-4 h-4 text-emerald-500" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            id="btn-toggle-theme"
            onClick={handleToggleTheme}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border-neutral-700'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
            }`}
            title={isDark ? t.themeLight : t.themeDark}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Fullscreen TV Mode Toggle */}
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            className={`hidden sm:flex p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
            }`}
            title={isFullscreen ? 'Wyłącz pełny ekran' : 'Pełny ekran TV'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main TV / Mobile Dashboard Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6">
        {/* TV Workout Exercise Selector Carousel */}
        <ExerciseSelector
          currentExercise={currentExercise}
          onSelect={handleSelectExercise}
          lang={language}
          theme={theme}
        />

        {/* Real-time Metric HUD */}
        <WorkoutHUD
          exercise={currentExercise}
          metrics={metrics}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onResetSet={handleResetSet}
          lang={language}
          theme={theme}
        />

        {/* Split Screen Stage: Mobile orders Camera first for eye-level view */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 items-stretch min-h-[440px] sm:min-h-[500px]">
          {/* Real-time Camera with AI Skeleton (order-1 on mobile, 7 cols on desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-7 h-full min-h-[360px] sm:min-h-[420px]">
            <PoseCamera
              onPoseDetected={handlePoseDetected}
              formQuality={metrics.formQuality}
              currentAngle={metrics.currentAngle}
              exerciseId={currentExercise.id}
              lang={language}
              theme={theme}
              externalDemoTrigger={externalDemoTrigger}
            />
          </div>

          {/* Virtual Coach Blueprint & Motion Reference (order-2 on mobile, 5 cols on desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-5 h-full">
            <VirtualCoachGuide
              exercise={currentExercise}
              stage={metrics.stage}
              lang={language}
              theme={theme}
            />
          </div>
        </div>
      </main>

      {/* Fire TV Virtual D-Pad Remote Control Overlay */}
      <TvRemoteOverlay
        onPrev={handlePrevExercise}
        onNext={handleNextExercise}
        onAction={isCompleted ? handleNextExercise : handleResetSet}
        onToggleSound={handleToggleMute}
        isMuted={isMuted}
        lang={language}
        theme={theme}
      />

      {/* Workout Set Completed Celebration Modal */}
      {isCompleted && (
        <WorkoutSummaryModal
          exercise={currentExercise}
          metrics={metrics}
          onNextExercise={handleNextExercise}
          onRepeat={handleResetSet}
          lang={language}
          theme={theme}
        />
      )}
    </div>
  );
}
