class AudioCoachService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentLang: "pl" | "en" = "pl";

  private lastSpokenRepNumber: number = 0;
  private lastSpokenTime: number = 0;
  private minIntervalForGeneralFeedbackMs: number = 2000;

  constructor() {
    // Lazy initialized on user interaction
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
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
   * Instant low-latency chime when rep is registered (0ms delay)
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

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

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
   * Perfectly synchronized rep counting:
   * Fast, crisp Polish number pronunciation that stays 1:1 with movement.
   */
  public speakRep(repNumber: number) {
    if (
      this.isMuted ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    if (repNumber === this.lastSpokenRepNumber) {
      return;
    }
    this.lastSpokenRepNumber = repNumber;

    try {
      // Clear any lagging speech so trainer is always in real-time
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(String(repNumber));
      utterance.rate = 1.35; // Crisp, clear pace
      utterance.pitch = 1.05;
      utterance.lang = this.currentLang === "pl" ? "pl-PL" : "en-US";

      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = this.currentLang === "pl" ? "pl" : "en";
      const matchedVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(targetLangPrefix),
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public speak(text: string, force: boolean = false) {
    if (
      this.isMuted ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const now = Date.now();
    if (
      !force &&
      now - this.lastSpokenTime < this.minIntervalForGeneralFeedbackMs
    ) {
      return;
    }

    try {
      if (force) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.25;
      utterance.pitch = 1.0;
      utterance.lang = this.currentLang === "pl" ? "pl-PL" : "en-US";

      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = this.currentLang === "pl" ? "pl" : "en";
      const matchedVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(targetLangPrefix),
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
      this.lastSpokenTime = now;
    } catch {}
  }

  public resetQueue() {
    this.lastSpokenRepNumber = 0;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioCoach = new AudioCoachService();
