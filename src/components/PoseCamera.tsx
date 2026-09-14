import React, { useEffect, useRef, useState, useCallback } from "react";
import { Landmark, FormQuality } from "../types";
import { POSE_CONNECTIONS, POSE_LANDMARKS } from "../utils/poseGeometry";
import {
  Camera,
  CameraOff,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  SwitchCamera,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Language, ThemeMode, translations } from "../data/translations";

interface PoseCameraProps {
  onPoseDetected: (landmarks: Landmark[]) => void;
  formQuality: FormQuality;
  currentAngle: number;
  exerciseId: string;
  lang: Language;
  theme: ThemeMode;
  externalDemoTrigger?: boolean;
}

// MediaPipe global declarations from window script tags
declare global {
  interface Window {
    Pose: any;
    Camera: any;
  }
}

// Biomechanical model generator for synthetic studio simulation
function getBiomechanicalLandmarks(
  exerciseId: string,
  progress: number,
): Landmark[] {
  const synthetic: Landmark[] = Array(33)
    .fill(0)
    .map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));

  if (exerciseId === "squats") {
    // Smooth squat cycle: 0 = standing, 1 = deep 90 deg squat
    const cycle = (1 - Math.cos(progress)) / 2;

    // Head & face
    synthetic[0] = { x: 0.5, y: 0.22 + cycle * 0.13, visibility: 0.99 };
    synthetic[1] = { x: 0.49, y: 0.21 + cycle * 0.13, visibility: 0.99 };
    synthetic[2] = { x: 0.485, y: 0.21 + cycle * 0.13, visibility: 0.99 };
    synthetic[3] = { x: 0.48, y: 0.21 + cycle * 0.13, visibility: 0.99 };
    synthetic[4] = { x: 0.51, y: 0.21 + cycle * 0.13, visibility: 0.99 };
    synthetic[5] = { x: 0.515, y: 0.21 + cycle * 0.13, visibility: 0.99 };
    synthetic[6] = { x: 0.52, y: 0.21 + cycle * 0.13, visibility: 0.99 };
    synthetic[7] = { x: 0.46, y: 0.22 + cycle * 0.13, visibility: 0.99 };
    synthetic[8] = { x: 0.54, y: 0.22 + cycle * 0.13, visibility: 0.99 };
    synthetic[9] = { x: 0.49, y: 0.25 + cycle * 0.13, visibility: 0.99 };
    synthetic[10] = { x: 0.51, y: 0.25 + cycle * 0.13, visibility: 0.99 };

    // Shoulders
    synthetic[11] = { x: 0.42, y: 0.32 + cycle * 0.14, visibility: 0.99 };
    synthetic[12] = { x: 0.58, y: 0.32 + cycle * 0.14, visibility: 0.99 };

    // Arms extend forward during squat for natural counterbalance
    synthetic[13] = {
      x: 0.38 - cycle * 0.03,
      y: 0.42 + cycle * 0.05,
      visibility: 0.99,
    };
    synthetic[14] = {
      x: 0.62 + cycle * 0.03,
      y: 0.42 + cycle * 0.05,
      visibility: 0.99,
    };
    synthetic[15] = { x: 0.39, y: 0.42 - cycle * 0.02, visibility: 0.99 };
    synthetic[16] = { x: 0.61, y: 0.42 - cycle * 0.02, visibility: 0.99 };
    synthetic[17] = { x: 0.38, y: 0.42, visibility: 0.95 };
    synthetic[18] = { x: 0.62, y: 0.42, visibility: 0.95 };
    synthetic[19] = { x: 0.37, y: 0.42, visibility: 0.95 };
    synthetic[20] = { x: 0.63, y: 0.42, visibility: 0.95 };
    synthetic[21] = { x: 0.39, y: 0.41, visibility: 0.95 };
    synthetic[22] = { x: 0.61, y: 0.41, visibility: 0.95 };

    // Hips drop down and back
    synthetic[23] = { x: 0.44, y: 0.52 + cycle * 0.18, visibility: 0.99 };
    synthetic[24] = { x: 0.56, y: 0.52 + cycle * 0.18, visibility: 0.99 };

    // Knees track outward and forward: knee angle reaches ~88° at full depth
    synthetic[25] = {
      x: 0.43 - cycle * 0.05,
      y: 0.7 - cycle * 0.01,
      visibility: 0.99,
    };
    synthetic[26] = {
      x: 0.57 + cycle * 0.05,
      y: 0.7 - cycle * 0.01,
      visibility: 0.99,
    };

    // Feet stay planted
    synthetic[27] = { x: 0.43, y: 0.88, visibility: 0.99 };
    synthetic[28] = { x: 0.57, y: 0.88, visibility: 0.99 };
    synthetic[29] = { x: 0.42, y: 0.9, visibility: 0.99 };
    synthetic[30] = { x: 0.58, y: 0.9, visibility: 0.99 };
    synthetic[31] = { x: 0.41, y: 0.91, visibility: 0.99 };
    synthetic[32] = { x: 0.59, y: 0.91, visibility: 0.99 };
  } else if (exerciseId === "jumping_jacks") {
    const cycle = (1 - Math.cos(progress)) / 2;
    synthetic[0] = { x: 0.5, y: 0.2, visibility: 0.99 };
    synthetic[11] = { x: 0.43, y: 0.3, visibility: 0.99 };
    synthetic[12] = { x: 0.57, y: 0.3, visibility: 0.99 };
    synthetic[13] = {
      x: 0.37 - cycle * 0.06,
      y: 0.4 - cycle * 0.2,
      visibility: 0.99,
    };
    synthetic[14] = {
      x: 0.63 + cycle * 0.06,
      y: 0.4 - cycle * 0.2,
      visibility: 0.99,
    };
    synthetic[15] = {
      x: 0.38 - cycle * 0.08,
      y: 0.5 - cycle * 0.35,
      visibility: 0.99,
    };
    synthetic[16] = {
      x: 0.62 + cycle * 0.08,
      y: 0.5 - cycle * 0.35,
      visibility: 0.99,
    };
    synthetic[23] = { x: 0.45, y: 0.5, visibility: 0.99 };
    synthetic[24] = { x: 0.55, y: 0.5, visibility: 0.99 };
    synthetic[25] = { x: 0.46 - cycle * 0.08, y: 0.7, visibility: 0.99 };
    synthetic[26] = { x: 0.54 + cycle * 0.08, y: 0.7, visibility: 0.99 };
    synthetic[27] = { x: 0.47 - cycle * 0.12, y: 0.88, visibility: 0.99 };
    synthetic[28] = { x: 0.53 + cycle * 0.12, y: 0.88, visibility: 0.99 };
  } else if (exerciseId === "high_knees") {
    const cycleL = Math.max(0, Math.sin(progress));
    const cycleR = Math.max(0, -Math.sin(progress));
    synthetic[0] = { x: 0.5, y: 0.2, visibility: 0.99 };
    synthetic[11] = { x: 0.43, y: 0.3, visibility: 0.99 };
    synthetic[12] = { x: 0.57, y: 0.3, visibility: 0.99 };
    synthetic[13] = { x: 0.39, y: 0.4, visibility: 0.99 };
    synthetic[14] = { x: 0.61, y: 0.4, visibility: 0.99 };
    synthetic[15] = { x: 0.41, y: 0.45, visibility: 0.99 };
    synthetic[16] = { x: 0.59, y: 0.45, visibility: 0.99 };
    synthetic[23] = { x: 0.45, y: 0.5, visibility: 0.99 };
    synthetic[24] = { x: 0.55, y: 0.5, visibility: 0.99 };
    synthetic[25] = { x: 0.45, y: 0.7 - cycleL * 0.2, visibility: 0.99 };
    synthetic[26] = { x: 0.55, y: 0.7 - cycleR * 0.2, visibility: 0.99 };
    synthetic[27] = { x: 0.45, y: 0.88 - cycleL * 0.25, visibility: 0.99 };
    synthetic[28] = { x: 0.55, y: 0.88 - cycleR * 0.25, visibility: 0.99 };
  } else if (exerciseId === "tree_pose") {
    synthetic[0] = { x: 0.5, y: 0.2, visibility: 0.99 };
    synthetic[11] = { x: 0.44, y: 0.3, visibility: 0.99 };
    synthetic[12] = { x: 0.56, y: 0.3, visibility: 0.99 };
    synthetic[13] = { x: 0.41, y: 0.38, visibility: 0.99 };
    synthetic[14] = { x: 0.59, y: 0.38, visibility: 0.99 };
    synthetic[15] = { x: 0.48, y: 0.36, visibility: 0.99 };
    synthetic[16] = { x: 0.52, y: 0.36, visibility: 0.99 };
    synthetic[23] = { x: 0.45, y: 0.5, visibility: 0.99 };
    synthetic[24] = { x: 0.55, y: 0.5, visibility: 0.99 };
    synthetic[26] = { x: 0.55, y: 0.7, visibility: 0.99 };
    synthetic[28] = { x: 0.55, y: 0.88, visibility: 0.99 };
    synthetic[25] = { x: 0.38, y: 0.65, visibility: 0.99 };
    synthetic[27] = { x: 0.52, y: 0.67, visibility: 0.99 };
  } else {
    // Arm raises
    const cycle = (1 - Math.cos(progress)) / 2;
    synthetic[0] = { x: 0.5, y: 0.2, visibility: 0.99 };
    synthetic[11] = { x: 0.43, y: 0.3, visibility: 0.99 };
    synthetic[12] = { x: 0.57, y: 0.3, visibility: 0.99 };
    synthetic[13] = {
      x: 0.37 - cycle * 0.08,
      y: 0.42 - cycle * 0.22,
      visibility: 0.99,
    };
    synthetic[14] = {
      x: 0.63 + cycle * 0.08,
      y: 0.42 - cycle * 0.22,
      visibility: 0.99,
    };
    synthetic[15] = {
      x: 0.35 - cycle * 0.12,
      y: 0.52 - cycle * 0.4,
      visibility: 0.99,
    };
    synthetic[16] = {
      x: 0.65 + cycle * 0.12,
      y: 0.52 - cycle * 0.4,
      visibility: 0.99,
    };
    synthetic[23] = { x: 0.45, y: 0.5, visibility: 0.99 };
    synthetic[24] = { x: 0.55, y: 0.5, visibility: 0.99 };
    synthetic[25] = { x: 0.44, y: 0.7, visibility: 0.99 };
    synthetic[26] = { x: 0.56, y: 0.7, visibility: 0.99 };
    synthetic[27] = { x: 0.44, y: 0.88, visibility: 0.99 };
    synthetic[28] = { x: 0.56, y: 0.88, visibility: 0.99 };
  }

  return synthetic;
}

export const PoseCamera: React.FC<PoseCameraProps> = ({
  onPoseDetected,
  formQuality,
  currentAngle,
  exerciseId,
  lang,
  theme,
  externalDemoTrigger,
}) => {
  const t = translations[lang];
  const isDark = theme === "dark";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(0);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessToast, setExportSuccessToast] = useState<boolean>(false);

  const poseInstanceRef = useRef<any>(null);
  const cameraInstanceRef = useRef<any>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsCheckRef = useRef<number>(Date.now());
  const simulationFrameRef = useRef<number | null>(null);

  // Determine skeleton line color based on real-time exercise form
  const getJointColor = useCallback(
    (quality: FormQuality) => {
      switch (quality) {
        case "perfect":
          return "#10B981"; // Emerald-500
        case "needs_correction":
          return "#EF4444"; // Red-500
        case "good":
          return "#0284C7"; // Sky-600 in light / bright in dark
        default:
          return isDark ? "#9CA3AF" : "#4B5563";
      }
    },
    [isDark],
  );

  // Draw full skeleton and angle annotations on canvas
  const drawPose = useCallback(
    (landmarks: Landmark[], width: number, height: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      if (!showSkeleton || !landmarks || landmarks.length < 33) return;

      const jointColor = getJointColor(formQuality);

      // 1. Draw Skeleton Bones
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.strokeStyle = jointColor;
      ctx.shadowColor = jointColor;
      ctx.shadowBlur = 12;

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
          // Horizontal mirror coordinate for natural mirror-like TV view
          ctx.moveTo((1 - start.x) * width, start.y * height);
          ctx.lineTo((1 - end.x) * width, end.y * height);
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0; // Reset shadow

      // 2. Draw Landmark Joint Dots
      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        if (!lm || (lm.visibility !== undefined && lm.visibility < 0.4))
          continue;

        // Skip dense facial points except nose/eyes to keep TV view clean
        if (i > 0 && i < 11) continue;

        const x = (1 - lm.x) * width;
        const y = lm.y * height;

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = jointColor;
        ctx.stroke();
      }

      // 3. Draw On-Joint Angle Badge for active exercise
      let targetJointIndex = POSE_LANDMARKS.RIGHT_KNEE;
      if (exerciseId === "arm_raises")
        targetJointIndex = POSE_LANDMARKS.RIGHT_SHOULDER;
      else if (exerciseId === "high_knees")
        targetJointIndex = POSE_LANDMARKS.LEFT_KNEE;

      const targetLm = landmarks[targetJointIndex];
      if (
        targetLm &&
        (targetLm.visibility === undefined || targetLm.visibility > 0.4)
      ) {
        const x = (1 - targetLm.x) * width + 25;
        const y = targetLm.y * height;

        // Background pill for angle badge
        ctx.fillStyle = isDark
          ? "rgba(10, 10, 10, 0.88)"
          : "rgba(255, 255, 255, 0.92)";
        ctx.strokeStyle = jointColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x - 6, y - 18, 76, 28, 6);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = isDark ? "#F5F5F5" : "#111827";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.fillText(`${currentAngle}°`, x + 6, y);
      }
    },
    [
      currentAngle,
      exerciseId,
      formQuality,
      getJointColor,
      isDark,
      showSkeleton,
    ],
  );

  // Initialize MediaPipe Pose Model
  useEffect(() => {
    let isMounted = true;

    async function initMediaPipe() {
      if (typeof window === "undefined") return;

      // Poll until MediaPipe script is loaded from CDN
      let retries = 0;
      while ((!window.Pose || !window.Camera) && retries < 25) {
        await new Promise((res) => setTimeout(res, 200));
        retries++;
      }

      if (!window.Pose) {
        setCameraError(
          lang === "pl"
            ? "Ładowanie modelu AI z sieci..."
            : "AI Vision model loading...",
        );
        return;
      }

      try {
        const pose = new window.Pose({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
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

          // Track FPS
          frameCountRef.current++;
          const now = Date.now();
          if (now - lastFpsCheckRef.current >= 1000) {
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
            lastFpsCheckRef.current = now;
          }

          if (results.poseLandmarks) {
            onPoseDetected(results.poseLandmarks);
            const canvas = canvasRef.current;
            if (canvas) {
              drawPose(results.poseLandmarks, canvas.width, canvas.height);
            }
          }
        });

        poseInstanceRef.current = pose;

        // Start user camera stream
        startCamera();
      } catch (err: any) {
        if (isMounted) {
          setCameraError(err?.message || "Błąd inicjalizacji kamery");
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
  }, []);

  // Realistic AI Biomechanical Simulator
  const startSimulation = useCallback(() => {
    setDemoMode(true);
    let progress = 0;
    const simulateLoop = () => {
      progress += 0.038;
      const syntheticLandmarks = getBiomechanicalLandmarks(
        exerciseId,
        progress,
      );

      onPoseDetected(syntheticLandmarks);
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
  }, [drawPose, exerciseId, onPoseDetected]);

  const stopSimulation = useCallback(() => {
    setDemoMode(false);
    if (simulationFrameRef.current) {
      cancelAnimationFrame(simulationFrameRef.current);
      simulationFrameRef.current = null;
    }
  }, []);

  // Export High-Resolution 1920x1080 Banner for GitHub README
  const exportBannerImage = useCallback(async () => {
    setIsExporting(true);
    try {
      const offscreen = document.createElement("canvas");
      offscreen.width = 1920;
      offscreen.height = 1080;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;

      // 1. Draw studio athlete image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = "/assets/studio_squat_athlete.jpg";
      await new Promise((resolve) => {
        bgImg.onload = resolve;
        bgImg.onerror = resolve;
      });

      if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, 1920, 1080);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, "#090D16");
        grad.addColorStop(1, "#05070B");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);
      }

      // 2. Cinematic studio vignette
      const vig = ctx.createRadialGradient(960, 540, 200, 960, 540, 1100);
      vig.addColorStop(0, "rgba(0,0,0,0.1)");
      vig.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, 1920, 1080);

      // 3. Draw authentic MediaPipe skeleton at deep squat (cycle = 1)
      const landmarks = getBiomechanicalLandmarks("squats", Math.PI);
      const jointColor = "#10B981";

      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.strokeStyle = jointColor;
      ctx.shadowColor = jointColor;
      ctx.shadowBlur = 18;

      for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
        const s = landmarks[startIdx];
        const e = landmarks[endIdx];
        if (s && e) {
          ctx.beginPath();
          ctx.moveTo((1 - s.x) * 1920, s.y * 1080);
          ctx.lineTo((1 - e.x) * 1920, e.y * 1080);
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
      for (let i = 0; i < landmarks.length; i++) {
        if (i > 0 && i < 11) continue;
        const lm = landmarks[i];
        if (!lm) continue;
        const x = (1 - lm.x) * 1920;
        const y = lm.y * 1080;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = jointColor;
        ctx.stroke();
      }

      // 4. Angle Callout at knee
      const kneeLm = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
      if (kneeLm) {
        const bx = (1 - kneeLm.x) * 1920 + 35;
        const by = kneeLm.y * 1080 - 20;
        ctx.fillStyle = "rgba(10, 15, 25, 0.92)";
        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, 185, 56, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#10B981";
        ctx.font = "bold 28px system-ui, sans-serif";
        ctx.fillText("89°", bx + 16, by + 38);

        ctx.fillStyle = "#E5E7EB";
        ctx.font = "700 13px system-ui, sans-serif";
        ctx.fillText(
          lang === "pl" ? "KĄT KOLANA" : "KNEE ANGLE",
          bx + 74,
          by + 26,
        );
        ctx.fillStyle = "#34D399";
        ctx.font = "bold 12px system-ui, sans-serif";
        ctx.fillText(
          lang === "pl" ? "PEŁNY PRZYSIAD" : "PERFECT DEPTH",
          bx + 74,
          by + 44,
        );
      }

      // 5. Header Branding Overlay
      ctx.fillStyle = "rgba(10, 10, 15, 0.88)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(48, 48, 600, 84, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px system-ui, sans-serif";
      ctx.fillText("PulseMotion TV", 72, 92);

      ctx.fillStyle = "#10B981";
      ctx.font = "700 12px system-ui, sans-serif";
      ctx.fillText("ON-DEVICE AI VISION • AMAZON FIRE TV & SILK", 72, 114);

      // 6. Bottom HUD stats bar
      ctx.fillStyle = "rgba(10, 15, 25, 0.92)";
      ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(48, 960, 1824, 76, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#9CA3AF";
      ctx.font = "600 14px system-ui, sans-serif";
      ctx.fillText(lang === "pl" ? "ĆWICZENIE:" : "EXERCISE:", 76, 1005);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.fillText(
        lang === "pl" ? "PRZYSIADY SIŁOWE (SQUATS)" : "BODYWEIGHT SQUATS",
        165,
        1005,
      );

      ctx.fillStyle = "#9CA3AF";
      ctx.fillText(lang === "pl" ? "POWTÓRZENIA:" : "REPS:", 470, 1005);
      ctx.fillStyle = "#34D399";
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.fillText("12 / 15", 585, 1005);

      ctx.fillStyle = "#9CA3AF";
      ctx.font = "600 14px system-ui, sans-serif";
      ctx.fillText(lang === "pl" ? "CELNOŚĆ:" : "ACCURACY:", 730, 1005);
      ctx.fillStyle = "#10B981";
      ctx.font = "bold 18px system-ui, sans-serif";
      ctx.fillText("98% (MISTRZOWSKA)", 815, 1005);

      ctx.fillStyle = "#9CA3AF";
      ctx.font = "600 14px system-ui, sans-serif";
      ctx.fillText(lang === "pl" ? "PRYWATNOŚĆ:" : "PRIVACY:", 1120, 1005);
      ctx.fillStyle = "#60A5FA";
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.fillText("100% LOCAL COMPUTER VISION (0 CLOUD STREAMS)", 1235, 1005);

      // Trigger download
      const dataUrl = offscreen.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "pulsemotion-banner.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setExportSuccessToast(true);
      setTimeout(() => setExportSuccessToast(false), 4500);
    } catch (err) {
      console.error("Banner export failed", err);
    } finally {
      setIsExporting(false);
    }
  }, [lang]);

  const toggleDemoSimulator = useCallback(() => {
    if (demoMode) {
      stopSimulation();
    } else {
      startSimulation();
    }
  }, [demoMode, startSimulation, stopSimulation]);

  // Listen to external demo trigger (e.g. from Voice Commander)
  useEffect(() => {
    if (externalDemoTrigger !== undefined && externalDemoTrigger !== demoMode) {
      if (externalDemoTrigger) {
        startSimulation();
      } else {
        stopSimulation();
      }
    }
  }, [externalDemoTrigger, demoMode, startSimulation, stopSimulation]);

  const startCamera = async (
    targetFacingMode: "user" | "environment" = facingMode,
  ) => {
    setCameraError(null);
    if (!videoRef.current) return;

    try {
      // 1. Stop any existing camera tracks first
      stopCamera();

      // 2. Direct getUserMedia - works reliably across all browsers, laptops, and mobile devices
      // Use permissive video constraints to avoid OverconstrainedError on varied webcams
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
      } catch (firstErr) {
        // Fallback to basic unconstrained video if resolution or facingMode failed
        console.warn(
          "Constrained camera failed, falling back to basic video:",
          firstErr,
        );
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!stream || !videoRef.current) {
        throw new Error("No video stream available");
      }

      const video = videoRef.current;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;

      // Wait until metadata loads to safely play
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          video.onloadedmetadata = () => resolve();
        }
      });

      await video.play();
      setCameraActive(true);
      setCameraError(null);

      // 3. Start processing frames with MediaPipe Pose if loaded
      let isProcessingFrame = false;
      const processFrame = async () => {
        if (
          videoRef.current &&
          !videoRef.current.paused &&
          !videoRef.current.ended &&
          poseInstanceRef.current &&
          !demoMode
        ) {
          if (!isProcessingFrame) {
            isProcessingFrame = true;
            try {
              await poseInstanceRef.current.send({ image: videoRef.current });
            } catch (err) {
              // Frame dropped or pose busy
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
    } catch (err: any) {
      console.warn("Physical camera unavailable or denied:", err);
      const errMsg =
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? lang === "pl"
            ? "Dostęp do kamery został zablokowany w przeglądarce. Kliknij ikonę kłódki/kamery przy pasku adresu i zezwól na dostęp."
            : "Camera permission was denied in browser settings."
          : lang === "pl"
            ? "Nie udało się uzyskać obrazu z kamery. Upewnij się, że inna aplikacja jej nie blokuje."
            : "Could not access camera stream.";
      setCameraError(errMsg);
      setCameraActive(false);
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

  return (
    <div
      className={`relative w-full aspect-video max-h-[540px] rounded-2xl overflow-hidden border flex items-center justify-center shadow-2xl transition-colors ${
        isDark
          ? "bg-neutral-900 border-neutral-800"
          : "bg-neutral-100 border-neutral-200"
      }`}
    >
      {/* Studio Athlete Presentation Background (when demoMode is active or camera is off) */}
      {demoMode && (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <img
            src="/assets/studio_squat_athlete.jpg"
            alt="Studio Athletic Model"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
        </div>
      )}

      {/* Hidden processing video stream */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 ${
          cameraActive && !demoMode
            ? "opacity-95"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Real-time skeleton canvas overlay */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      />

      {/* Top Status Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
            cameraActive && !demoMode
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              cameraActive && !demoMode
                ? "bg-emerald-400 animate-pulse"
                : "bg-amber-400"
            }`}
          />
          {cameraActive && !demoMode ? t.cameraActive : t.cameraInactive}
        </div>

        {demoMode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {t.studioModeActive}
          </div>
        )}

        {fps > 0 && !demoMode && (
          <div className="px-2.5 py-1.5 rounded-full text-xs font-mono bg-black/60 text-neutral-200 border border-neutral-700">
            {fps} {t.fps}
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        {/* Export Banner for README button */}
        <button
          id="btn-export-banner"
          onClick={exportBannerImage}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 backdrop-blur-md transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          title={t.exportBanner}
        >
          <Download
            className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`}
          />
          <span className="hidden md:inline">
            {isExporting ? t.exportingBanner : t.exportBanner}
          </span>
        </button>

        {/* Turn Camera On / Off button */}
        <button
          id="btn-toggle-camera-power"
          onClick={() => {
            if (cameraActive) {
              stopCamera();
            } else {
              startCamera();
            }
          }}
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-1.5 ${
            cameraActive && !demoMode
              ? "bg-emerald-600/80 hover:bg-emerald-500 text-white border-emerald-400"
              : "bg-black/60 hover:bg-black/80 text-neutral-300 border-neutral-700"
          }`}
          title={cameraActive ? t.turnCameraOff : t.turnCameraOn}
        >
          {cameraActive && !demoMode ? (
            <Camera className="w-4 h-4 text-white" />
          ) : (
            <CameraOff className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-xs font-semibold hidden sm:inline">
            {cameraActive && !demoMode ? t.turnCameraOff : t.turnCameraOn}
          </span>
        </button>

        <button
          id="btn-flip-camera"
          onClick={toggleFacingMode}
          className="p-2.5 rounded-xl bg-black/60 hover:bg-black/90 text-neutral-200 border border-neutral-700 backdrop-blur-md transition-colors flex items-center gap-1.5"
          title={t.switchCamera}
        >
          <SwitchCamera className="w-4 h-4 text-sky-400" />
          <span className="text-[10px] font-mono hidden sm:inline">
            {facingMode === "user" ? t.frontCamera : t.backCamera}
          </span>
        </button>

        <button
          id="btn-toggle-skeleton"
          onClick={() => setShowSkeleton(!showSkeleton)}
          className="p-2.5 rounded-xl bg-black/60 hover:bg-black/90 text-neutral-200 border border-neutral-700 backdrop-blur-md transition-colors"
          title={showSkeleton ? t.hideSkeleton : t.showSkeleton}
        >
          {showSkeleton ? (
            <Eye className="w-4 h-4 text-emerald-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        <button
          id="btn-toggle-demo"
          onClick={toggleDemoSimulator}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all ${
            demoMode
              ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
              : "bg-black/60 hover:bg-black/80 text-neutral-200 border-neutral-700"
          }`}
          title={t.studioModeDesc}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {demoMode ? t.stopSimulator : t.studioMode}
        </button>
      </div>

      {/* Export Success Toast notification */}
      {exportSuccessToast && (
        <div className="absolute bottom-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-2xl border border-emerald-400 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{t.exportSuccess}</span>
        </div>
      )}

      {/* Center Camera Perms / Inactive Notice */}
      {!cameraActive && !demoMode && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-neutral-950/85 backdrop-blur-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 mb-4">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {cameraError ? cameraError : t.cameraPromptTitle}
          </h3>
          <p className="text-neutral-300 text-sm max-w-md mb-6 leading-relaxed">
            {t.cameraPromptDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="btn-retry-camera"
              onClick={() => startCamera()}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              {t.enableCameraBtn}
            </button>
            <button
              id="btn-launch-demo"
              onClick={toggleDemoSimulator}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm border border-indigo-400 transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {t.studioMode}
            </button>
            <button
              id="btn-export-direct"
              onClick={exportBannerImage}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl text-sm border border-neutral-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              {t.exportBanner}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
