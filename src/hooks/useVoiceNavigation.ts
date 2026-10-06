import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { voiceCommander, VoiceCommandEvent } from "../utils/voiceCommander";
import { audioCoach } from "../utils/audioCoach";
import { EXERCISES } from "../data/exercises";
import { ExerciseDefinition } from "../types";
import { Language } from "../data/translations";
import { detectTvEnvironment } from "../utils/fireTvEnvironment";

interface UseVoiceNavigationProps {
  language: Language;
  currentExercise: ExerciseDefinition;
  isCompleted: boolean;
  isPausedRef: React.MutableRefObject<boolean>;
  currentRepsRef: React.MutableRefObject<number>;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  setMetrics: React.Dispatch<React.SetStateAction<any>>;
  handleSelectExercise: (ex: ExerciseDefinition) => void;
  handleResetSet: () => void;
  handleNextExercise: () => void;
  handlePrevExercise: () => void;
  handleToggleTheme: () => void;
  handleToggleLanguage: () => void;
  setExternalDemoTrigger: React.Dispatch<
    React.SetStateAction<number | boolean>
  >;
}

export function useVoiceNavigation({
  language,
  currentExercise,
  isCompleted,
  isPausedRef,
  currentRepsRef,
  setIsPaused,
  setIsCompleted,
  setIsMuted,
  setMetrics,
  handleSelectExercise,
  handleResetSet,
  handleNextExercise,
  handlePrevExercise,
  handleToggleTheme,
  handleToggleLanguage,
  setExternalDemoTrigger,
}: UseVoiceNavigationProps) {
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const voiceTimeoutRef = useRef<number | null>(null);
  const lastPauseTimeRef = useRef<number>(0);

  const tvEnv = useMemo(() => detectTvEnvironment(), []);
  const isVoiceSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    const hasSpeech = !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
    // Na Fire TV Silk Browser Web Speech API nie ma dostępu do mikrofonu pilota
    return hasSpeech && !tvEnv.isTvLike;
  }, [tvEnv.isTvLike]);

  useEffect(() => {
    voiceCommander.setLanguage(language);
  }, [language]);

  useEffect(() => {
    return () => {
      voiceCommander.stop();
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, []);

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
        case "stop_listening":
          voiceCommander.stop();
          setIsVoiceListening(false);
          audioCoach.speak(
            language === "pl"
              ? "Sterowanie głosem wyłączone"
              : "Voice control turned off",
          );
          break;

        case "close_modal":
          setIsCompleted(false);
          setIsPaused(true);
          break;

        case "repeat_set":
          handleResetSet();
          break;

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
          if (Date.now() - lastPauseTimeRef.current < 2000) {
            return;
          }
          if (
            isCompleted ||
            currentRepsRef.current >= currentExercise.targetRepsOrSeconds
          ) {
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
          lastPauseTimeRef.current = Date.now();
          setIsPaused(true);
          setMetrics((prev: any) => ({
            ...prev,
            feedbackMessage:
              language === "pl"
                ? "Trening wstrzymany (Pauza). Naciśnij OK na pilocie lub powiedz Start."
                : "Workout paused. Press OK on remote or say Start to resume.",
          }));
          audioCoach.speak(
            language === "pl"
              ? "Przerwa w treningu. Trening wstrzymany."
              : "Workout paused. Rest time.",
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
      currentExercise.targetRepsOrSeconds,
      currentRepsRef,
      isPausedRef,
      setExternalDemoTrigger,
      setIsCompleted,
      setIsMuted,
      setIsPaused,
      setMetrics,
    ],
  );

  const voiceActionRef = useRef(handleVoiceAction);
  useEffect(() => {
    voiceActionRef.current = handleVoiceAction;
  }, [handleVoiceAction]);

  const handleToggleVoice = useCallback(() => {
    // Na Fire TV informujemy o sterowaniu pilotem
    if (!isVoiceSupported) {
      audioCoach.speak(
        language === "pl"
          ? "Na Fire TV steruj pilotem: strzałki D-pad, przycisk OK oraz Play/Pause."
          : "On Fire TV use your remote: D-pad arrows, OK button, and Play/Pause.",
      );
      return;
    }

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
                ? "Brak uprawnień do mikrofonu."
                : "Microphone permission denied.",
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
  }, [isVoiceListening, isVoiceSupported, language]);

  return {
    isVoiceListening,
    isVoiceSupported,
    lastVoiceCommand,
    handleToggleVoice,
  };
}
