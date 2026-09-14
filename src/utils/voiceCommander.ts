import { Language } from '../data/translations';

// Voice Command Types
export type VoiceCommandAction =
  | 'next'
  | 'prev'
  | 'reset'
  | 'mute'
  | 'unmute'
  | 'start_demo'
  | 'stop_demo'
  | 'toggle_theme'
  | 'toggle_lang';

export interface VoiceCommandEvent {
  action: VoiceCommandAction;
  transcript: string;
  confidence: number;
}

// Web Speech API interface declarations
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

class VoiceCommander {
  private recognition: any = null;
  private isListening: boolean = false;
  private language: Language = 'pl';
  private onCommandCallback: ((event: VoiceCommandEvent) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private shouldRestart: boolean = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const win = (typeof window !== 'undefined' ? window : {}) as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('Web Speech Recognition API not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;
      this.recognition.lang = this.language === 'pl' ? 'pl-PL' : 'en-US';

      this.recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const result = event.results[lastResultIndex];
        if (!result || !result.isFinal) return;

        const transcript = result[0].transcript.trim().toLowerCase();
        const confidence = result[0].confidence || 1.0;
        this.parseCommand(transcript, confidence);
      };

      this.recognition.onerror = (event: any) => {
        // 'no-speech' is common and not a fatal error
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition status:', event.error);
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
        }
      };

      this.recognition.onend = () => {
        if (this.isListening && this.shouldRestart) {
          try {
            this.recognition?.start();
          } catch {
            // Already started or suspended
          }
        } else {
          this.isListening = false;
        }
      };
    } catch (e) {
      console.warn('Speech recognition setup failed:', e);
    }
  }

  public setLanguage(lang: Language) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang === 'pl' ? 'pl-PL' : 'en-US';
      if (this.isListening) {
        // Restart with new language
        try {
          this.recognition.stop();
        } catch {}
      }
    }
  }

  public start(onCommand: (event: VoiceCommandEvent) => void, onError?: (err: string) => void) {
    this.onCommandCallback = onCommand;
    if (onError) this.onErrorCallback = onError;

    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) return;
    }

    this.shouldRestart = true;
    try {
      this.recognition.start();
      this.isListening = true;
    } catch {
      // If already started, maintain state
      this.isListening = true;
    }
  }

  public stop() {
    this.shouldRestart = false;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  private parseCommand(text: string, confidence: number) {
    let action: VoiceCommandAction | null = null;
    const clean = text.toLowerCase().trim();

    if (this.language === 'pl') {
      // Polish voice commands
      if (clean.includes('następn') || clean.includes('dalej') || clean.includes('kolejn') || clean.includes('następne ćwiczenie')) {
        action = 'next';
      } else if (clean.includes('poprzedni') || clean.includes('wstecz') || clean.includes('cofnij')) {
        action = 'prev';
      } else if (clean.includes('reset') || clean.includes('od nowa') || clean.includes('powtórz') || clean.includes('zacznij od nowa')) {
        action = 'reset';
      } else if (clean.includes('wycisz') || clean.includes('cisza') || clean.includes('bez dźwięku')) {
        action = 'mute';
      } else if (clean.includes('włącz dźwięk') || clean.includes('głos') || clean.includes('odcisz')) {
        action = 'unmute';
      } else if (clean.includes('symulacj') || clean.includes('test') || clean.includes('włącz symulator')) {
        action = 'start_demo';
      } else if (clean.includes('motyw') || clean.includes('ciemny') || clean.includes('jasny')) {
        action = 'toggle_theme';
      } else if (clean.includes('angielski') || clean.includes('język') || clean.includes('english')) {
        action = 'toggle_lang';
      }
    } else {
      // English voice commands
      if (clean.includes('next') || clean.includes('forward') || clean.includes('skip')) {
        action = 'next';
      } else if (clean.includes('prev') || clean.includes('previous') || clean.includes('back')) {
        action = 'prev';
      } else if (clean.includes('reset') || clean.includes('restart') || clean.includes('repeat')) {
        action = 'reset';
      } else if (clean.includes('mute') || clean.includes('quiet') || clean.includes('silence')) {
        action = 'mute';
      } else if (clean.includes('unmute') || clean.includes('sound on') || clean.includes('voice on')) {
        action = 'unmute';
      } else if (clean.includes('simulator') || clean.includes('demo')) {
        action = 'start_demo';
      } else if (clean.includes('theme') || clean.includes('dark') || clean.includes('light')) {
        action = 'toggle_theme';
      } else if (clean.includes('polish') || clean.includes('language')) {
        action = 'toggle_lang';
      }
    }

    if (action && this.onCommandCallback) {
      this.onCommandCallback({
        action,
        transcript: clean,
        confidence,
      });
    }
  }
}

export const voiceCommander = new VoiceCommander();
