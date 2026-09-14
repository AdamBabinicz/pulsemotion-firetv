class AudioCoachService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastSpokenTime: number = 0;
  private minIntervalBetweenSpeechMs: number = 2200;

  constructor() {
    // Lazy initialized on first user interaction to comply with browser audio autoplay policy
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play high-pitch ding when a rep is successfully counted
   */
  public playRepSuccessTone() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore audio playback errors
    }
  }

  /**
   * Play warning blip when form error is detected
   */
  public playFormWarningTone() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore audio playback errors
    }
  }

  /**
   * Play fanfare chord for completing a full workout set
   */
  public playWorkoutCompleteChime() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.audioCtx.currentTime;

    chords.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  private currentLang: string = 'pl';

  public setLanguage(lang: 'pl' | 'en') {
    this.currentLang = lang;
  }

  /**
   * Speak coaching instructions aloud using Web Speech API in chosen language
   */
  public speak(text: string, force: boolean = false) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    if (!force && now - this.lastSpokenTime < this.minIntervalBetweenSpeechMs) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Avoid queued backlog
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = this.currentLang === 'pl' ? 'pl-PL' : 'en-US';

      // Pick voice matching language
      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = this.currentLang === 'pl' ? 'pl' : 'en';
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLangPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
      this.lastSpokenTime = now;
    } catch {
      // Speech synthesis unsupported or suppressed
    }
  }
}

export const audioCoach = new AudioCoachService();
