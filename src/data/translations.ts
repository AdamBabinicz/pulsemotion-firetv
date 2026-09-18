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

export interface TvNavigationLabels {
  dpadHint: string;
  dpadUp: string;
  dpadDown: string;
  dpadLeft: string;
  dpadRight: string;
  dpadCenter: string;
  back: string;
  modalCloseHint: string;
  headerZone: string;
  cameraZone: string;
  exerciseZone: string;
  actionZone: string;
  footerZone: string;
}

export interface TranslationSchema {
  appTitle: string;
  appSubtitle: string;
  privacyBadge: string;
  tvModeHint: string;
  cameraActive: string;
  cameraInactive: string;
  cameraNoDevice: string;
  cameraNoDeviceDesc: string;
  cameraDenied: string;
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
  biomechanicalPatternLabel: string;
  returnToExerciseView: string;
  closeModalHint: string;
  nextExerciseBtn: string;
  repeatSetBtn: string;
  remoteTitle: string;
  tvRemoteTitle: string;
  hideRemote: string;
  showRemote: string;
  remoteNavHint: string;
  remoteActionHint: string;
  remoteMuteHint: string;
  navHint: string;
  confirmHint: string;
  muteHint: string;
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
  // TV Remote Navigation
  tvNavigation: TvNavigationLabels;
  // Legal, Cookies & Footer
  cookieBanner: {
    title: string;
    description: string;
    acceptAll: string;
    necessaryOnly: string;
    settings: string;
  };
  cookieModal: {
    title: string;
    subtitle: string;
    necessaryTitle: string;
    necessaryDesc: string;
    analyticsTitle: string;
    analyticsDesc: string;
    alwaysActive: string;
    savePreferences: string;
    close: string;
  };
  privacyPolicyModal: {
    title: string;
    lastUpdated: string;
    section1Title: string;
    section1Text: string;
    section2Title: string;
    section2Text: string;
    section3Title: string;
    section3Text: string;
    section4Title: string;
    section4Text: string;
    closeBtn: string;
  };
  termsModal: {
    title: string;
    lastUpdated: string;
    disclaimerTitle: string;
    disclaimerText: string;
    rulesTitle: string;
    rulesText: string;
    liabilityTitle: string;
    liabilityText: string;
    closeBtn: string;
  };
  footer: {
    author: string;
    rights: string;
    builtFor: string;
    privacyLink: string;
    termsLink: string;
    cookieSettingsLink: string;
  };
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
    tvModeHint: "Steruj pilotem TV: D-pad (↑ ↓ ← →), OK, Wstecz",
    cameraActive: "Kamera TV Aktywna",
    cameraInactive: "Kamera Wyłączona",
    cameraNoDevice: "Brak Kamery",
    cameraNoDeviceDesc:
      "Nie wykryto urządzenia wideo. Fire TV Stick nie ma wbudowanej kamery — podłącz kamerę USB albo użyj trybu symulacji AI.",
    cameraDenied: "Brak Dostępu do Kamery",
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
      "Aplikacja analizuje Twoją sylwetkę w 100% lokalnie na Twoim urządzeniu. Wideo nigdy nie opuszcza urządzenia.",
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
    biomechanicalPatternLabel: "Wzorzec biomechaniczny: ",
    returnToExerciseView: "Wróć do podglądu ćwiczenia (Esc)",
    closeModalHint: "Zamknij (Esc / Back)",
    nextExerciseBtn: "Kolejne Ćwiczenie (Enter)",
    repeatSetBtn: "Powtórz Serię",
    remoteTitle: "Pilot Fire TV",
    tvRemoteTitle: "Pilot Fire TV",
    hideRemote: "Ukryj Pilot TV",
    showRemote: "Pilot Fire TV",
    remoteNavHint: "Nawigacja: D-pad ↑ / ↓ / ← / →",
    remoteActionHint: "Zatwierdź: OK / Enter | Wstecz: Back / Esc",
    remoteMuteHint: "Wycisz dźwięk: Klawisz M",
    navHint: "Nawigacja",
    confirmHint: "Zatwierdź",
    muteHint: "Wycisz",
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
      "Naciśnij OK na pilocie lub powiedz „Start”, aby wznowić trening.",
    // Mobile Features
    switchCamera: "Obróć Kamerę",
    frontCamera: "Przednia",
    backCamera: "Tylna",
    mobileWorkoutMode: "Tryb Mobilny",
    mobileGuideToggle: "Wskazówki ćwiczenia",
    // TV Remote Navigation
    tvNavigation: {
      dpadHint: "Nawigacja D-pad: Użyj strzałek ↑ ↓ ← → i przycisku OK",
      dpadUp: "Góra",
      dpadDown: "Dół",
      dpadLeft: "Lewo",
      dpadRight: "Prawo",
      dpadCenter: "Wybierz (OK)",
      back: "Wstecz",
      modalCloseHint: "Naciśnij Wstecz / Escape, aby powrócić",
      headerZone: "Pasek górny",
      cameraZone: "Strefa kamery i symulacji",
      exerciseZone: "Wybór ćwiczeń",
      actionZone: "Akcje treningowe",
      footerZone: "Stopka",
    },
    // Legal, Cookies & Footer
    cookieBanner: {
      title: "Prywatność i Pliki Cookies",
      description:
        "Używamy niezbędnych danych lokalnych (np. język, motyw) oraz opcjonalnych ciasteczek analitycznych Google (GTM/GA4) w celu poprawy działania aplikacji. Przetwarzanie wideo z kamery odbywa się w 100% lokalnie na Twoim urządzeniu.",
      acceptAll: "Zaakceptuj wszystkie",
      necessaryOnly: "Tylko niezbędne",
      settings: "Dostosuj",
    },
    cookieModal: {
      title: "Centrum Preferencji Cookies",
      subtitle: "Wybierz, na jakie pliki cookies i technologie wyrażasz zgodę.",
      necessaryTitle: "Niezbędne pliki techniczne",
      necessaryDesc:
        "Wymagane do działania aplikacji, zapisu preferencji języka, wybranego motywu oraz stanu sesji treningowej.",
      analyticsTitle: "Pliki analityczne (Google Tag Manager / GA4)",
      analyticsDesc:
        "Pomagają nam anonimowo mierzyć ruch i stabilność aplikacji. Nie rejestrują żadnych danych z kamery ani mikrofonu.",
      alwaysActive: "Zawsze aktywne",
      savePreferences: "Zapisz preferencje",
      close: "Zamknij",
    },
    privacyPolicyModal: {
      title: "Polityka Prywatności PulseMotion TV",
      lastUpdated: "Ostatnia aktualizacja: Wrzesień 2026",
      section1Title: "1. 100% Lokalne Przetwarzanie Kamery (Zero-Cloud Vision)",
      section1Text:
        "PulseMotion TV wykorzystuje model Google MediaPipe działający wyłącznie w Twojej przeglądarce za pośrednictwem technologii WebAssembly SIMD (inferencja na CPU) i nakładki Canvas 2D. Klatki wideo z kamery są analizowane w czasie rzeczywistym w pamięci RAM Twojego urządzenia i natychmiast usuwane. Żadne zdjęcia, wideo ani punkty biometryczne nigdy nie są przesyłane do serwerów zewnętrznych ani chmury.",
      section2Title: "2. Mikrofon i Sterowanie Głosem",
      section2Text:
        "Dostęp do mikrofonu jest opcjonalny i służy wyłącznie do rozpoznawania komend nawigacyjnych treningu za pośrednictwem Web Speech API. Dźwięk nie jest nagrywany na stałe ani archiwizowany. W każdej chwili możesz wyłączyć mikrofon komendą głosową lub klawiszem V.",
      section3Title: "3. Pamięć Lokalna (Local Storage) i Analityka",
      section3Text:
        "Aplikacja przechowuje w pamięci lokalnej przeglądarki jedynie ustawienia języka, motywu i preferencji cookies. W przypadku wyrażenia zgody, anonimowe statystyki użytkowania mogą być gromadzone przez Google Analytics bez profilowania osobowego.",
      section4Title: "4. Kontakt i Prawa Użytkownika",
      section4Text:
        "Aplikacja została stworzona w celach edukacyjnych i demonstracyjnych w ramach Amazon Developer Hackathon. Wszelkie pytania dotyczące kodu i prywatności można kierować poprzez oficjalne repozytorium GitHub projektu.",
      closeBtn: "Rozumiem i zamykam",
    },
    termsModal: {
      title: "Regulamin i Zastrzeżenie Medyczne",
      lastUpdated: "Ostatnia aktualizacja: Wrzesień 2026",
      disclaimerTitle: "1. Ważne Zastrzeżenie Medyczne (Health Disclaimer)",
      disclaimerText:
        "PulseMotion TV jest aplikacją demonstracyjną i edukacyjną AI, a nie certyfikowanym wyrobem medycznym. Wykrywanie kątów stawów i techniki ćwiczeń nie zastępuje profesjonalnej diagnozy medycznej, trenera personalnego ani fizjoterapeuty. Przed rozpoczęciem każdego programu treningowego skonsultuj się z lekarzem, zwłaszcza jeśli cierpisz na schorzenia układu krążenia lub aparatu ruchu.",
      rulesTitle: "2. Warunki Korzystania",
      rulesText:
        "Użytkownik zobowiązuje się do korzystania z aplikacji w bezpiecznym otoczeniu domowym, wolnym od przeszkód fizycznych. Ćwiczenia wykonujesz na własną odpowiedzialność, dostosowując intensywność do swojego samopoczucia.",
      liabilityTitle: "3. Ograniczenie Odpowiedzialności i Licencja",
      liabilityText:
        "Oprogramowanie jest udostępniane na licencji Open Source MIT „tak jak jest” (AS IS), bez jakichkolwiek gwarancji. Twórca nie ponosi odpowiedzialności za ewentualne kontuzje lub urazy wynikłe z nieprawidłowego wykonywania ćwiczeń.",
      closeBtn: "Akceptuję regulamin",
    },
    footer: {
      author: "Twórca: Adam Babinicz",
      rights: "Wszelkie prawa zastrzeżone.",
      builtFor: "Zbudowano na Amazon Developer Hackathon (Fire TV Track)",
      privacyLink: "Polityka Prywatności",
      termsLink: "Regulamin i Zdrowie",
      cookieSettingsLink: "Ustawienia Cookies",
    },
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
    tvModeHint: "Navigate with TV remote: D-pad (↑ ↓ ← →), OK, Back",
    cameraActive: "TV Camera Active",
    cameraInactive: "Camera Offline",
    cameraNoDevice: "No Camera Found",
    cameraNoDeviceDesc:
      "No video input device detected. Fire TV Stick has no built-in camera — connect a USB camera or use AI Simulation mode.",
    cameraDenied: "Camera Access Denied",
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
      "Your posture is computed 100% locally on your device. Video frames are processed in-browser and never uploaded.",    enableCameraBtn: "Allow & Start Camera",
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
    biomechanicalPatternLabel: "Biomechanical pattern: ",
    returnToExerciseView: "Return to exercise view (Esc)",
    closeModalHint: "Close (Esc / Back)",
    nextExerciseBtn: "Next Exercise (Enter)",
    repeatSetBtn: "Repeat Set",
    remoteTitle: "Fire TV Remote",
    tvRemoteTitle: "Fire TV Remote",
    hideRemote: "Hide Remote",
    showRemote: "Fire TV Remote",
    remoteNavHint: "Navigate: D-pad ↑ / ↓ / ← / →",
    remoteActionHint: "Select: OK / Enter | Back: Back / Esc",
    remoteMuteHint: "Mute Voice: M key",
    navHint: "Navigate",
    confirmHint: "Confirm",
    muteHint: "Mute",
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
      'Press OK on remote or say "Resume" / "Start" to continue.',
    // Mobile Features
    switchCamera: "Switch Camera",
    frontCamera: "Front",
    backCamera: "Rear",
    mobileWorkoutMode: "Mobile Mode",
    mobileGuideToggle: "Exercise Guide",
    // TV Remote Navigation
    tvNavigation: {
      dpadHint: "D-pad Navigation: Use arrows ↑ ↓ ← → and OK button",
      dpadUp: "Up",
      dpadDown: "Down",
      dpadLeft: "Left",
      dpadRight: "Right",
      dpadCenter: "Select (OK)",
      back: "Back",
      modalCloseHint: "Press Back / Escape to return",
      headerZone: "Header Bar",
      cameraZone: "Camera & Simulation Area",
      exerciseZone: "Exercise Selection",
      actionZone: "Workout Actions",
      footerZone: "Footer",
    },
    // Legal, Cookies & Footer
    cookieBanner: {
      title: "Privacy & Cookie Preferences",
      description:
        "We use essential local state (e.g. language, theme) and optional Google Analytics (GTM/GA4) cookies to improve application performance. All camera video processing occurs 100% on your local device.",
      acceptAll: "Accept all",
      necessaryOnly: "Essential only",
      settings: "Customize",
    },
    cookieModal: {
      title: "Cookie Preferences Center",
      subtitle: "Select which cookies and technologies you consent to.",
      necessaryTitle: "Essential technical storage",
      necessaryDesc:
        "Required for core application functionality, saving language, theme, and active workout state.",
      analyticsTitle: "Analytics (Google Tag Manager / GA4)",
      analyticsDesc:
        "Helps us measure anonymous traffic and platform stability. Zero video or microphone data is ever tracked.",
      alwaysActive: "Always active",
      savePreferences: "Save preferences",
      close: "Close",
    },
    privacyPolicyModal: {
      title: "PulseMotion TV Privacy Policy",
      lastUpdated: "Last updated: September 2026",
      section1Title: "1. 100% On-Device Camera Processing (Zero-Cloud Vision)",
      section1Text:
        "PulseMotion TV runs Google MediaPipe Pose entirely inside your client browser using WebAssembly SIMD inference (CPU) with a Canvas 2D overlay. Camera video frames are analyzed frame-by-frame in volatile RAM and immediately discarded. No video, photography, or biometric coordinates are ever transmitted to external cloud servers.",
      section2Title: "2. Microphone & Hands-Free Voice Control",
      section2Text:
        "Microphone access is strictly optional and used exclusively for real-time workout voice commands via the browser Web Speech API. Audio is never recorded, saved, or uploaded. You can disable the microphone at any time by voice command or by pressing the V key.",
      section3Title: "3. Local Storage & Anonymous Telemetry",
      section3Text:
        "The app stores only UI preferences (language, theme, cookie consent) in localStorage. If consented, anonymous performance telemetry is recorded via Google Analytics without personal profiling.",
      section4Title: "4. Contact & Developer Rights",
      section4Text:
        "This project was created as an open-source demonstration for the Amazon Developer Hackathon (Fire TV Track). Inquiries can be submitted directly via the official GitHub repository.",
      closeBtn: "Acknowledge & Close",
    },
    termsModal: {
      title: "Terms of Service & Health Disclaimer",
      lastUpdated: "Last updated: September 2026",
      disclaimerTitle: "1. Critical Health & Medical Disclaimer",
      disclaimerText:
        "PulseMotion TV is an AI-powered fitness demonstration tool, not a certified medical or clinical device. Posture angle calculations and repetition counting do not replace medical advice, physical therapy, or professional coaching. Consult a healthcare professional before beginning any exercise routine, particularly if you have pre-existing cardiovascular or joint conditions.",
      rulesTitle: "2. Conditions of Use",
      rulesText:
        "Users agree to maintain a safe, obstacle-free workout environment with sufficient clearance. You perform exercises at your own risk and discretion, matching workout intensity to your personal fitness level.",
      liabilityTitle: "3. Limitation of Liability & MIT License",
      liabilityText:
        "The software is provided AS IS under the MIT Open Source License, without warranty of any kind. The author disclaims any liability for injuries or damages arising from exercise participation.",
      closeBtn: "I Accept the Terms",
    },
    footer: {
      author: "Author: Adam Babinicz",
      rights: "All rights reserved.",
      builtFor: "Built for Amazon Developer Hackathon (Fire TV Track)",
      privacyLink: "Privacy Policy",
      termsLink: "Terms & Health Disclaimer",
      cookieSettingsLink: "Cookie Settings",
    },
    // Exercises
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
    // Spoken feedback messages
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
