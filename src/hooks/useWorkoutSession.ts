import { useState, useEffect, useRef, useCallback } from "react";
import { EXERCISES } from "../data/exercises";
import { ExerciseDefinition, ExerciseMetrics, Landmark } from "../types";
import { ExerciseTracker } from "../utils/exerciseClassifier";
import { audioCoach } from "../utils/audioCoach";
import { Language, translations } from "../data/translations";

export function useWorkoutSession(language: Language) {
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

  const trackerRef = useRef<ExerciseTracker>(
    new ExerciseTracker(currentExercise.id, language),
  );
  const timerIntervalRef = useRef<number | null>(null);
  const isSetFinishedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const currentRepsRef = useRef<number>(0);

  useEffect(() => {
    audioCoach.setLanguage(language);
    trackerRef.current.setLanguage(language);
  }, [language]);

  useEffect(() => {
    isSetFinishedRef.current = isCompleted;
  }, [isCompleted]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

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

      audioCoach.speak(exName, true);
    },
    [language],
  );

  // Timer treningu
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

  // Przetwarzanie klatek z MediaPipe
  const handlePoseDetected = useCallback(
    (landmarks: Landmark[]) => {
      if (isSetFinishedRef.current || isPausedRef.current) return;

      const result = trackerRef.current.processFrame(landmarks);

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

      setMetrics((prev) => {
        let newScores = [...(prev.accuracyScores || [])];
        let newCalories = prev.caloriesBurned;

        if (result.countedRep) {
          const score = result.repAccuracy > 0 ? result.repAccuracy : 90;
          newScores.push(score);
          newCalories += currentExercise.caloriePerRepOrSec ?? 0.3;
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

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      audioCoach.setMuted(nextMuted);
      return nextMuted;
    });
  }, []);

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

  const handleNextExercise = useCallback(() => {
    setExerciseIndex((prev) => {
      const nextIdx = (prev + 1) % EXERCISES.length;
      handleSelectExercise(EXERCISES[nextIdx]);
      return nextIdx;
    });
  }, [handleSelectExercise]);

  const handlePrevExercise = useCallback(() => {
    setExerciseIndex((prev) => {
      const prevIdx = (prev - 1 + EXERCISES.length) % EXERCISES.length;
      handleSelectExercise(EXERCISES[prevIdx]);
      return prevIdx;
    });
  }, [handleSelectExercise]);

  const handleCloseModal = useCallback(() => {
    setIsCompleted(false);
    setIsPaused(true);
  }, []);

  return {
    currentExercise,
    metrics,
    setMetrics,
    isMuted,
    setIsMuted,
    isCompleted,
    setIsCompleted,
    isPaused,
    setIsPaused,
    isPausedRef,
    currentRepsRef,
    handleSelectExercise,
    handlePoseDetected,
    handleToggleMute,
    handleResetSet,
    handleNextExercise,
    handlePrevExercise,
    handleCloseModal,
  };
}
