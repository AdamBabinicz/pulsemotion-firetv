import { useState, useEffect, useRef, useCallback } from "react";
import { audioCoach } from "../utils/audioCoach";
import { Language } from "../data/translations";

interface UseWakeLockOptions {
  language: Language;
  isPaused: boolean;
  isCompleted: boolean;
}

export function useWakeLock({
  language,
  isPaused,
  isCompleted,
}: UseWakeLockOptions) {
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const [isWakeLockSupported, setIsWakeLockSupported] = useState<boolean>(true);
  const wakeLockSentinelRef = useRef<any>(null);
  const shouldKeepAwakeRef = useRef<boolean>(false);
  const manualWakeLockForcedRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !("wakeLock" in navigator)) {
      setIsWakeLockSupported(false);
    }
  }, []);

  const requestWakeLock = useCallback(
    async (showFeedback = true) => {
      if (typeof window === "undefined" || !("wakeLock" in navigator)) {
        setIsWakeLockSupported(false);
        return false;
      }
      try {
        if (wakeLockSentinelRef.current) {
          try {
            await wakeLockSentinelRef.current.release();
          } catch {}
          wakeLockSentinelRef.current = null;
        }

        const sentinel = await (navigator as any).wakeLock.request("screen");
        wakeLockSentinelRef.current = sentinel;
        setIsWakeLockActive(true);
        shouldKeepAwakeRef.current = true;

        sentinel.addEventListener("release", () => {
          wakeLockSentinelRef.current = null;
          if (!shouldKeepAwakeRef.current) {
            setIsWakeLockActive(false);
          }
        });

        if (showFeedback) {
          audioCoach.speak(
            language === "pl"
              ? "Blokada wygaszania ekranu włączona"
              : "Screen wake lock activated",
          );
        }
        return true;
      } catch (err) {
        console.warn("Wake Lock request failed:", err);
        setIsWakeLockActive(false);
        shouldKeepAwakeRef.current = false;
        return false;
      }
    },
    [language],
  );

  const releaseWakeLock = useCallback(
    async (showFeedback = true) => {
      shouldKeepAwakeRef.current = false;
      if (wakeLockSentinelRef.current) {
        try {
          await wakeLockSentinelRef.current.release();
        } catch {}
        wakeLockSentinelRef.current = null;
      }
      setIsWakeLockActive(false);
      if (showFeedback) {
        audioCoach.speak(
          language === "pl"
            ? "Wygaszanie ekranu przywrócone"
            : "Screen sleep restored",
        );
      }
    },
    [language],
  );

  const handleToggleWakeLock = useCallback(async () => {
    if (isWakeLockActive) {
      manualWakeLockForcedRef.current = false;
      await releaseWakeLock(true);
    } else {
      manualWakeLockForcedRef.current = true;
      await requestWakeLock(true);
    }
  }, [isWakeLockActive, releaseWakeLock, requestWakeLock]);

  // Amazon Fire TV Energy Management
  useEffect(() => {
    const isActivelyTraining = !isPaused && !isCompleted;
    if (isActivelyTraining) {
      requestWakeLock(false);
    } else if (!manualWakeLockForcedRef.current) {
      releaseWakeLock(false);
    }
  }, [isPaused, isCompleted, requestWakeLock, releaseWakeLock]);

  // Wznawianie po powrocie do karty
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === "visible" &&
        shouldKeepAwakeRef.current
      ) {
        await requestWakeLock(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockSentinelRef.current) {
        try {
          wakeLockSentinelRef.current.release();
        } catch {}
      }
    };
  }, [requestWakeLock]);

  return {
    isWakeLockActive,
    isWakeLockSupported,
    handleToggleWakeLock,
  };
}
