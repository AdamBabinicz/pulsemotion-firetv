import { ExerciseDefinition } from '../types';

export const EXERCISES: ExerciseDefinition[] = [
  {
    id: 'squats',
    name: 'Power Squats',
    category: 'Strength',
    targetRepsOrSeconds: 10,
    isTimeBased: false,
    caloriePerRepOrSec: 0.4,
    description: 'Full-depth squats strengthening quads, glutes, and core stability.',
    targetMuscles: ['Quadriceps', 'Gluteus', 'Hamstrings', 'Core'],
    keyCues: ['Feet shoulder-width apart', 'Knees tracking over toes', 'Thighs parallel to floor (<= 90°)'],
    difficulty: 'Beginner'
  },
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    targetRepsOrSeconds: 15,
    isTimeBased: false,
    caloriePerRepOrSec: 0.25,
    description: 'Dynamic full-body cardiovascular rhythm test with shoulder & leg sync.',
    targetMuscles: ['Calves', 'Deltoids', 'Cardiovascular System'],
    keyCues: ['Clap hands overhead', 'Wide step/jump rhythm', 'Soft landing on balls of feet'],
    difficulty: 'Beginner'
  },
  {
    id: 'high_knees',
    name: 'High Knees Sprint',
    category: 'Cardio',
    targetRepsOrSeconds: 20,
    isTimeBased: false,
    caloriePerRepOrSec: 0.3,
    description: 'Explosive hip flexion raising knees to parallel or higher.',
    targetMuscles: ['Hip Flexors', 'Abs', 'Quads', 'Calves'],
    keyCues: ['Drive knee up to hip level', 'Maintain upright torso', 'Quick ground contact'],
    difficulty: 'Intermediate'
  },
  {
    id: 'tree_pose',
    name: 'Yoga Tree Pose (Balance)',
    category: 'Balance',
    targetRepsOrSeconds: 20,
    isTimeBased: true,
    caloriePerRepOrSec: 0.1,
    description: 'Isometric single-leg balance enhancing postural proprioception and ankle stability.',
    targetMuscles: ['Ankles', 'Gluteus Medius', 'Spinal Erectors'],
    keyCues: ['Standing leg grounded', 'Opposite foot against calf or thigh', 'Hands centered at chest'],
    difficulty: 'Beginner'
  },
  {
    id: 'arm_raises',
    name: 'Lateral Arm Raises',
    category: 'Mobility',
    targetRepsOrSeconds: 12,
    isTimeBased: false,
    caloriePerRepOrSec: 0.2,
    description: 'Shoulder rehabilitation and mobility drill maintaining horizontal symmetry.',
    targetMuscles: ['Lateral Deltoids', 'Trapezius', 'Rotator Cuff'],
    keyCues: ['Raise arms until parallel to floor (90°)', 'Control the descent', 'Avoid shrugging shoulders'],
    difficulty: 'Beginner'
  }
];
