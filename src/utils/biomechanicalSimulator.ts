import { Landmark } from "../types";

/**
 * Generator syntetycznych punktów biometrycznych dla symulatora ćwiczeń AI.
 * Oblicza biomechaniczne trajektorie stawów w czasie rzeczywistym.
 */
export function getBiomechanicalLandmarks(
  exerciseId: string,
  progress: number,
  isResting: boolean = false,
): Landmark[] {
  const synthetic: Landmark[] = Array(33)
    .fill(0)
    .map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));

  if (isResting) {
    synthetic[0] = { x: 0.5, y: 0.2, visibility: 0.99 };
    synthetic[11] = { x: 0.43, y: 0.3, visibility: 0.99 };
    synthetic[12] = { x: 0.57, y: 0.3, visibility: 0.99 };
    synthetic[13] = { x: 0.4, y: 0.44, visibility: 0.99 };
    synthetic[14] = { x: 0.6, y: 0.44, visibility: 0.99 };
    synthetic[15] = { x: 0.41, y: 0.58, visibility: 0.99 };
    synthetic[16] = { x: 0.59, y: 0.58, visibility: 0.99 };
    synthetic[23] = { x: 0.45, y: 0.5, visibility: 0.99 };
    synthetic[24] = { x: 0.55, y: 0.5, visibility: 0.99 };
    synthetic[25] = { x: 0.45, y: 0.7, visibility: 0.99 };
    synthetic[26] = { x: 0.55, y: 0.7, visibility: 0.99 };
    synthetic[27] = { x: 0.45, y: 0.88, visibility: 0.99 };
    synthetic[28] = { x: 0.55, y: 0.88, visibility: 0.99 };
    return synthetic;
  }

  if (exerciseId === "squats") {
    const cycle = (1 - Math.cos(progress)) / 2;

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

    synthetic[11] = { x: 0.42, y: 0.32 + cycle * 0.14, visibility: 0.99 };
    synthetic[12] = { x: 0.58, y: 0.32 + cycle * 0.14, visibility: 0.99 };

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

    synthetic[23] = { x: 0.44, y: 0.52 + cycle * 0.18, visibility: 0.99 };
    synthetic[24] = { x: 0.56, y: 0.52 + cycle * 0.18, visibility: 0.99 };

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

    synthetic[27] = { x: 0.43, y: 0.88, visibility: 0.99 };
    synthetic[28] = { x: 0.57, y: 0.88, visibility: 0.99 };
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
    synthetic[25] = { x: 0.45, y: 0.7 - cycleL * 0.22, visibility: 0.99 };
    synthetic[26] = { x: 0.55, y: 0.7 - cycleR * 0.22, visibility: 0.99 };
    synthetic[27] = { x: 0.45, y: 0.88 - cycleL * 0.26, visibility: 0.99 };
    synthetic[28] = { x: 0.55, y: 0.88 - cycleR * 0.26, visibility: 0.99 };
  } else if (exerciseId === "tree_pose") {
    const breath = Math.sin(progress * 0.5) * 0.008;

    synthetic[0] = { x: 0.5, y: 0.2 + breath, visibility: 0.99 };
    synthetic[11] = { x: 0.44, y: 0.3 + breath, visibility: 0.99 };
    synthetic[12] = { x: 0.56, y: 0.3 + breath, visibility: 0.99 };
    synthetic[13] = { x: 0.45, y: 0.38 + breath, visibility: 0.99 };
    synthetic[14] = { x: 0.55, y: 0.38 + breath, visibility: 0.99 };
    synthetic[15] = { x: 0.49, y: 0.35 + breath, visibility: 0.99 };
    synthetic[16] = { x: 0.51, y: 0.35 + breath, visibility: 0.99 };
    synthetic[23] = { x: 0.46, y: 0.5 + breath, visibility: 0.99 };
    synthetic[24] = { x: 0.54, y: 0.5 + breath, visibility: 0.99 };
    synthetic[26] = { x: 0.54, y: 0.7, visibility: 0.99 };
    synthetic[28] = { x: 0.54, y: 0.88, visibility: 0.99 };
    synthetic[30] = { x: 0.55, y: 0.9, visibility: 0.99 };
    synthetic[32] = { x: 0.56, y: 0.91, visibility: 0.99 };
    synthetic[25] = { x: 0.37, y: 0.63, visibility: 0.99 };
    synthetic[27] = { x: 0.51, y: 0.66, visibility: 0.99 };
    synthetic[29] = { x: 0.52, y: 0.67, visibility: 0.99 };
    synthetic[31] = { x: 0.53, y: 0.68, visibility: 0.99 };
  } else {
    const cycle = (1 - Math.cos(progress)) / 2;

    synthetic[0] = { x: 0.5, y: 0.2, visibility: 0.99 };
    synthetic[11] = { x: 0.43, y: 0.3, visibility: 0.99 };
    synthetic[12] = { x: 0.57, y: 0.3, visibility: 0.99 };

    synthetic[13] = {
      x: 0.41 - cycle * 0.14,
      y: 0.45 - cycle * 0.145,
      visibility: 0.99,
    };
    synthetic[14] = {
      x: 0.59 + cycle * 0.14,
      y: 0.45 - cycle * 0.145,
      visibility: 0.99,
    };

    synthetic[15] = {
      x: 0.4 - cycle * 0.25,
      y: 0.58 - cycle * 0.265,
      visibility: 0.99,
    };
    synthetic[16] = {
      x: 0.6 + cycle * 0.25,
      y: 0.58 - cycle * 0.265,
      visibility: 0.99,
    };

    synthetic[23] = { x: 0.45, y: 0.5, visibility: 0.99 };
    synthetic[24] = { x: 0.55, y: 0.5, visibility: 0.99 };
    synthetic[25] = { x: 0.45, y: 0.7, visibility: 0.99 };
    synthetic[26] = { x: 0.55, y: 0.7, visibility: 0.99 };
    synthetic[27] = { x: 0.45, y: 0.88, visibility: 0.99 };
    synthetic[28] = { x: 0.55, y: 0.88, visibility: 0.99 };
  }

  return synthetic;
}
