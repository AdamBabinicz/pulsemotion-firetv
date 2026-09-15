export type Language = "pl" | "en";
export type ThemeMode = "dark" | "light";

export interface ExerciseTranslation {
  name: string;
  category: string;
  difficulty: string;
  description: string;
  cues: string[];
  muscles: string[];
}

export interface VoiceCommandHelpItem {
  cmd: string;
  desc: string;
}

export interface TranslationSchema {
  appTitle: string;
  appSubtitle: string;
  privacyBadge: string;
  tvModeHint: string;
  cameraActive: string;
  cameraInactive: string;
  turnCameraOn: string;
  turnCameraOff: string;
  fps: string;
  hideSkeleton: string;
  showSkeleton: string;
  startSimulator: string;
  stopSimulator: string;
  studioMode: string;
  studioModeActive: string;
  studioModeDesc: string;
  cameraPromptTitle: string;
  cameraPromptDesc: string;
  enableCameraBtn: string;
  useSimulatorBtn: string;
  readyPrompt: string;
  selectExerciseLabel: string;
  tvCarouselMode: string;
  repsCounter: string;
  timeCounter: string;
  repsUnit: string;
  secUnit: string;
  formQualityLabel: string;
  caloriesLabel: string;
  caloriesUnit: string;
  durationLabel: string;
  setProgress: string;
  coachFeedbackLabel: string;
  soundActive: string;
  soundMuted: string;
  resetBtn: string;
  motionPattern: string;
  properPosture: string;
  targetAngleCue: string;
  rulesTitle: string;
  musclesTitle: string;
  levelLabel: string;
  setCompletedTitle: string;
  setCompletedDescMaster: string;
  setCompletedDescGood: string;
  setCompletedDescRetry: string;
  accuracyScore: string;
  energyBurned: string;
  timeSpent: string;
  safePatternBadge: string;
  nextExerciseBtn: string;
  repeatSetBtn: string;
  remoteTitle: string;
  hideRemote: string;
  showRemote: string;
  remoteNavHint: string;
  remoteActionHint: string;
  remoteMuteHint: string;
  themeLight: string;
  themeDark: string;
  // Voice Control
  voiceControlTitle: string;
  voiceControlActive: string;
  voiceControlListening: string;
  voiceControlOff: string;
  voiceControlTooltip: string;
  voiceHintBar: string;
  voiceMicMutedHint: string;
  voiceCommandsHelpTitle: string;
  voiceCommandsList: VoiceCommandHelpItem[];
  recognizedBadge: string;
  micPermissionDenied: string;
  pausedBanner: string;
  pausedBannerDesc: string;
  // Mobile Features
  switchCamera: string;
  frontCamera: string;
  backCamera: string;
  mobileWorkoutMode: string;
  mobileGuideToggle: string;
  exercises: {
    squats: ExerciseTranslation;
    jumping_jacks: ExerciseTranslation;
    high_knees: ExerciseTranslation;
    tree_pose: ExerciseTranslation;
    arm_raises: ExerciseTranslation;
  };
  voice: {
    greatRep: string;
    goDeeper: string;
    kneesOut: string;
    keepChestUp: string;
    armsHigh: string;
    liftKneesHigher: string;
    holdSteady: string;
    seriesCompleted: string;
    startingExercise: string;
    setReset: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  pl: {
    appTitle: "PulseMotion TV",
    appSubtitle: "Interaktywny Trener Fitness AI na Fire TV i Web",
    privacyBadge:
      "100% On-Device AI Vision (Prywatność – obraz nie opuszcza laptopa)",
    tvModeHint: "Steruj strzałkami ← → lub pilotem",
    cameraActive: "Kamera TV Aktywna",
    cameraInactive: "Kamera Wyłączona",
    turnCameraOn: "Włącz kamerę",
    turnCameraOff: "Wyłącz kamerę",
    fps: "FPS",
    hideSkeleton: "Ukryj szkielet",
    showSkeleton: "Pokaż szkielet",
    startSimulator: "Testuj Symulatorem",
    stopSimulator: "Zatrzymaj Symulację",
    studioMode: "Symulator AI",
    studioModeActive: "Symulacja AI",
    studioModeDesc: "Wirtualny ruch bez konieczności używania kamery",
    cameraPromptTitle: "Uruchom Kamerę do Treningu",
    cameraPromptDesc:
      "Aplikacja analizuje Twoją sylwetkę w 100% lokalnie na Twoim laptopie. Wideo nigdy nie opuszcza urządzenia.",
    enableCameraBtn: "Zezwól i Włącz Kamerę",
    useSimulatorBtn: "Włącz Symulację AI",
    readyPrompt: "Gotowy do startu",
    selectExerciseLabel: "Wybierz Ćwiczenie (Nawiguj lub kliknij)",
    tvCarouselMode: "Tryb Fire TV 10-Foot",
    repsCounter: "Zaliczone Powtórzenia",
    timeCounter: "Czas Stabilizacji",
    repsUnit: "powt.",
    secUnit: "s",
    formQualityLabel: "Jakość Techniki",
    caloriesLabel: "Energia",
    caloriesUnit: "kcal",
    durationLabel: "Czas Serii",
    setProgress: "POSTĘP SERII",
    coachFeedbackLabel: "Wskazówka Trenera AI",
    soundActive: "Głos Aktywny",
    soundMuted: "Wyciszony",
    resetBtn: "Reset",
    motionPattern: "WZORZEC RUCHU AI",
    properPosture: "Prawidłowa Postawa",
    targetAngleCue: "Kluczowy kąt docelowy: 90° (lub pełny wyprost)",
    rulesTitle: "Zasady Poprawnej Formy",
    musclesTitle: "Zaangażowane mięśnie:",
    levelLabel: "Poziom:",
    setCompletedTitle: "Seria Ukończona!",
    setCompletedDescMaster:
      "Mistrzowska technika! Utrzymałeś pełen zakres ruchu i doskonałą stabilizację.",
    setCompletedDescGood:
      "Bardzo dobra forma. Większość powtórzeń wykonana w idealnym tempie.",
    setCompletedDescRetry:
      "Dobra próba. Zwróć uwagę na głębokość i stabilizację.",
    accuracyScore: "Celność Formy",
    energyBurned: "Spalone kcal",
    timeSpent: "Czas Pracy",
    safePatternBadge:
      "Wzorzec bezpieczny: Kąty stawów w rekomendowanym oknie biomechanicznym.",
    nextExerciseBtn: "Kolejne Ćwiczenie (Enter)",
    repeatSetBtn: "Powtórz Serię",
    remoteTitle: "Pilot Fire TV",
    hideRemote: "Ukryj Pilot TV",
    showRemote: "Pilot Fire TV",
    remoteNavHint: "Nawigacja: ← / →",
    remoteActionHint: "Zatwierdź / Reset: Spacja / Enter",
    remoteMuteHint: "Wycisz dźwięk: Klawisz M",
    themeLight: "Jasny",
    themeDark: "Ciemny",
    // Voice Control
    voiceControlTitle: "Sterowanie Głosem",
    voiceControlActive: "Odsłuch Aktywny",
    voiceControlListening: "Słucham... Powiedz komendę",
    voiceControlOff: "Włącz Sterowanie Głosem",
    voiceControlTooltip:
      'Steruj treningiem bez dotykania urządzenia: powiedz np. "symulator", "pajacyki", "pauza", "wycisz"',
    voiceHintBar:
      "Spróbuj powiedzieć: „Symulator”, „Pajacyki”, „Bieg”, „Pauza”, „Start”, „Zamknij” lub „Wyłącz mikrofon” (skrót V)",
    voiceMicMutedHint:
      "Mikrofon wyłączony dla prywatności. Włącz kliknięciem lub klawiszem V.",
    voiceCommandsHelpTitle: "Dostępne Komendy Głosowe",
    voiceCommandsList: [
      {
        cmd: "„Przysiady”, „Pajacyki”, „Bieg”, „Drzewo”, „Wznosy”",
        desc: "Bezpośredni skok do wybranego ćwiczenia",
      },
      {
        cmd: "„Symulator” / „Demo”",
        desc: "Włącz automatyczną symulację ruchu AI bez kamery",
      },
      {
        cmd: "„Pauza” / „Stop”",
        desc: "Wstrzymaj ćwiczenie i licznik (mikrofon dalej czuwa)",
      },
      {
        cmd: "„Start” / „Wznów” / „Ćwiczymy”",
        desc: "Wznów trening lub zacznij nową serię",
      },
      {
        cmd: "„Zamknij” / „Wróć”",
        desc: "Zamknij okno podsumowania ukończonej serii",
      },
      {
        cmd: "„Powtórz serię” / „Jeszcze raz”",
        desc: "Powtórz właśnie ukończoną serię",
      },
      {
        cmd: "„Następne” / „Poprzednie”",
        desc: "Przewiń listę ćwiczeń",
      },
      {
        cmd: "„Reset” / „Od nowa”",
        desc: "Zresetuj licznik powtórzeń",
      },
      {
        cmd: "„Wycisz” / „Włącz dźwięk”",
        desc: "Wycisz lub odcisz głos trenera",
      },
      {
        cmd: "„Wyłącz mikrofon”",
        desc: "Zatrzymaj odsłuch głosu (wznowienie klawiszem V)",
      },
    ],
    recognizedBadge: "Rozpoznano komendę",
    micPermissionDenied:
      "Dostęp do mikrofonu został zablokowany w przeglądarce.",
    pausedBanner: "Trening Wstrzymany (Pauza)",
    pausedBannerDesc:
      "Powiedz „Start” lub naciśnij Spację/Enter, aby wznowić trening.",
    // Mobile Features
    switchCamera: "Obróć Kamerę",
    frontCamera: "Przednia",
    backCamera: "Tylna",
    mobileWorkoutMode: "Tryb Mobilny",
    mobileGuideToggle: "Wskazówki ćwiczenia",
    // Exercises
    exercises: {
      squats: {
        name: "Przysiady Siłowe",
        category: "Siła",
        difficulty: "Początkujący",
        description:
          "Głębokie przysiady wzmacniające mięśnie czworogłowe, pośladki i stabilizację tułowia.",
        cues: [
          "Stopy rozstawione na szerokość barków",
          "Kolana prowadzone zgodnie z linią stóp",
          "Uda równoległe do podłoża (kąt kolan ≤ 90°)",
        ],
        muscles: [
          "Czworogłowe ud",
          "Pośladkowe",
          "Kulszowo-goleniowe",
          "Mięśnie głębokie brzucha",
        ],
      },
      jumping_jacks: {
        name: "Pajacyki (Jumping Jacks)",
        category: "Kardio",
        difficulty: "Początkujący",
        description:
          "Dynamiczny trening wydolnościowy z koordynacją wymachów rąk i nóg.",
        cues: [
          "Klaśnięcie dłońmi nad głową w wyskoku",
          "Szeroki, sprężysty rozkrok",
          "Miękkie lądowanie na przedniej części stóp",
        ],
        muscles: ["Łydki", "Barki (naramienne)", "Układ krążenia"],
      },
      high_knees: {
        name: "Bieg z Wysokim Unoszeniem Kolan",
        category: "Kardio",
        difficulty: "Średniozaawansowany",
        description:
          "Eksplozywny bieg w miejscu z unoszeniem kolan powyżej linii bioder.",
        cues: [
          "Unieś kolano dynamicznie do wysokości bioder",
          "Utrzymaj wyprostowany tułów",
          "Krótki, sprężysty kontakt stopy z podłożem",
        ],
        muscles: ["Zginacze bioder", "Brzuch", "Czworogłowe", "Łydki"],
      },
      tree_pose: {
        name: "Joga: Pozycja Drzewa (Balans)",
        category: "Równowaga",
        difficulty: "Początkujący",
        description:
          "Izometryczny trening stabilizacji na jednej nodze, poprawiający równowagę i siłę stawów skokowych.",
        cues: [
          "Noga podporowa wyprostowana i stabilna",
          "Druga stopa oparta o łydkę lub wewnętrzną część uda",
          "Dłonie złączone na wysokości klatki piersiowej",
        ],
        muscles: ["Stawy skokowe", "Pośladkowy średni", "Prostowniki grzbietu"],
      },
      arm_raises: {
        name: "Wznosy Ramion w Bok",
        category: "Mobilność / Rehabilitacja",
        difficulty: "Początkujący",
        description:
          "Ćwiczenie mobilizujące i wzmacniające obręcz barkową z zachowaniem symetrii.",
        cues: [
          "Unoś ramiona w bok do poziomu 90° (wysokość barków)",
          "Kontroluj ruch przy opuszczaniu",
          "Nie unoś barków w stronę uszu (bez spinania szyi)",
        ],
        muscles: [
          "Boczne aktony mięśni naramiennych",
          "Czworoboczny",
          "Stożek rotatorów",
        ],
      },
    },
    // Spoken feedback messages
    voice: {
      greatRep: "Świetne powtórzenie!",
      goDeeper: "Zejdź głębiej! Potrzebny kąt 90 stopni.",
      kneesOut: "Wypchnij kolana na zewnątrz!",
      keepChestUp: "Klatka piersiowa w górę, nie garb się.",
      armsHigh: "Ręce wyżej nad głowę!",
      liftKneesHigher: "Kolana wyżej do linii bioder!",
      holdSteady: "Utrzymaj równowagę i spokojnie oddychaj.",
      seriesCompleted: "Brawo! Cała seria treningowa ukończona!",
      startingExercise: "Rozpoczynamy:",
      setReset: "Seria zresetowana. Zaczynamy od nowa.",
    },
  },
  en: {
    appTitle: "PulseMotion TV",
    appSubtitle: "Interactive AI Fitness Coach for Fire TV & Web",
    privacyBadge: "100% On-Device AI Vision (Zero video leaves your laptop)",
    tvModeHint: "Navigate with ← → arrows or remote",
    cameraActive: "TV Camera Active",
    cameraInactive: "Camera Offline",
    turnCameraOn: "Turn on camera",
    turnCameraOff: "Turn off camera",
    fps: "FPS",
    hideSkeleton: "Hide Skeleton",
    showSkeleton: "Show Skeleton",
    startSimulator: "Test with AI Simulator",
    stopSimulator: "Stop Simulator",
    studioMode: "AI Simulator",
    studioModeActive: "AI Simulation",
    studioModeDesc: "Test workouts with virtual movement without camera",
    cameraPromptTitle: "Enable Camera for Real-Time Coaching",
    cameraPromptDesc:
      "Your posture is computed 100% locally on your device. Video frames are processed in-browser and never uploaded.",
    enableCameraBtn: "Allow & Start Camera",
    useSimulatorBtn: "Start Motion Simulation",
    readyPrompt: "Ready to start",
    selectExerciseLabel: "Select Exercise (Navigate or Click)",
    tvCarouselMode: "Fire TV 10-Foot Mode",
    repsCounter: "Completed Reps",
    timeCounter: "Hold Duration",
    repsUnit: "reps",
    secUnit: "s",
    formQualityLabel: "Form Accuracy",
    caloriesLabel: "Energy",
    caloriesUnit: "kcal",
    durationLabel: "Set Time",
    setProgress: "SET PROGRESS",
    coachFeedbackLabel: "AI Coach Real-time Cue",
    soundActive: "Voice Active",
    soundMuted: "Muted",
    resetBtn: "Reset",
    motionPattern: "AI MOTION PATTERN",
    properPosture: "Proper Posture",
    targetAngleCue: "Key target angle: 90° (or full extension)",
    rulesTitle: "Biomechanical Rules",
    musclesTitle: "Target Muscles:",
    levelLabel: "Level:",
    setCompletedTitle: "Workout Set Complete!",
    setCompletedDescMaster:
      "Masterful technique! You maintained full range of motion and solid spinal alignment.",
    setCompletedDescGood:
      "Great effort! Most reps hit the biomechanical sweet spot.",
    setCompletedDescRetry:
      "Good start! Focus on depth and keeping knees tracking properly.",
    accuracyScore: "Form Accuracy",
    energyBurned: "Calories Burned",
    timeSpent: "Active Duration",
    safePatternBadge:
      "Safe Pattern: Joint angles stayed within the recommended orthopedic window.",
    nextExerciseBtn: "Next Exercise (Enter)",
    repeatSetBtn: "Repeat Set",
    remoteTitle: "Fire TV Remote",
    hideRemote: "Hide Remote",
    showRemote: "Fire TV Remote",
    remoteNavHint: "Navigate: ← / →",
    remoteActionHint: "Select / Reset: Space / Enter",
    remoteMuteHint: "Mute Voice: M key",
    themeLight: "Light",
    themeDark: "Dark",
    // Voice Control
    voiceControlTitle: "Voice Control",
    voiceControlActive: "Voice Listening",
    voiceControlListening: "Listening... Say a command",
    voiceControlOff: "Enable Voice Control",
    voiceControlTooltip:
      'Hands-free workout control: say "simulator", "squats", "pause", "mute"',
    voiceHintBar:
      'Try saying: "Simulator", "Squats", "High Knees", "Pause", "Resume", "Close" or "Stop listening" (key V)',
    voiceMicMutedHint:
      "Microphone off for privacy. Turn on by clicking or pressing V key.",
    voiceCommandsHelpTitle: "Supported Voice Commands",
    voiceCommandsList: [
      {
        cmd: '"Squats", "Jumping Jacks", "High Knees", "Tree Pose", "Arm Raises"',
        desc: "Jump straight to any exercise hands-free",
      },
      {
        cmd: '"Simulator" / "Demo"',
        desc: "Launch virtual AI biomechanical motion without camera",
      },
      {
        cmd: '"Pause" / "Stop"',
        desc: "Freeze set and timer (voice remains ready)",
      },
      {
        cmd: '"Start" / "Resume" / "Begin"',
        desc: "Resume workout or start new set",
      },
      {
        cmd: '"Close" / "Back"',
        desc: "Dismiss completed set summary modal",
      },
      {
        cmd: '"Repeat set" / "Again"',
        desc: "Instantly repeat the finished exercise set",
      },
      {
        cmd: '"Next" / "Prev"',
        desc: "Navigate through workout library",
      },
      {
        cmd: '"Reset" / "Start over"',
        desc: "Reset current rep count to zero",
      },
      {
        cmd: '"Mute" / "Unmute"',
        desc: "Toggle voice coach speech volume",
      },
      {
        cmd: '"Stop listening"',
        desc: "Turn off microphone (press V to turn back on)",
      },
    ],
    recognizedBadge: "Command recognized",
    micPermissionDenied: "Microphone permission was denied in browser.",
    pausedBanner: "Workout Paused",
    pausedBannerDesc:
      'Say "Resume" / "Start" or press Space/Enter to continue.',
    // Mobile Features
    switchCamera: "Switch Camera",
    frontCamera: "Front",
    backCamera: "Rear",
    mobileWorkoutMode: "Mobile Mode",
    mobileGuideToggle: "Exercise Guide",
    exercises: {
      squats: {
        name: "Power Squats",
        category: "Strength",
        difficulty: "Beginner",
        description:
          "Full-depth squats strengthening quads, glutes, and core stability.",
        cues: [
          "Feet shoulder-width apart",
          "Knees tracking over toes",
          "Thighs parallel to floor (knee angle <= 90°)",
        ],
        muscles: ["Quadriceps", "Gluteus", "Hamstrings", "Core"],
      },
      jumping_jacks: {
        name: "Jumping Jacks",
        category: "Cardio",
        difficulty: "Beginner",
        description:
          "Dynamic full-body cardiovascular rhythm test with shoulder & leg sync.",
        cues: [
          "Clap hands overhead",
          "Wide step/jump rhythm",
          "Soft landing on balls of feet",
        ],
        muscles: ["Calves", "Deltoids", "Cardiovascular System"],
      },
      high_knees: {
        name: "High Knees Sprint",
        category: "Cardio",
        difficulty: "Intermediate",
        description:
          "Explosive hip flexion raising knees to parallel or higher.",
        cues: [
          "Drive knee up to hip level",
          "Maintain upright torso",
          "Quick ground contact",
        ],
        muscles: ["Hip Flexors", "Abs", "Quads", "Calves"],
      },
      tree_pose: {
        name: "Yoga Tree Pose (Balance)",
        category: "Balance",
        difficulty: "Beginner",
        description:
          "Isometric single-leg balance enhancing postural proprioception and ankle stability.",
        cues: [
          "Standing leg grounded",
          "Opposite foot against calf or thigh",
          "Hands centered at chest",
        ],
        muscles: ["Ankles", "Gluteus Medius", "Spinal Erectors"],
      },
      arm_raises: {
        name: "Lateral Arm Raises",
        category: "Mobility / Rehab",
        difficulty: "Beginner",
        description:
          "Shoulder rehabilitation and mobility drill maintaining horizontal symmetry.",
        cues: [
          "Raise arms until parallel to floor (90°)",
          "Control the descent",
          "Avoid shrugging shoulders",
        ],
        muscles: ["Lateral Deltoids", "Trapezius", "Rotator Cuff"],
      },
    },
    voice: {
      greatRep: "Great rep!",
      goDeeper: "Go deeper! Aim for 90 degrees.",
      kneesOut: "Push knees outward!",
      keepChestUp: "Chest up, do not round your back.",
      armsHigh: "Raise arms overhead!",
      liftKneesHigher: "Drive knees higher to hip level!",
      holdSteady: "Hold balance and breathe smoothly.",
      seriesCompleted: "Congratulations! Full workout set completed!",
      startingExercise: "Starting:",
      setReset: "Set reset. Ready when you are.",
    },
  },
};
