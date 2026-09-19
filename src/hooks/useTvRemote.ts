import { useEffect } from "react";
import { ExerciseDefinition } from "../types";
import { Language, translations } from "../data/translations";
import {
  findNextSpatialElement,
  getFocusableElements,
  getTvActionFromEvent,
  getTvDirectionFromEvent,
  handleModalFocusTrap,
  setTvFocus,
  BackAction,
  resolveBackHierarchy,
  isNativelyActivated,
  shouldProgrammaticClick,
  TvActionKey,
} from "../utils/tvNavigation";

interface UseTvRemoteProps {
  currentExercise: ExerciseDefinition;
  reps: number;
  isPaused: boolean;
  isCompleted: boolean;
  isPrivacyOpen: boolean;
  isTermsOpen: boolean;
  isCookieSettingsOpen: boolean;
  currentRepsRef: React.MutableRefObject<number>;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPrivacyOpen: (v: boolean) => void;
  setIsTermsOpen: (v: boolean) => void;
  setIsCookieSettingsOpen: (v: boolean) => void;
  handleNextExercise: () => void;
  handlePrevExercise: () => void;
  handleResetSet: () => void;
  handleToggleMute: () => void;
  handleToggleVoice: () => void;
  handleToggleWakeLock: () => void;
  language: Language;
}

export function useTvRemote({
  currentExercise,
  reps,
  isPaused,
  isCompleted,
  isPrivacyOpen,
  isTermsOpen,
  isCookieSettingsOpen,
  currentRepsRef,
  setIsPaused,
  setIsCompleted,
  setIsPrivacyOpen,
  setIsTermsOpen,
  setIsCookieSettingsOpen,
  handleNextExercise,
  handlePrevExercise,
  handleResetSet,
  handleToggleMute,
  handleToggleVoice,
  handleToggleWakeLock,
  language,
}: UseTvRemoteProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const tvAction = getTvActionFromEvent(e);

      // 1. Przycisk Back (zgodnie z wytycznymi Amazon Fire TV)
      if (tvAction === TvActionKey.BACK) {
        const backAction = resolveBackHierarchy({
          isAnyModalOpen: isPrivacyOpen || isTermsOpen || isCookieSettingsOpen,
          isSummaryOpen: isCompleted,
          isFullscreen: document.fullscreenElement !== null,
          isWorkoutRunning: true,
          isPaused,
        });

        switch (backAction) {
          case BackAction.DISMISS_MODALS:
            e.preventDefault();
            setIsPrivacyOpen(false);
            setIsTermsOpen(false);
            setIsCookieSettingsOpen(false);
            return;
          case BackAction.CLOSE_SUMMARY:
            e.preventDefault();
            setIsCompleted(false);
            return;
          case BackAction.EXIT_FULLSCREEN:
            e.preventDefault();
            document.exitFullscreen().catch(() => {});
            return;
          case BackAction.PAUSE_WORKOUT:
            e.preventDefault();
            setIsPaused(true);
            return;
          case BackAction.PASS_TO_SYSTEM:
            return;
        }
      }

      // 2. Pułapka fokusu Tab w otwartym modalu
      if (e.key === "Tab") {
        const activeModal = document.querySelector<HTMLElement>(
          '#workout-summary-card, #privacy-policy-modal, #terms-modal, #cookie-settings-modal, #cookie-consent-banner, [role="dialog"]',
        );
        if (activeModal && handleModalFocusTrap(e, activeModal)) {
          return;
        }
      }

      // 3. Klawisze multimedialne pilota
      if (tvAction === TvActionKey.PLAY_PAUSE) {
        e.preventDefault();
        if (
          isCompleted ||
          currentRepsRef.current >= currentExercise.targetRepsOrSeconds
        ) {
          handleNextExercise();
        } else {
          setIsPaused((prev) => !prev);
        }
        return;
      }

      if (tvAction === TvActionKey.PLAY) {
        e.preventDefault();
        setIsPaused(false);
        return;
      }

      if (tvAction === TvActionKey.PAUSE) {
        e.preventDefault();
        setIsPaused(true);
        return;
      }

      if (tvAction === TvActionKey.TRACK_NEXT) {
        e.preventDefault();
        handleNextExercise();
        return;
      }

      if (tvAction === TvActionKey.TRACK_PREV) {
        e.preventDefault();
        handlePrevExercise();
        return;
      }

      // 4. D-Pad nawigacja 2D (Spatial Navigation)
      const direction = getTvDirectionFromEvent(e);
      if (direction) {
        e.preventDefault();

        const activeModal = document.querySelector<HTMLElement>(
          '#workout-summary-card, #privacy-policy-modal, #terms-modal, #cookie-settings-modal, #cookie-consent-banner, [role="dialog"]',
        );
        const scopeContainer = activeModal || document;
        const currentActive = document.activeElement as HTMLElement | null;

        if (
          !currentActive ||
          currentActive === document.body ||
          !scopeContainer.contains(currentActive)
        ) {
          const focusables = getFocusableElements(scopeContainer);
          if (focusables.length > 0) {
            setTvFocus(focusables[0]);
          }
          return;
        }

        const nextElement = findNextSpatialElement(
          currentActive,
          direction,
          scopeContainer,
        );
        if (nextElement) {
          setTvFocus(nextElement);
        } else if (activeModal) {
          handleModalFocusTrap(e, activeModal);
        }
        return;
      }

      // 5. Select / Enter / Space
      if (tvAction === TvActionKey.SELECT) {
        const activeElement = document.activeElement as HTMLElement | null;
        if (isNativelyActivated(activeElement)) {
          return;
        }
        if (shouldProgrammaticClick(activeElement)) {
          e.preventDefault();
          activeElement!.click();
          return;
        }

        e.preventDefault();
        if (isCompleted) {
          handleNextExercise();
        } else if (isPaused) {
          setIsPaused(false);
        } else {
          handleResetSet();
        }
        return;
      }

      // Skróty klawiaturowe
      if (e.key.toLowerCase() === "m") {
        handleToggleMute();
      } else if (e.key.toLowerCase() === "v") {
        handleToggleVoice();
      } else if (e.key.toLowerCase() === "w") {
        handleToggleWakeLock();
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
    handleToggleWakeLock,
    isCompleted,
    isPaused,
    isPrivacyOpen,
    isTermsOpen,
    isCookieSettingsOpen,
    currentExercise.targetRepsOrSeconds,
    currentRepsRef,
    setIsCompleted,
    setIsCookieSettingsOpen,
    setIsPaused,
    setIsPrivacyOpen,
    setIsTermsOpen,
  ]);

  // Media Session API dla pilota z Alexą i systemu
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    try {
      const exTrans =
        translations[language].exercises[
          currentExercise.id as keyof (typeof translations)["pl"]["exercises"]
        ];
      const exName = exTrans?.name || currentExercise.name;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${exName} (${reps}/${currentExercise.targetRepsOrSeconds})`,
        artist: "PulseMotion TV Coach",
        album: "Fire TV Fitness",
      });

      navigator.mediaSession.playbackState = isPaused ? "paused" : "playing";

      navigator.mediaSession.setActionHandler("play", () => {
        setIsPaused(false);
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        setIsPaused(true);
      });

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        handleNextExercise();
      });

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        handlePrevExercise();
      });
    } catch (err) {
      console.warn("MediaSession warning:", err);
    }
  }, [
    currentExercise.id,
    currentExercise.name,
    currentExercise.targetRepsOrSeconds,
    reps,
    isPaused,
    language,
    handleNextExercise,
    handlePrevExercise,
    setIsPaused,
  ]);

  // Amazon 10-Foot Initial Focus
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initialTarget =
        document.querySelector<HTMLElement>(
          '#exercise-tab-squats, [data-exercise-id="squats"], #exercise-selector-container button[data-tv-focusable="true"]',
        ) ??
        document.querySelector<HTMLElement>('button[data-tv-focusable="true"]');
      if (initialTarget) {
        setTvFocus(initialTarget);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);
}
