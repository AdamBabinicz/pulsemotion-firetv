import { ExerciseId, FormQuality, Landmark } from '../types';
import { calculateAngle, calculateDistance, POSE_LANDMARKS } from './poseGeometry';

export interface ClassificationResult {
  countedRep: boolean;
  repAccuracy: number; // 0 - 100
  currentAngle: number;
  targetAngleMin: number;
  targetAngleMax: number;
  stage: string;
  formQuality: FormQuality;
  feedbackMessage: string;
}

export class ExerciseTracker {
  private stage: string = 'up'; // 'up', 'down', 'holding', etc.
  private currentExercise: ExerciseId = 'squats';
  private holdStartTime: number = 0;
  private minAngleSeenInRep: number = 180;
  private maxAngleSeenInRep: number = 0;
  private language: 'pl' | 'en' = 'pl';

  constructor(exerciseId: ExerciseId, language: 'pl' | 'en' = 'pl') {
    this.currentExercise = exerciseId;
    this.language = language;
    this.reset();
  }

  public setExercise(exerciseId: ExerciseId) {
    this.currentExercise = exerciseId;
    this.reset();
  }

  public setLanguage(lang: 'pl' | 'en') {
    this.language = lang;
  }

  public reset() {
    this.stage = 'up';
    this.holdStartTime = 0;
    this.minAngleSeenInRep = 180;
    this.maxAngleSeenInRep = 0;
  }

  public processFrame(landmarks: Landmark[]): ClassificationResult {
    const isPl = this.language === 'pl';
    if (!landmarks || landmarks.length < 33) {
      return {
        countedRep: false,
        repAccuracy: 0,
        currentAngle: 0,
        targetAngleMin: 0,
        targetAngleMax: 0,
        stage: isPl ? 'Brak sylwetki' : 'No person detected',
        formQuality: 'idle',
        feedbackMessage: isPl
          ? 'Cofnij się o 1-2 kroki, aby kamera widziała całe ciało'
          : 'Step back so your full body is in the camera frame',
      };
    }

    switch (this.currentExercise) {
      case 'squats':
        return this.processSquats(landmarks);
      case 'jumping_jacks':
        return this.processJumpingJacks(landmarks);
      case 'high_knees':
        return this.processHighKnees(landmarks);
      case 'tree_pose':
        return this.processTreePose(landmarks);
      case 'arm_raises':
        return this.processArmRaises(landmarks);
      default:
        return this.processSquats(landmarks);
    }
  }

  /**
   * Squats Classifier:
   * Knee angle: Hip (23/24) -> Knee (25/26) -> Ankle (27/28)
   * Target: Standing > 160 deg; Deep squat <= 90-95 deg
   */
  private processSquats(landmarks: Landmark[]): ClassificationResult {
    const isPl = this.language === 'pl';
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = Math.round((leftKneeAngle + rightKneeAngle) / 2);

    let countedRep = false;
    let repAccuracy = 0;
    let formQuality: FormQuality = 'good';
    let feedbackMessage = isPl ? 'Schodź powoli w dół' : 'Lower your hips slowly';

    // Track min angle reached in this down cycle
    if (avgKneeAngle < this.minAngleSeenInRep) {
      this.minAngleSeenInRep = avgKneeAngle;
    }

    // Check knee cave (distance between knees vs distance between ankles)
    const kneeDist = calculateDistance(leftKnee, rightKnee);
    const ankleDist = calculateDistance(leftAnkle, rightAnkle);
    const isKneeCaving = kneeDist < ankleDist * 0.75 && avgKneeAngle < 120;

    if (avgKneeAngle > 155) {
      // Standing position
      if (this.stage === 'down') {
        // Rep completion
        const lowestAngle = this.minAngleSeenInRep;
        this.stage = 'up';
        this.minAngleSeenInRep = 180;

        if (lowestAngle <= 95) {
          countedRep = true;
          repAccuracy = Math.min(100, Math.max(70, Math.round(100 - Math.abs(lowestAngle - 85) * 1.5)));
          feedbackMessage = lowestAngle <= 85 
            ? (isPl ? 'Świetna głębokość! 100%' : 'Incredible depth! 100%') 
            : (isPl ? 'Dobre powtórzenie! Wypchnij z pięt' : 'Good rep! Push through heels');
          formQuality = 'perfect';
        } else {
          feedbackMessage = isPl 
            ? `Zejdź głębiej! Było ${lowestAngle}°, potrzebujesz ≤90°`
            : `Squat deeper! Reached ${lowestAngle}°, need 90°`;
          formQuality = 'needs_correction';
        }
      } else {
        this.stage = 'up';
        feedbackMessage = isPl ? 'Rozpocznij przysiad schodząc w dół' : 'Begin lowering into squat';
        formQuality = 'idle';
      }
    } else if (avgKneeAngle <= 95) {
      // Bottom of squat
      this.stage = 'down';
      if (isKneeCaving) {
        formQuality = 'needs_correction';
        feedbackMessage = isPl ? 'Wypchnij kolana na zewnątrz!' : 'Push your knees outward!';
      } else {
        formQuality = 'perfect';
        feedbackMessage = isPl ? 'Idealna głębokość! Teraz wstań!' : 'Perfect depth! Now drive up!';
      }
    } else {
      // Transitioning
      if (this.stage === 'down') {
        feedbackMessage = isPl ? 'Wstawaj płynnie, plecy prosto' : 'Driving up... maintain core tension';
      } else {
        feedbackMessage = isPl ? `Zejdź niżej (obecnie ${avgKneeAngle}°)` : `Keep going lower (currently ${avgKneeAngle}°)`;
      }
      formQuality = isKneeCaving ? 'needs_correction' : 'good';
    }

    return {
      countedRep,
      repAccuracy,
      currentAngle: avgKneeAngle,
      targetAngleMin: 80,
      targetAngleMax: 95,
      stage: this.stage === 'down' 
        ? (isPl ? 'Zejście w dół' : 'Descending / Bottom') 
        : (isPl ? 'Pozycja stojąca' : 'Standing Up'),
      formQuality,
      feedbackMessage,
    };
  }

  /**
   * Jumping Jacks Classifier
   */
  private processJumpingJacks(landmarks: Landmark[]): ClassificationResult {
    const isPl = this.language === 'pl';
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];

    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);
    const feetSpread = calculateDistance(leftAnkle, rightAnkle);
    const feetRatio = feetSpread / Math.max(0.01, shoulderWidth);

    const handsOverhead = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;

    let countedRep = false;
    let repAccuracy = 0;
    let formQuality: FormQuality = 'good';
    let feedbackMessage = isPl ? 'Wyskok z wymachem rąk' : 'Jump and open arms';

    if (handsOverhead && feetRatio > 1.35) {
      if (this.stage === 'closed') {
        this.stage = 'open';
      }
      formQuality = 'perfect';
      feedbackMessage = isPl ? 'Dłonie w górze, teraz złącz stopy' : 'Arms high, now return together';
    } else if (!handsOverhead && feetRatio < 1.1) {
      if (this.stage === 'open') {
        this.stage = 'closed';
        countedRep = true;
        repAccuracy = 95;
        feedbackMessage = isPl ? 'Świetne tempo! Kontynuuj pajacyki' : 'Great rhythm! Keep jumping';
        formQuality = 'perfect';
      } else {
        this.stage = 'closed';
        feedbackMessage = isPl ? 'Wyskok w szeroki rozkrok z uniesieniem rąk' : 'Jump wide and raise arms';
        formQuality = 'idle';
      }
    }

    return {
      countedRep,
      repAccuracy,
      currentAngle: Math.round(feetRatio * 50),
      targetAngleMin: 65,
      targetAngleMax: 90,
      stage: this.stage === 'open' ? (isPl ? 'Rozkrok w górze' : 'Open Jump') : (isPl ? 'Złączenie' : 'Closed Feet'),
      formQuality,
      feedbackMessage,
    };
  }

  /**
   * High Knees Classifier
   */
  private processHighKnees(landmarks: Landmark[]): ClassificationResult {
    const isPl = this.language === 'pl';
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];

    const leftKneeLifted = leftKnee.y <= leftHip.y + 0.05;
    const rightKneeLifted = rightKnee.y <= rightHip.y + 0.05;

    let countedRep = false;
    let repAccuracy = 0;
    let formQuality: FormQuality = 'good';
    let feedbackMessage = isPl ? 'Unieś kolano do linii bioder' : 'Drive knee up to hip level';

    if (leftKneeLifted && this.stage !== 'left_up') {
      this.stage = 'left_up';
      countedRep = true;
      repAccuracy = 90;
      formQuality = 'perfect';
      feedbackMessage = isPl ? 'Lewe kolano wysoko! Zmiana nogi!' : 'Left knee high! Now switch!';
    } else if (rightKneeLifted && this.stage !== 'right_up') {
      this.stage = 'right_up';
      countedRep = true;
      repAccuracy = 90;
      formQuality = 'perfect';
      feedbackMessage = isPl ? 'Prawe kolano wysoko! Trzymaj rytm!' : 'Right knee high! Keep cadence!';
    } else if (!leftKneeLifted && !rightKneeLifted) {
      formQuality = 'idle';
      feedbackMessage = isPl ? 'Unieś kolana wyżej!' : 'Lift knees higher!';
    }

    return {
      countedRep,
      repAccuracy,
      currentAngle: leftKneeLifted || rightKneeLifted ? 90 : 45,
      targetAngleMin: 85,
      targetAngleMax: 105,
      stage: this.stage,
      formQuality,
      feedbackMessage,
    };
  }

  /**
   * Yoga Tree Pose
   */
  private processTreePose(landmarks: Landmark[]): ClassificationResult {
    const isPl = this.language === 'pl';
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];

    const leftFootLifted = leftAnkle.y < rightKnee.y + 0.1;
    const rightFootLifted = rightAnkle.y < leftKnee.y + 0.1;

    const isBalancing = (leftFootLifted && !rightFootLifted) || (rightFootLifted && !leftFootLifted);

    let countedRep = false;
    let formQuality: FormQuality = isBalancing ? 'perfect' : 'needs_correction';
    let feedbackMessage = isBalancing 
      ? (isPl ? 'Trzymaj stabilnie! Spokojny wdech i wydech' : 'Hold steady! Focus on breathing')
      : (isPl ? 'Oprzyj jedną stopę o łydkę lub udo' : 'Lift one foot onto inner calf/thigh');

    const now = Date.now();
    if (isBalancing) {
      if (!this.holdStartTime) {
        this.holdStartTime = now;
      } else if (now - this.holdStartTime >= 1000) {
        countedRep = true;
        this.holdStartTime = now;
      }
    } else {
      this.holdStartTime = 0;
    }

    return {
      countedRep,
      repAccuracy: isBalancing ? 95 : 50,
      currentAngle: isBalancing ? 90 : 0,
      targetAngleMin: 80,
      targetAngleMax: 100,
      stage: isBalancing ? (isPl ? 'Trzymanie balansu' : 'Holding Balance') : (isPl ? 'Ustawianie stopy' : 'Setting Foot'),
      formQuality,
      feedbackMessage,
    };
  }

  /**
   * Lateral Arm Raises
   */
  private processArmRaises(landmarks: Landmark[]): ClassificationResult {
    const isPl = this.language === 'pl';
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];

    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];

    const leftArmAngle = calculateAngle(leftHip, leftShoulder, leftElbow);
    const rightArmAngle = calculateAngle(rightHip, rightShoulder, rightElbow);
    const avgArmAngle = Math.round((leftArmAngle + rightArmAngle) / 2);

    let countedRep = false;
    let repAccuracy = 0;
    let formQuality: FormQuality = 'good';
    let feedbackMessage = isPl ? 'Unoś ramiona w bok do linii barków' : 'Raise arms laterally to shoulders';

    if (avgArmAngle < this.minAngleSeenInRep) {
      this.minAngleSeenInRep = avgArmAngle;
    }
    if (avgArmAngle > this.maxAngleSeenInRep) {
      this.maxAngleSeenInRep = avgArmAngle;
    }

    if (avgArmAngle >= 80 && avgArmAngle <= 105) {
      this.stage = 'raised';
      formQuality = 'perfect';
      feedbackMessage = isPl ? 'Utrzymaj chwilę na wysokości barków (90°)' : 'Hold briefly at 90° shoulder height';
    } else if (avgArmAngle < 40) {
      if (this.stage === 'raised') {
        countedRep = true;
        repAccuracy = Math.min(100, Math.max(75, Math.round(100 - Math.abs(this.maxAngleSeenInRep - 90) * 1.5)));
        feedbackMessage = isPl ? 'Wspaniała kontrola ramion!' : 'Great shoulder control!';
        formQuality = 'perfect';
        this.stage = 'lowered';
        this.maxAngleSeenInRep = 0;
      } else {
        this.stage = 'lowered';
        feedbackMessage = isPl ? 'Rozpocznij unoszenie ramion w bok' : 'Begin raising arms sideways';
        formQuality = 'idle';
      }
    } else if (avgArmAngle > 115) {
      formQuality = 'needs_correction';
      feedbackMessage = isPl ? 'Nie unoś rąk powyżej poziomu barków!' : 'Don\'t raise above shoulder height!';
    }

    return {
      countedRep,
      repAccuracy,
      currentAngle: avgArmAngle,
      targetAngleMin: 80,
      targetAngleMax: 100,
      stage: this.stage === 'raised' ? (isPl ? 'Ramiona w poziomie' : 'Arms Parallel') : (isPl ? 'Ramiona przy tułowiu' : 'Arms at Sides'),
      formQuality,
      feedbackMessage,
    };
  }
}
