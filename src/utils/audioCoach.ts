class AudioCoachService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentLang: "pl" | "en" = "pl";

  private lastSpokenRepNumber: number = 0;
  private lastSpokenTime: number = 0;
  private minIntervalForGeneralFeedbackMs: number = 2000;
  private isAudioUnlocked: boolean = false;

  constructor() {
    this.registerAutoUnlockListeners();
  }

  /**
   * Zgodność z Fire TV & Web Autoplay Policy:
   * Wybudza AudioContext przy pierwszej interakcji z pilotem lub ekranem.
   */
  private registerAutoUnlockListeners() {
    if (typeof window === "undefined") return;

    const unlock = () => {
      this.initAudio();
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx
          .resume()
          .then(() => {
            this.isAudioUnlocked = true;
          })
          .catch(() => {});
      } else if (this.audioCtx) {
        this.isAudioUnlocked = true;
      }

      window.removeEventListener("keydown", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("click", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
  }

  public initAudio() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== "undefined" && "speechSynthesis" in window) {
      this.resetQueue();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setLanguage(lang: "pl" | "en") {
    this.currentLang = lang;
  }

  /**
   * Progresywny ton powtórzenia na Fire TV (0 ms opóźnienia):
   * Każde powtórzenie ma unikalną, wznoszącą się częstotliwość, co daje
   * natychmiastowe akustyczne potwierdzenie zaliczonego ruchu w głośnikach TV.
   */
  public playRepToneForNumber(repNumber: number) {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Skala pentatoniczna dla powtórzeń (wznosząca się energia serii)
      const baseFreq = 440; // A4
      const step = ((repNumber - 1) % 10) * 40;
      const freq = baseFreq + step;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  /**
   * Dźwięk sukcesu powtórzenia
   */
  public playRepSuccessTone() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  /**
   * Dźwięk ostrzegawczy przy niepoprawnej formie
   */
  public playFormWarningTone() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.15);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  /**
   * Fanfara ukończenia serii ćwiczenia
   */
  public playWorkoutCompleteChime() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5];
    const now = this.audioCtx.currentTime;

    chords.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.55);
    });
  }

  /**
   * Zliczanie powtórzeń 1:1:
   * Zawsze emituje krystaliczny ton powtórzenia na TV,
   * a na urządzeniach z silnikiem TTS równolegle wymawia numer.
   */
  public speakRep(repNumber: number) {
    if (this.isMuted) return;

    if (repNumber === this.lastSpokenRepNumber) {
      return;
    }
    this.lastSpokenRepNumber = repNumber;

    // 1. Natychmiastowy, niezawodny dźwięk powtórzenia na głośnikach Fire TV
    this.playRepToneForNumber(repNumber);

    // 2. Jeśli przeglądarka obsługuje mowę (np. Chrome/Edge/Safari), wymawia liczbę
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(String(repNumber));
        utterance.rate = 1.35;
        utterance.pitch = 1.05;
        utterance.lang = this.currentLang === "pl" ? "pl-PL" : "en-US";

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const targetLangPrefix = this.currentLang === "pl" ? "pl" : "en";
          const matchedVoice = voices.find((v) =>
            v.lang.toLowerCase().startsWith(targetLangPrefix),
          );
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        }

        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  }

  /**
   * Wypowiadanie wskazówki trenera lub sygnał dźwiękowy na TV
   */
  public speak(text: string, force: boolean = false) {
    if (this.isMuted) return;

    const now = Date.now();
    if (
      !force &&
      now - this.lastSpokenTime < this.minIntervalForGeneralFeedbackMs
    ) {
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        if (force) {
          window.speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.25;
        utterance.pitch = 1.0;
        utterance.lang = this.currentLang === "pl" ? "pl-PL" : "en-US";

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const targetLangPrefix = this.currentLang === "pl" ? "pl" : "en";
          const matchedVoice = voices.find((v) =>
            v.lang.toLowerCase().startsWith(targetLangPrefix),
          );
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        }

        window.speechSynthesis.speak(utterance);
        this.lastSpokenTime = now;
        return;
      } catch {}
    }

    // Fallback dźwiękowy dla urządzeń TV bez syntezy mowy
    this.playRepSuccessTone();
    this.lastSpokenTime = now;
  }

  public resetQueue() {
    this.lastSpokenRepNumber = 0;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioCoach = new AudioCoachService();
