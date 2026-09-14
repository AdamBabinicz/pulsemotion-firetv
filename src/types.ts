export type ExerciseId = 
  | 'squats'
  | 'jumping_jacks'
  | 'high_knees'
  | 'tree_pose'
  | 'arm_raises';

export type FormQuality = 'perfect' | 'good' | 'needs_correction' | 'idle';

export interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  category: 'Strength' | 'Cardio' | 'Balance' | 'Mobility';
  targetRepsOrSeconds: number;
  isTimeBased: boolean;
  caloriePerRepOrSec: number;
  description: string;
  targetMuscles: string[];
  keyCues: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseFrameData {
  landmarks: Landmark[];
  detected: boolean;
}

export interface ExerciseMetrics {
  reps: number;
  target: number;
  currentAngle: number;
  targetAngleMin: number;
  targetAngleMax: number;
  formQuality: FormQuality;
  feedbackMessage: string;
  caloriesBurned: number;
  elapsedSeconds: number;
  accuracyScores: number[]; // 0-100 for each rep
  averageAccuracy: number;
  stage: string; // e.g. 'up', 'down', 'holding'
}

export interface WorkoutHistoryItem {
  id: string;
  exerciseId: ExerciseId;
  exerciseName: string;
  date: string;
  reps: number;
  durationSeconds: number;
  calories: number;
  accuracy: number;
}
