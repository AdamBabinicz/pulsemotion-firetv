import React, { useState, useEffect, useRef, useCallback } from "react";
import { EXERCISES } from "./data/exercises";
import {
  ExerciseDefinition,
  ExerciseMetrics,
  FormQuality,
  Landmark,
} from "./types";
import { ExerciseTracker } from "./utils/exerciseClassifier";
import { audioCoach } from "./utils/audioCoach";
import { PoseCamera } from "./components/PoseCamera";
import { VirtualCoachGuide } from "./components/VirtualCoachGuide";
import { WorkoutHUD } from "./components/WorkoutHUD";
import { ExerciseSelector } from "./components/ExerciseSelector";
import { WorkoutSummaryModal } from "./components/WorkoutSummaryModal";
import { TvRemoteOverlay } from "./components/TvRemoteOverlay";
import { VoiceControlBadge } from "./components/VoiceControlBadge";
import { voiceCommander, VoiceCommandEvent } from "./utils/voiceCommander";
import { Language, ThemeMode, translations } from "./data/translations";

// Komponenty prawne, cookies i stopka
import { Footer } from "./components/Footer";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { PrivacyPolicyModal } from "./components/PrivacyPolicyModal";
import { TermsModal } from "./components/TermsModal";

import {
  Tv,
  Maximize2,
  Minimize2,
  Activity,
  ShieldCheck,
  Sun,
  Moon,
  Languages,
  Mic,
  MicOff,
  Sparkles,
  PauseCircle,
  PlayCircle,
} from "lucide-react";

export default function App() {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("pulsemotion_lang") as Language) || "pl";
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("pulsemotion_theme") as ThemeMode) || "dark";
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
    formQuality: "idle",
    feedbackMessage:
      language === "pl"
        ? "Stań przed kamerą, aby rozpocząć"
        : "Stand in front of camera to begin",
    caloriesBurned: 0,
    elapsedSeconds: 0,
    accuracyScores: [],
    averageAccuracy: 100,
    stage: language === "pl" ? "Stanie" : "Standing",
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const [externalDemoTrigger, setExternalDemoTrigger] = useState<
    number | boolean
  >(false);

  // Stany otwarcia modali prawnych i cookies
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] =
    useState<boolean>(false);

  const trackerRef = useRef<ExerciseTracker>(
    new ExerciseTracker(currentExercise.id, language),
  );
  const timerIntervalRef = useRef<number | null>(null);
  const isSetFinishedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const currentRepsRef = useRef<number>(0);
  const voiceTimeoutRef = useRef<number | null>(null);

  // Sync HTML class for dark/light mode
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("pulsemotion_theme", theme);
  }, [theme]);

  // Sync audioCoach, tracker, and voice commander language
  useEffect(() => {
    audioCoach.setLanguage(language);
    trackerRef.current.setLanguage(language);
    voiceCommander.setLanguage(language);
    localStorage.setItem("pulsemotion_lang", language);
  }, [language]);

  // Clean up voice commander on unmount
  useEffect(() => {
    return () => {
      voiceCommander.stop();
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, []);

  // Synchronize completed state ref
  useEffect(() => {
    isSetFinishedRef.current = isCompleted;
  }, [isCompleted]);

  // Synchronize paused state ref
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Toggle Language Handler
  const handleToggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "pl" ? "en" : "pl"));
  }, []);

  // Toggle Theme Handler
  const handleToggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Handle Exercise Selection Change
  const handleSelectExercise = useCallback(
    (exercise: ExerciseDefinition) => {
      const idx = EXERCISES.findIndex((e) => e.id === exercise.id);
      if (idx !== -1) {
        setExerciseIndex(idx);
      }
      trackerRef.current.setExercise(exercise.id);
      isSetFinishedRef.current = false;
      isPausedRef.current = false;
      setIsPaused(false);
      currentRepsRef.current = 0;
      setIsCompleted(false);
      audioCoach.resetQueue();

      const exTrans =
        translations[language].exercises[
          exercise.id as keyof (typeof translations)["pl"]["exercises"]
        ];
      const exName = exTrans?.name || exercise.name;

      setMetrics({
        reps: 0,
        target: exercise.targetRepsOrSeconds,
        currentAngle: 180,
        targetAngleMin: 80,
        targetAngleMax: 95,
        formQuality: "idle",
        feedbackMessage: `${translations[language].readyPrompt}: ${exName}`,
        caloriesBurned: 0,
        elapsedSeconds: 0,
        accuracyScores: [],
        averageAccuracy: 100,
        stage: translations[language].properPosture,
      });

      // Short, crisp intro that won't block the first rep
      audioCoach.speak(exName, true);
    },
    [language],
  );

  // Workout Timer Effect (Respects Pause)
  useEffect(() => {
    timerIntervalRef.current = window.setInterval(() => {
      if (!isSetFinishedRef.current && !isPausedRef.current) {
        setMetrics((prev) => {
          if (prev.reps === 0 && prev.formQuality === "idle") {
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

  // Process Real-time Camera Landmarks from MediaPipe (Respects Pause)
  const handlePoseDetected = useCallback(
    (landmarks: Landmark[]) => {
      if (isSetFinishedRef.current || isPausedRef.current) return;

      const result = trackerRef.current.processFrame(landmarks);

      // Audio and state side-effects
      if (result.countedRep) {
        currentRepsRef.current += 1;
        const newRepCount = currentRepsRef.current;

        audioCoach.playRepSuccessTone();

        if (newRepCount >= currentExercise.targetRepsOrSeconds) {
          isSetFinishedRef.current = true;
          setIsCompleted(true);
          audioCoach.playWorkoutCompleteChime();
          audioCoach.speak(
            language === "pl"
              ? "Gratulacje! Seria ukończona!"
              : "Congratulations! Set completed!",
            true,
          );
        } else {
          audioCoach.speakRep(newRepCount);
        }
      } else if (result.formQuality === "needs_correction") {
        audioCoach.playFormWarningTone();
        audioCoach.speak(result.feedbackMessage);
      }

      // Pure metrics state update
      setMetrics((prev) => {
        let newScores = [...prev.accuracyScores];
        let newCalories = prev.caloriesBurned;

        if (result.countedRep) {
          const score = result.repAccuracy > 0 ? result.repAccuracy : 90;
          newScores.push(score);
          newCalories += currentExercise.caloriePerRepOrSec;
        }

        const avgAccuracy =
          newScores.length > 0
            ? Math.round(
                newScores.reduce((a, b) => a + b, 0) / newScores.length,
              )
            : 100;

        return {
          ...prev,
          reps: currentRepsRef.current,
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
    [currentExercise, language],
  );

  // Toggle Mute Audio
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      audioCoach.setMuted(nextMuted);
      return nextMuted;
    });
  }, []);

  // Reset current workout set
  const handleResetSet = useCallback(() => {
    trackerRef.current.reset();
    isSetFinishedRef.current = false;
    isPausedRef.current = false;
    setIsPaused(false);
    currentRepsRef.current = 0;
    setIsCompleted(false);
    audioCoach.resetQueue();
    setMetrics((prev) => ({
      ...prev,
      reps: 0,
      caloriesBurned: 0,
      elapsedSeconds: 0,
      accuracyScores: [],
      averageAccuracy: 100,
      formQuality: "idle",
      feedbackMessage:
        language === "pl"
          ? "Zresetowano serię. Rozpocznij ponownie"
          : "Set reset. Start again",
      stage: language === "pl" ? "Gotowy" : "Ready",
    }));
    audioCoach.speak(language === "pl" ? "Seria zresetowana." : "Set reset.");
  }, [language]);

  // Next exercise progression
  const handleNextExercise = useCallback(() => {
    setExerciseIndex((prev) => {
      const nextIdx = (prev + 1) % EXERCISES.length;
      handleSelectExercise(EXERCISES[nextIdx]);
      return nextIdx;
    });
  }, [handleSelectExercise]);

  // Previous exercise progression
  const handlePrevExercise = useCallback(() => {
    setExerciseIndex((prev) => {
      const prevIdx = (prev - 1 + EXERCISES.length) % EXERCISES.length;
      handleSelectExercise(EXERCISES[prevIdx]);
      return prevIdx;
    });
  }, [handleSelectExercise]);

  // Close summary modal
  const handleCloseModal = useCallback(() => {
    setIsCompleted(false);
  }, []);

  // Voice Command Dispatcher with ref to avoid stale closures
  const handleVoiceAction = useCallback(
    (event: VoiceCommandEvent) => {
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
      setLastVoiceCommand(event.transcript);
      voiceTimeoutRef.current = window.setTimeout(() => {
        setLastVoiceCommand(null);
      }, 3000);

      switch (event.action) {
        // Direct Microphone Shutdown via Voice
        case "stop_listening":
          voiceCommander.stop();
          setIsVoiceListening(false);
          audioCoach.speak(
            language === "pl"
              ? "Sterowanie głosem wyłączone"
              : "Voice control turned off",
          );
          break;

        // Direct Modal Control via Voice
        case "close_modal":
          setIsCompleted(false);
          audioCoach.speak(
            language === "pl" ? "Powrót do treningu" : "Back to workout",
          );
          break;

        case "repeat_set":
          handleResetSet();
          break;

        // Direct Exercise Selection via Voice (Always closes modal if open)
        case "exercise_squats": {
          setIsCompleted(false);
          const ex = EXERCISES.find((e) => e.id === "squats");
          if (ex) handleSelectExercise(ex);
          break;
        }
        case "exercise_jumping_jacks": {
          setIsCompleted(false);
          const ex = EXERCISES.find((e) => e.id === "jumping_jacks");
          if (ex) handleSelectExercise(ex);
          break;
        }
        case "exercise_high_knees": {
          setIsCompleted(false);
          const ex = EXERCISES.find((e) => e.id === "high_knees");
          if (ex) handleSelectExercise(ex);
          break;
        }
        case "exercise_tree_pose": {
          setIsCompleted(false);
          const ex = EXERCISES.find((e) => e.id === "tree_pose");
          if (ex) handleSelectExercise(ex);
          break;
        }
        case "exercise_arm_raises": {
          setIsCompleted(false);
          const ex = EXERCISES.find((e) => e.id === "arm_raises");
          if (ex) handleSelectExercise(ex);
          break;
        }

        // Navigation
        case "next":
          handleNextExercise();
          audioCoach.speak(
            language === "pl" ? "Kolejne ćwiczenie" : "Next exercise",
          );
          break;
        case "prev":
          handlePrevExercise();
          audioCoach.speak(
            language === "pl" ? "Poprzednie ćwiczenie" : "Previous exercise",
          );
          break;
        case "reset":
          handleResetSet();
          break;
        case "mute":
          setIsMuted(true);
          audioCoach.setMuted(true);
          audioCoach.speak(
            language === "pl" ? "Dźwięk wyciszony" : "Sound muted",
          );
          break;
        case "unmute":
          setIsMuted(false);
          audioCoach.setMuted(false);
          audioCoach.speak(
            language === "pl" ? "Głos trenera aktywny" : "Voice unmuted",
          );
          break;
        case "toggle_theme":
          handleToggleTheme();
          break;
        case "toggle_lang":
          handleToggleLanguage();
          break;
        case "start_demo":
          setIsCompleted(false);
          setIsPaused(false);
          setExternalDemoTrigger(Date.now());
          audioCoach.speak(
            language === "pl" ? "Włączono symulator" : "Simulator active",
          );
          break;
        case "stop_demo":
          setExternalDemoTrigger(false);
          audioCoach.speak(
            language === "pl" ? "Wyłączono symulator" : "Simulator stopped",
          );
          break;
        case "start":
          if (isCompleted) {
            handleNextExercise();
          } else if (isPausedRef.current) {
            setIsPaused(false);
            audioCoach.speak(
              language === "pl"
                ? "Wznawiamy trening! Dajesz dalej."
                : "Resuming workout! Keep going.",
            );
          } else {
            audioCoach.speak(
              language === "pl"
                ? "Rozpoczynamy serię! Stań prosto."
                : "Starting set! Stand straight.",
            );
          }
          break;
        case "pause":
          setIsPaused(true);
          setMetrics((prev) => ({
            ...prev,
            feedbackMessage:
              language === "pl"
                ? "Trening wstrzymany (Pauza). Powiedz 'Start', aby wznowić."
                : "Workout paused. Say 'Start' to resume.",
          }));
          audioCoach.speak(
            language === "pl"
              ? "Przerwa w treningu. Powiedz 'Start', aby wznowić."
              : "Workout paused. Say 'Start' to resume.",
          );
          break;
        default:
          break;
      }
    },
    [
      handleNextExercise,
      handlePrevExercise,
      handleResetSet,
      handleSelectExercise,
      handleToggleTheme,
      handleToggleLanguage,
      isCompleted,
      language,
    ],
  );

  // Keep a ref to the latest handleVoiceAction to ensure voiceCommander always uses current state
  const voiceActionRef = useRef(handleVoiceAction);
  useEffect(() => {
    voiceActionRef.current = handleVoiceAction;
  }, [handleVoiceAction]);

  // Toggle Voice Control Listening
  const handleToggleVoice = useCallback(() => {
    if (isVoiceListening) {
      voiceCommander.stop();
      setIsVoiceListening(false);
      audioCoach.speak(
        language === "pl" ? "Sterowanie głosem wyłączone" : "Voice control off",
      );
    } else {
      setIsVoiceListening(true);
      voiceCommander.start(
        (event) => {
          voiceActionRef.current(event);
        },
        (error) => {
          console.warn("Speech recognition error:", error);
          if (error === "not-allowed" || error === "service-not-allowed") {
            setIsVoiceListening(false);
            audioCoach.speak(
              language === "pl"
                ? "Brak uprawnień do mikrofonu. Sprawdź ustawienia przeglądarki."
                : "Microphone permission denied. Check browser settings.",
            );
          }
        },
        undefined,
        (listeningState) => {
          setIsVoiceListening(listeningState);
        },
      );
      audioCoach.speak(
        language === "pl"
          ? "Sterowanie głosem aktywne. Słucham komend."
          : "Voice control active. Listening for commands.",
      );
    }
  }, [isVoiceListening, language]);

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

  // Keyboard and Fire TV Remote controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isPrivacyOpen || isTermsOpen || isCookieSettingsOpen) {
          setIsPrivacyOpen(false);
          setIsTermsOpen(false);
          setIsCookieSettingsOpen(false);
        } else if (isCompleted) {
          setIsCompleted(false);
        } else {
          setIsPaused((prev) => !prev);
        }
      } else if (e.key === "ArrowRight") {
        handleNextExercise();
      } else if (e.key === "ArrowLeft") {
        handlePrevExercise();
      } else if (e.key === " " || e.key === "Enter") {
        if (isCompleted) {
          handleNextExercise();
        } else if (isPaused) {
          setIsPaused(false);
        } else {
          handleResetSet();
        }
      } else if (e.key.toLowerCase() === "m") {
        handleToggleMute();
      } else if (e.key.toLowerCase() === "v") {
        handleToggleVoice();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleNextExercise,
    handlePrevExercise,
    handleResetSet,
    handleToggleMute,
    handleToggleVoice,
    isCompleted,
    isPaused,
    isPrivacyOpen,
    isTermsOpen,
    isCookieSettingsOpen,
  ]);

  const isDark = theme === "dark";

  return (
    <div
      id="app-root-container"
      className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col font-sans transition-colors duration-300 ${
        isDark
          ? "bg-neutral-950 text-neutral-100"
          : "bg-neutral-50 text-neutral-900"
      }`}
    >
      {/* Top TV Navigation Bar */}
      <header
        id="app-header"
        className={`w-full max-w-full overflow-hidden border-b sticky top-0 z-30 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between transition-colors ${
          isDark
            ? "border-neutral-800/80 bg-neutral-900/80 backdrop-blur-xl"
            : "border-neutral-200/80 bg-white/85 backdrop-blur-xl shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 shadow-md shadow-emerald-500/20 shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 font-bold" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`text-base sm:text-lg font-black tracking-tight truncate ${isDark ? "text-white" : "text-neutral-950"}`}
              >
                {t.appTitle}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {t.appSubtitle}
              </span>
            </div>
            <span
              className={`text-[11px] sm:text-xs flex items-center gap-1 truncate ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{t.privacyBadge}</span>
            </span>
          </div>
        </div>

        {/* Right Status / Toggles / Actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <div
            id="hint-tv-navigation"
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark
                ? "bg-neutral-800/70 border-neutral-700/80 text-neutral-300"
                : "bg-neutral-100 border-neutral-200 text-neutral-700"
            }`}
          >
            <Tv className="w-4 h-4 text-emerald-500" />
            <span>{t.tvModeHint}</span>
          </div>

          <VoiceControlBadge
            isListening={isVoiceListening}
            onToggleListening={handleToggleVoice}
            lastCommandText={lastVoiceCommand}
            lang={language}
            theme={theme}
          />

          <button
            id="btn-toggle-lang"
            type="button"
            onClick={handleToggleLanguage}
            className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
              isDark
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
            }`}
            title={
              language === "pl" ? "Switch to English" : "Przełącz na Polski"
            }
          >
            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            <span>{language.toUpperCase()}</span>
          </button>

          <button
            id="btn-toggle-theme"
            type="button"
            onClick={handleToggleTheme}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
              isDark
                ? "bg-neutral-800 hover:bg-neutral-700 text-amber-400 border-neutral-700"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
            }`}
            title={isDark ? t.themeLight : t.themeDark}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          <button
            id="btn-toggle-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            className={`hidden sm:flex p-2 rounded-xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
              isDark
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300"
            }`}
            title={isFullscreen ? "Wyłącz pełny ekran" : "Pełny ekran TV"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Voice Prompt Hint Bar */}
      <div
        id="voice-quick-hint-bar"
        className={`w-full max-w-full overflow-hidden border-b px-3 sm:px-8 py-2 flex items-center justify-between text-xs transition-colors ${
          isDark
            ? "bg-neutral-900/50 border-neutral-800/60 text-neutral-400"
            : "bg-emerald-50/50 border-emerald-100 text-emerald-900"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
            {isVoiceListening ? "Voice Ready:" : "Głos:"}
          </span>
          <span className="truncate opacity-90">
            {isVoiceListening ? t.voiceHintBar : t.voiceMicMutedHint}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 shrink-0 ml-2">
          <button
            onClick={handleToggleVoice}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:underline"
          >
            {isVoiceListening ? (
              <>
                <Mic className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>Odsłuch aktywny (klawisz V)</span>
              </>
            ) : (
              <>
                <MicOff className="w-3 h-3" />
                <span>Włącz odsłuch (klawisz V)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prominent Pause State Banner on TV */}
      {isPaused && (
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
            onClick={() => setIsPaused(false)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-colors shrink-0"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Wznów (Start)</span>
          </button>
        </div>
      )}

      {/* Main TV / Mobile Dashboard Canvas */}
      <main
        id="app-main-content"
        className="flex-1 w-full max-w-7xl mx-auto px-3 py-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 overflow-x-hidden"
      >
        <ExerciseSelector
          currentExercise={currentExercise}
          onSelect={handleSelectExercise}
          lang={language}
          theme={theme}
        />

        <WorkoutHUD
          exercise={currentExercise}
          metrics={metrics}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onResetSet={handleResetSet}
          lang={language}
          theme={theme}
        />

        {/* Split Screen Stage */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 items-stretch min-h-[440px] sm:min-h-[500px] w-full max-w-full overflow-hidden">
          <div className="order-1 lg:order-2 lg:col-span-7 h-full min-h-[360px] sm:min-h-[420px] w-full max-w-full overflow-hidden">
            <PoseCamera
              onPoseDetected={handlePoseDetected}
              formQuality={metrics.formQuality}
              currentAngle={metrics.currentAngle}
              exerciseId={currentExercise.id}
              lang={language}
              theme={theme}
              externalDemoTrigger={externalDemoTrigger}
              onDemoModeChange={(isActive) => {
                if (!isActive) {
                  setExternalDemoTrigger(false);
                }
              }}
              isWorkoutCompleted={isCompleted}
              isPaused={isPaused}
            />
          </div>

          <div className="order-2 lg:order-1 lg:col-span-5 h-full w-full max-w-full overflow-hidden">
            <VirtualCoachGuide
              exercise={currentExercise}
              stage={metrics.stage}
              lang={language}
              theme={theme}
            />
          </div>
        </div>
      </main>

      {/* Stopka aplikacji z przekazanym theme={theme} */}
      <Footer
        t={t}
        theme={theme}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenCookieSettings={() => setIsCookieSettingsOpen(true)}
      />

      {/* Nakładka pilota Fire TV */}
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
          onClose={handleCloseModal}
          lang={language}
          theme={theme}
        />
      )}

      {/* Banner i modale prawne & cookies z przekazanym theme={theme} */}
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
    </div>
  );
}
