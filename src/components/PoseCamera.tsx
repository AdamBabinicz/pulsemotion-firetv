import React, { useEffect, useRef, useState, useCallback } from "react";
import { Landmark, FormQuality } from "../types";
import { POSE_CONNECTIONS, POSE_LANDMARKS } from "../utils/poseGeometry";
import { getBiomechanicalLandmarks } from "../utils/biomechanicalSimulator";
import {
  Camera,
  CameraOff,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  SwitchCamera,
  Activity,
  PauseCircle,
  Tv,
} from "lucide-react";
import { Language, ThemeMode, translations } from "../data/translations";
import {
  findNextSpatialElement,
  TvDirection,
  setTvFocus,
} from "../utils/tvNavigation";
import { requestCameraRuntimePermission } from "../utils/cameraPermissions";
import { detectTvEnvironment } from "../utils/fireTvEnvironment";

interface PoseCameraProps {
  onPoseDetected: (landmarks: Landmark[]) => void;
  formQuality: FormQuality;
  currentAngle?: number;
  exerciseId: string;
  lang: Language;
  theme: ThemeMode;
  externalDemoTrigger?: boolean | number;
  onDemoModeChange?: (isActive: boolean) => void;
  isWorkoutCompleted?: boolean;
  isPaused?: boolean;
}

declare global {
  interface Window {
    Pose: any;
    Camera: any;
  }
}

export const PoseCamera: React.FC<PoseCameraProps> = ({
  onPoseDetected,
  formQuality,
  currentAngle = 180,
  exerciseId,
  lang,
  theme,
  externalDemoTrigger,
  onDemoModeChange,
  isWorkoutCompleted = false,
  isPaused = false,
}) => {
  const t = translations[lang];
  const isDark = theme === "dark";
  const tvEnv = detectTvEnvironment();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const demoButtonRef = useRef<HTMLButtonElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFailureReason, setCameraFailureReason] = useState<
    "none" | "no-device" | "denied" | "generic"
  >("none");
  const [hasCameraError, setHasCameraError] = useState<boolean>(false);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(0);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const showSkeletonRef = useRef<boolean>(showSkeleton);
  const demoModeRef = useRef<boolean>(demoMode);
  const exerciseIdRef = useRef<string>(exerciseId);
  const formQualityRef = useRef<FormQuality>(formQuality);
  const currentAngleRef = useRef<number>(currentAngle);
  const isDarkRef = useRef<boolean>(isDark);
  const prevExternalDemoRef = useRef<boolean | number | undefined>(
    externalDemoTrigger,
  );
  const onPoseDetectedRef = useRef(onPoseDetected);
  const onDemoModeChangeRef = useRef(onDemoModeChange);
  const simulationProgressRef = useRef<number>(0);
  const isWorkoutCompletedRef = useRef<boolean>(isWorkoutCompleted);
  const isPausedRef = useRef<boolean>(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    onPoseDetectedRef.current = onPoseDetected;
  }, [onPoseDetected]);

  useEffect(() => {
    onDemoModeChangeRef.current = onDemoModeChange;
  }, [onDemoModeChange]);

  useEffect(() => {
    showSkeletonRef.current = showSkeleton;
    if (!showSkeleton && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [showSkeleton]);

  useEffect(() => {
    demoModeRef.current = demoMode;
    if (onDemoModeChangeRef.current) {
      onDemoModeChangeRef.current(demoMode);
    }
  }, [demoMode]);

  useEffect(() => {
    if (
      hasCameraError &&
      (cameraFailureReason === "denied" || cameraFailureReason === "no-device")
    ) {
      demoButtonRef.current?.focus();
    }
  }, [hasCameraError, cameraFailureReason]);

  useEffect(() => {
    exerciseIdRef.current = exerciseId;
    simulationProgressRef.current = 0;
  }, [exerciseId]);

  useEffect(() => {
    formQualityRef.current = formQuality;
  }, [formQuality]);

  useEffect(() => {
    currentAngleRef.current = currentAngle;
  }, [currentAngle]);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  const poseInstanceRef = useRef<any>(null);
  const cameraInstanceRef = useRef<any>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsCheckRef = useRef<number>(Date.now());
  const simulationFrameRef = useRef<number | null>(null);

  const getJointColor = useCallback((quality: FormQuality) => {
    switch (quality) {
      case "perfect":
        return "#10B981";
      case "needs_correction":
        return "#EF4444";
      case "good":
        return "#0284C7";
      default:
        return isDarkRef.current ? "#9CA3AF" : "#4B5563";
    }
  }, []);

  const getJointGlowColor = useCallback((quality: FormQuality) => {
    switch (quality) {
      case "perfect":
        return "rgba(16, 185, 129, 0.25)";
      case "needs_correction":
        return "rgba(239, 68, 68, 0.25)";
      case "good":
        return "rgba(2, 132, 199, 0.25)";
      default:
        return "rgba(156, 163, 175, 0.2)";
    }
  }, []);

  // Super-zoptymalizowany silnik renderowania szkieletu bez shadowBlur (akceleracja GPU)
  const drawPose = useCallback(
    (landmarks: Landmark[], width: number, height: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      if (!showSkeletonRef.current || !landmarks || landmarks.length < 33) {
        return;
      }

      const jointColor = getJointColor(formQualityRef.current);
      const glowColor = getJointGlowColor(formQualityRef.current);

      // 1. Warstwa poświaty: szybka linia 8px bez powolnego filtru Gaussa
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.strokeStyle = glowColor;

      for (const [startIndex, endIndex] of POSE_CONNECTIONS) {
        const start = landmarks[startIndex];
        const end = landmarks[endIndex];

        if (
          start &&
          end &&
          (start.visibility === undefined || start.visibility > 0.4) &&
          (end.visibility === undefined || end.visibility > 0.4)
        ) {
          ctx.beginPath();
          ctx.moveTo((1 - start.x) * width, start.y * height);
          ctx.lineTo((1 - end.x) * width, end.y * height);
          ctx.stroke();
        }
      }

      // 2. Warstwa ostra szkieletu
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = jointColor;

      for (const [startIndex, endIndex] of POSE_CONNECTIONS) {
        const start = landmarks[startIndex];
        const end = landmarks[endIndex];

        if (
          start &&
          end &&
          (start.visibility === undefined || start.visibility > 0.4) &&
          (end.visibility === undefined || end.visibility > 0.4)
        ) {
          ctx.beginPath();
          ctx.moveTo((1 - start.x) * width, start.y * height);
          ctx.lineTo((1 - end.x) * width, end.y * height);
          ctx.stroke();
        }
      }

      // 3. Stawy (punkty)
      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        if (!lm || (lm.visibility !== undefined && lm.visibility < 0.4)) {
          continue;
        }

        if (i > 0 && i < 11) continue;

        const x = (1 - lm.x) * width;
        const y = lm.y * height;

        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = jointColor;
        ctx.stroke();
      }

      // 4. Etykieta kąta z bezpiecznym rysowaniem zaokrąglenia
      if (!isWorkoutCompletedRef.current) {
        let targetJointIndex: number = POSE_LANDMARKS.RIGHT_KNEE;
        if (exerciseIdRef.current === "arm_raises") {
          targetJointIndex = POSE_LANDMARKS.RIGHT_SHOULDER;
        } else if (exerciseIdRef.current === "high_knees") {
          targetJointIndex = POSE_LANDMARKS.LEFT_KNEE;
        }

        const targetLm = landmarks[targetJointIndex];
        if (
          targetLm &&
          (targetLm.visibility === undefined || targetLm.visibility > 0.4)
        ) {
          const x = (1 - targetLm.x) * width + 25;
          const y = targetLm.y * height;

          ctx.fillStyle = isDarkRef.current
            ? "rgba(10, 10, 10, 0.92)"
            : "rgba(255, 255, 255, 0.95)";
          ctx.strokeStyle = jointColor;
          ctx.lineWidth = 1.5;

          const rx = x - 6;
          const ry = y - 18;
          const rw = 76;
          const rh = 28;
          const radius = 6;

          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(rx, ry, rw, rh, radius);
          } else {
            ctx.rect(rx, ry, rw, rh);
          }
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isDarkRef.current ? "#F5F5F5" : "#111827";
          ctx.font = "bold 13px system-ui, sans-serif";
          ctx.fillText(`${currentAngleRef.current}°`, x + 6, y);
        }
      }
    },
    [getJointColor, getJointGlowColor],
  );

  const stopSimulation = useCallback(() => {
    demoModeRef.current = false;
    setDemoMode(false);
    if (simulationFrameRef.current) {
      cancelAnimationFrame(simulationFrameRef.current);
      simulationFrameRef.current = null;
    }
  }, []);

  const startSimulation = useCallback(() => {
    demoModeRef.current = true;
    setDemoMode(true);

    if (simulationFrameRef.current) {
      cancelAnimationFrame(simulationFrameRef.current);
      simulationFrameRef.current = null;
    }

    const simulateLoop = () => {
      if (!demoModeRef.current) return;

      if (isPausedRef.current) {
        simulationFrameRef.current = requestAnimationFrame(simulateLoop);
        return;
      }

      if (isWorkoutCompletedRef.current) {
        const restingLandmarks = getBiomechanicalLandmarks(
          exerciseIdRef.current,
          0,
          true,
        );
        if (canvasRef.current) {
          drawPose(
            restingLandmarks,
            canvasRef.current.width,
            canvasRef.current.height,
          );
        }
        stopSimulation();
        return;
      }

      let cadenceStep = 0.021;
      if (exerciseIdRef.current === "jumping_jacks") {
        cadenceStep = 0.028;
      } else if (exerciseIdRef.current === "high_knees") {
        cadenceStep = 0.016;
      } else if (exerciseIdRef.current === "tree_pose") {
        cadenceStep = 0.025;
      }

      simulationProgressRef.current += cadenceStep;

      const syntheticLandmarks = getBiomechanicalLandmarks(
        exerciseIdRef.current,
        simulationProgressRef.current,
        false,
      );

      if (onPoseDetectedRef.current) {
        onPoseDetectedRef.current(syntheticLandmarks);
      }

      if (canvasRef.current) {
        drawPose(
          syntheticLandmarks,
          canvasRef.current.width,
          canvasRef.current.height,
        );
      }

      simulationFrameRef.current = requestAnimationFrame(simulateLoop);
    };

    simulationFrameRef.current = requestAnimationFrame(simulateLoop);
  }, [drawPose, stopSimulation]);

  useEffect(() => {
    isWorkoutCompletedRef.current = isWorkoutCompleted;
    if (isWorkoutCompleted) {
      if (demoModeRef.current) {
        stopSimulation();
      }
      const restingLandmarks = getBiomechanicalLandmarks(
        exerciseIdRef.current,
        0,
        true,
      );
      if (canvasRef.current) {
        drawPose(
          restingLandmarks,
          canvasRef.current.width,
          canvasRef.current.height,
        );
      }
    }
  }, [isWorkoutCompleted, drawPose, stopSimulation]);

  const toggleDemoSimulator = useCallback(() => {
    if (demoModeRef.current) {
      stopSimulation();
    } else {
      startSimulation();
    }
  }, [startSimulation, stopSimulation]);

  useEffect(() => {
    if (
      externalDemoTrigger !== undefined &&
      externalDemoTrigger !== prevExternalDemoRef.current
    ) {
      prevExternalDemoRef.current = externalDemoTrigger;

      if (
        externalDemoTrigger === true ||
        (typeof externalDemoTrigger === "number" && externalDemoTrigger > 0)
      ) {
        startSimulation();
      } else if (externalDemoTrigger === false) {
        stopSimulation();
      }
    }
  }, [externalDemoTrigger, startSimulation, stopSimulation]);

  const startCamera = async (
    targetFacingMode: "user" | "environment" = facingMode,
  ) => {
    setHasCameraError(false);
    setCameraFailureReason("none");
    if (!videoRef.current) return;

    // Szybka weryfikacja dostępności urządzeń wideo (chroni Fire TV przed błędem zawieszenia)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some((d) => d.kind === "videoinput");
        if (!hasVideoInput) {
          setCameraFailureReason("no-device");
          setHasCameraError(true);
          // Na Fire TV bez kamery automatycznie uruchom płynny symulator!
          if (tvEnv.isTvLike && !demoModeRef.current) {
            startSimulation();
          }
          return;
        }
      }
    } catch {
      // Ignorujemy błąd enumeracji w restrykcyjnych przeglądarkach
    }

    const permissionGranted = await requestCameraRuntimePermission();
    if (!permissionGranted) {
      setCameraFailureReason("denied");
      setHasCameraError(true);
      if (tvEnv.isTvLike && !demoModeRef.current) {
        startSimulation();
      }
      return;
    }

    try {
      stopCamera();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: targetFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        const name = (err as DOMException)?.name;
        if (name === "NotAllowedError" || name === "SecurityError") {
          setCameraFailureReason("denied");
        } else if (
          name === "NotFoundError" ||
          name === "OverconstrainedError" ||
          name === "NotReadableError"
        ) {
          setCameraFailureReason("no-device");
        } else {
          setCameraFailureReason("generic");
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!stream || !videoRef.current) {
        throw new Error("Camera stream unavailable");
      }

      const video = videoRef.current;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          video.onloadedmetadata = () => resolve();
        }
      });

      await video.play();
      setCameraActive(true);
      setHasCameraError(false);
      setCameraFailureReason("none");

      let isProcessingFrame = false;
      const processFrame = async () => {
        if (
          videoRef.current &&
          !videoRef.current.paused &&
          !videoRef.current.ended &&
          poseInstanceRef.current &&
          !demoModeRef.current &&
          !isWorkoutCompletedRef.current &&
          !isPausedRef.current
        ) {
          if (!isProcessingFrame) {
            isProcessingFrame = true;
            try {
              await poseInstanceRef.current.send({ image: videoRef.current });
            } catch {
              // Upuszczona klatka
            } finally {
              isProcessingFrame = false;
            }
          }
        }
        if (videoRef.current && videoRef.current.srcObject) {
          cameraInstanceRef.current = requestAnimationFrame(processFrame);
        }
      };

      cameraInstanceRef.current = requestAnimationFrame(processFrame);
    } catch {
      setHasCameraError(true);
      setCameraActive(false);
      if (tvEnv.isTvLike && !demoModeRef.current) {
        startSimulation();
      }
    }
  };

  const toggleFacingMode = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (cameraActive) {
      await startCamera(nextMode);
    }
  };

  const stopCamera = () => {
    if (cameraInstanceRef.current) {
      if (typeof cameraInstanceRef.current === "number") {
        cancelAnimationFrame(cameraInstanceRef.current);
      } else if (cameraInstanceRef.current.stop) {
        try {
          cameraInstanceRef.current.stop();
        } catch {}
      }
      cameraInstanceRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    let isMounted = true;

    async function initMediaPipe() {
      if (typeof window === "undefined") return;

      // Jeśli jesteśmy na Fire TV bez kamery, od razu przełącz w tryb symulatora
      if (tvEnv.isTvLike) {
        try {
          const devices = await navigator.mediaDevices?.enumerateDevices();
          const hasCam = devices?.some((d) => d.kind === "videoinput");
          if (!hasCam) {
            if (isMounted) {
              setHasCameraError(true);
              setCameraFailureReason("no-device");
              startSimulation();
            }
            return;
          }
        } catch {
          // Kontynuuj standardowy flow
        }
      }

      let retries = 0;
      while (!window.Pose && retries < 25) {
        await new Promise((res) => setTimeout(res, 200));
        retries++;
      }

      if (!window.Pose) {
        if (isMounted) {
          setHasCameraError(true);
        }
        return;
      }

      try {
        const pose = new window.Pose({
          locateFile: (file: string) => `/mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });

        pose.onResults((results: any) => {
          if (!isMounted) return;
          if (demoModeRef.current) return;
          if (isPausedRef.current) return;

          frameCountRef.current++;
          const now = Date.now();
          if (now - lastFpsCheckRef.current >= 1000) {
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
            lastFpsCheckRef.current = now;
          }

          if (results.poseLandmarks) {
            if (onPoseDetectedRef.current) {
              onPoseDetectedRef.current(results.poseLandmarks);
            }
            const canvas = canvasRef.current;
            if (canvas) {
              drawPose(results.poseLandmarks, canvas.width, canvas.height);
            }
          }
        });

        poseInstanceRef.current = pose;
        startCamera();
      } catch {
        if (isMounted) {
          setHasCameraError(true);
        }
      }
    }

    initMediaPipe();

    return () => {
      isMounted = false;
      stopCamera();
      if (poseInstanceRef.current) {
        poseInstanceRef.current.close();
      }
      if (simulationFrameRef.current) {
        cancelAnimationFrame(simulationFrameRef.current);
      }
    };
  }, [drawPose, startSimulation, tvEnv.isTvLike]);

  const handleNavKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentTarget = e.currentTarget;

    if (e.key === "ArrowUp") {
      const target = findNextSpatialElement(currentTarget, TvDirection.UP);
      if (target) {
        e.preventDefault();
        setTvFocus(target);
      }
    } else if (e.key === "ArrowDown") {
      const target = findNextSpatialElement(currentTarget, TvDirection.DOWN);
      if (target) {
        e.preventDefault();
        setTvFocus(target);
      }
    } else if (e.key === "ArrowLeft") {
      const target = findNextSpatialElement(currentTarget, TvDirection.LEFT);
      if (target) {
        e.preventDefault();
        setTvFocus(target);
      }
    } else if (e.key === "ArrowRight") {
      const target = findNextSpatialElement(currentTarget, TvDirection.RIGHT);
      if (target) {
        e.preventDefault();
        setTvFocus(target);
      }
    }
  };

  return (
    <div
      id="pose-camera-container"
      data-tv-zone="camera-zone"
      role="region"
      aria-label={t.tvNavigation.cameraZone}
      className={`relative w-full aspect-[4/3] sm:aspect-video min-h-[300px] sm:min-h-[360px] md:min-h-[420px] max-h-[560px] rounded-2xl overflow-hidden border flex items-center justify-center shadow-2xl transition-colors ${
        isDark
          ? "bg-neutral-900 border-neutral-800"
          : "bg-neutral-100 border-neutral-200"
      }`}
    >
      {demoMode && (
        <div
          id="demo-mode-background"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-neutral-950 flex flex-col items-center justify-center z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-neutral-900/60 to-black pointer-events-none" />
          <div className="absolute bottom-6 sm:bottom-8 flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-400 text-xs font-mono">
            {tvEnv.isTvLike ? (
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>
              {isPaused
                ? t.pausedBanner
                : tvEnv.isTvLike
                  ? lang === "pl"
                    ? "Trening Fire TV (Asystent AI)"
                    : "Fire TV Workout (AI Assistant)"
                  : t.studioMode}
            </span>
          </div>
        </div>
      )}

      <video
        id="camera-video-stream"
        ref={videoRef}
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 ${
          cameraActive && !demoMode
            ? "opacity-95"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <canvas
        id="pose-canvas-overlay"
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      />

      {/* Nakładka wizualna w stanie pauzy */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none z-20">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black/90 border border-amber-500/60 text-amber-400 font-bold text-base shadow-2xl animate-pulse">
            <PauseCircle className="w-6 h-6 text-amber-400" />
            <span>{t.pausedBanner}</span>
          </div>
        </div>
      )}

      {/* Pasek kontrolek na górze kontenera */}
      {(cameraActive || demoMode) && (
        <div
          id="camera-overlay-top-bar"
          className="absolute top-2 inset-x-2 sm:top-3 sm:inset-x-3 flex items-center justify-between gap-1.5 z-20 pointer-events-none"
        >
          {/* Status po lewej stronie */}
          <div
            id="camera-status-badges"
            className="flex items-center gap-1 shrink-0 pointer-events-auto min-w-0"
          >
            {demoMode ? (
              <div
                id="badge-simulator-active"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-md bg-neutral-900/95 shrink-0 ${
                  isPaused
                    ? "text-amber-300 border-amber-500/50"
                    : "text-emerald-300 border-emerald-500/50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="sm:hidden whitespace-nowrap">
                  {isPaused
                    ? lang === "pl"
                      ? "Pauza"
                      : "Paused"
                    : "Studio AI"}
                </span>
                <span className="hidden sm:inline whitespace-nowrap">
                  {isPaused ? t.pausedBanner : t.studioModeActive}
                </span>
              </div>
            ) : (
              <div
                id="badge-camera-status"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-neutral-900/95 text-emerald-300 border-emerald-500/40 shadow-md shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  {t.cameraActive}
                </span>
                <span className="sm:hidden whitespace-nowrap font-medium text-xs">
                  {lang === "pl" ? "Kamera" : "Live"}
                </span>
              </div>
            )}

            {fps > 0 && !demoMode && (
              <div
                id="badge-camera-fps"
                className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-mono bg-neutral-900/95 text-neutral-200 border border-neutral-700 whitespace-nowrap shrink-0 shadow-md"
              >
                {fps} {t.fps}
              </div>
            )}
          </div>

          {/* Przyciski operacyjne po prawej stronie */}
          <div
            id="camera-control-buttons"
            className="flex items-center gap-1 sm:gap-1.5 shrink-0 pointer-events-auto ml-auto"
          >
            {/* Przełącznik kamery (ukryty na TV) */}
            {cameraActive && !tvEnv.isTvLike && (
              <button
                id="btn-flip-camera"
                type="button"
                tabIndex={0}
                data-tv-focusable="true"
                onKeyDown={handleNavKeyDown}
                onClick={toggleFacingMode}
                className="p-2 rounded-xl bg-neutral-900/95 hover:bg-black text-neutral-200 border border-neutral-700 transition-colors flex items-center justify-center shrink-0 shadow-md"
                title={t.switchCamera}
                aria-label={t.switchCamera}
              >
                <SwitchCamera className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-[10px] font-mono hidden xl:inline whitespace-nowrap ml-1">
                  {facingMode === "user" ? t.frontCamera : t.backCamera}
                </span>
              </button>
            )}

            {/* Włącznik kamery (na TV tylko jeśli jest dostępna) */}
            {(!tvEnv.isTvLike || cameraActive) && (
              <button
                id="btn-toggle-camera-power"
                type="button"
                tabIndex={0}
                data-tv-focusable="true"
                onKeyDown={handleNavKeyDown}
                onClick={() => {
                  if (cameraActive) {
                    stopCamera();
                  } else {
                    if (demoMode) stopSimulation();
                    startCamera();
                  }
                }}
                className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 shadow-md ${
                  cameraActive && !demoMode
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400"
                    : "bg-neutral-900/95 hover:bg-black text-neutral-300 border-neutral-700"
                }`}
                title={cameraActive ? t.turnCameraOff : t.turnCameraOn}
                aria-label={cameraActive ? t.turnCameraOff : t.turnCameraOn}
              >
                {cameraActive && !demoMode ? (
                  <Camera className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <CameraOff className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="text-xs font-semibold hidden xl:inline whitespace-nowrap ml-1">
                  {cameraActive && !demoMode ? t.turnCameraOff : t.turnCameraOn}
                </span>
              </button>
            )}

            {/* Przełącznik widoczności szkieletu */}
            <button
              id="btn-toggle-skeleton"
              type="button"
              tabIndex={0}
              data-tv-focusable="true"
              onKeyDown={handleNavKeyDown}
              onClick={() => setShowSkeleton((prev) => !prev)}
              className="p-2 rounded-xl bg-neutral-900/95 hover:bg-black text-neutral-200 border border-neutral-700 transition-colors flex items-center justify-center shrink-0 shadow-md"
              title={showSkeleton ? t.hideSkeleton : t.showSkeleton}
              aria-label={showSkeleton ? t.hideSkeleton : t.showSkeleton}
            >
              {showSkeleton ? (
                <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <EyeOff className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
            </button>

            {/* Przycisk aktywacji symulatora */}
            <button
              id="btn-toggle-demo"
              type="button"
              tabIndex={0}
              data-tv-focusable="true"
              onKeyDown={handleNavKeyDown}
              onClick={toggleDemoSimulator}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap shadow-md ${
                demoMode
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30"
                  : "bg-neutral-900/95 hover:bg-black text-neutral-200 border-neutral-700"
              }`}
              title={demoMode ? t.stopSimulator : t.studioModeDesc}
              aria-label={demoMode ? t.stopSimulator : t.studioMode}
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                {demoMode ? t.stopSimulator : t.studioMode}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Ekran gotowości / braku kamery zoptymalizowany pod Fire TV */}
      {!cameraActive && !demoMode && (
        <div
          id="camera-inactive-overlay"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 sm:p-6 bg-neutral-950/95 text-center"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            {tvEnv.isTvLike ? (
              <Tv className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            ) : (
              <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
          </div>
          <h2 className="text-base sm:text-xl font-bold text-white mb-1.5">
            {tvEnv.isTvLike
              ? lang === "pl"
                ? "Tryb Treningu Fire TV"
                : "Fire TV Workout Mode"
              : hasCameraError
                ? cameraFailureReason === "no-device"
                  ? t.cameraNoDevice
                  : cameraFailureReason === "denied"
                    ? t.cameraDenied
                    : t.cameraInactive
                : t.cameraPromptTitle}
          </h2>
          <p className="text-neutral-300 text-xs sm:text-sm max-w-sm sm:max-w-md mb-3 leading-relaxed">
            {tvEnv.isTvLike
              ? lang === "pl"
                ? "Wykryto urządzenie Fire TV. Używaj pilota TV (D-pad i przycisk OK) do sterowania treningiem i powtórzeniami z asystentem ruchu AI."
                : "Fire TV device detected. Use your TV remote (D-pad and OK button) to navigate your workout with the AI motion assistant."
              : cameraFailureReason === "no-device" && hasCameraError
                ? t.cameraNoDeviceDesc
                : t.cameraPromptDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-xs sm:max-w-md">
            {!tvEnv.isTvLike && (
              <button
                id="btn-retry-camera"
                type="button"
                tabIndex={0}
                data-tv-focusable="true"
                onKeyDown={handleNavKeyDown}
                onClick={() => startCamera()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                <span>{t.enableCameraBtn}</span>
              </button>
            )}
            <button
              id="btn-launch-demo"
              ref={demoButtonRef}
              type="button"
              tabIndex={0}
              data-tv-focusable="true"
              onKeyDown={handleNavKeyDown}
              onClick={toggleDemoSimulator}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm border border-indigo-400 shadow-xl shadow-indigo-600/30 transition-all active:scale-95 ring-2 ring-indigo-400/50"
            >
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              <span>
                {tvEnv.isTvLike
                  ? lang === "pl"
                    ? "Uruchom Trening na TV"
                    : "Start TV Workout"
                  : t.studioMode}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
