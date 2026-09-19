import { useState, useEffect, useRef, useCallback } from "react";
import { voiceCommander, VoiceCommandEvent } from "../utils/voiceCommander";
import { audioCoach } from "../utils/audioCoach";
import { EXERCISES } from "../data/exercises";
import { ExerciseDefinition } from "../types";
import { Language } from "../data/translations";

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
  // Zabezpieczenie przed samowyzwoleniem 'start' przez echo głośników lektora
  const lastPauseTimeRef = useRef<number>(0);

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
          // Jeśli pauza nastąpiła mniej niż 2 sekundy temu, ignorujemy echo lektora
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
                ? "Trening wstrzymany (Pauza). Powiedz 'Start', aby wznowić."
                : "Workout paused. Say 'Start' to resume.",
          }));
          // Usunięto wyraz 'Start' z mowy lektora, aby głośnik nie wyzwalał mikrofonu
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

  return {
    isVoiceListening,
    lastVoiceCommand,
    handleToggleVoice,
  };
}
