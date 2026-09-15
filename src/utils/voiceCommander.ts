import { Language } from "../data/translations";

// Voice Command Types — rozszerzone o wyłączenie mikrofonu głosem
export type VoiceCommandAction =
  | "next"
  | "prev"
  | "reset"
  | "mute"
  | "unmute"
  | "start_demo"
  | "stop_demo"
  | "toggle_theme"
  | "toggle_lang"
  | "start"
  | "pause"
  | "toggle_camera"
  | "close_modal"
  | "repeat_set"
  | "stop_listening"
  | "exercise_squats"
  | "exercise_jumping_jacks"
  | "exercise_high_knees"
  | "exercise_tree_pose"
  | "exercise_arm_raises";

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
  private language: Language = "pl";
  private onCommandCallback: ((event: VoiceCommandEvent) => void) | null = null;
  private onTranscriptCallback:
    | ((transcript: string, isFinal: boolean) => void)
    | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStatusChangeCallback: ((isListening: boolean) => void) | null =
    null;
  private shouldRestart: boolean = false;
  private restartTimeout: any = null;
  private lastTriggeredAction: VoiceCommandAction | null = null;
  private lastTriggeredTime: number = 0;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const win = (typeof window !== "undefined" ? window : {}) as IWindow;
    const SpeechRecognitionClass =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn(
        "Web Speech Recognition API is not supported in this browser.",
      );
      return;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 5;
      this.recognition.lang = this.language === "pl" ? "pl-PL" : "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback(true);
        }
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscriptChunk = "";
        let interimTranscriptChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const isFinal = result.isFinal;

          for (let j = 0; j < result.length; j++) {
            const alternative = result[j];
            const transcript = (alternative?.transcript || "").trim();
            const confidence = alternative?.confidence || 0.9;

            if (isFinal) {
              finalTranscriptChunk += transcript + " ";
            } else {
              interimTranscriptChunk += transcript + " ";
            }

            if (this.parseCommand(transcript, confidence)) {
              break;
            }
          }
        }

        const fullDisplayTranscript = (
          finalTranscriptChunk || interimTranscriptChunk
        ).trim();
        if (fullDisplayTranscript && this.onTranscriptCallback) {
          this.onTranscriptCallback(
            fullDisplayTranscript,
            Boolean(finalTranscriptChunk),
          );
        }
      };

      this.recognition.onerror = (event: any) => {
        const err = event?.error;
        if (err === "no-speech" || err === "aborted") {
          return;
        }

        console.warn("Speech recognition error:", err);

        if (err === "not-allowed" || err === "service-not-allowed") {
          this.shouldRestart = false;
          this.isListening = false;
          if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(false);
          }
        }

        if (this.onErrorCallback) {
          this.onErrorCallback(err || "speech_error");
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback(false);
        }

        if (this.shouldRestart) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldRestart && this.recognition) {
              try {
                this.recognition.start();
                this.isListening = true;
                if (this.onStatusChangeCallback) {
                  this.onStatusChangeCallback(true);
                }
              } catch (e) {
                console.debug("Recognition restart handled:", e);
              }
            }
          }, 300);
        }
      };
    } catch (e) {
      console.warn("Speech recognition setup failed:", e);
    }
  }

  public setLanguage(lang: Language) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang === "pl" ? "pl-PL" : "en-US";
      if (this.isListening) {
        try {
          this.recognition.stop();
        } catch {}
      }
    }
  }

  public start(
    onCommand: (event: VoiceCommandEvent) => void,
    onError?: (err: string) => void,
    onTranscript?: (transcript: string, isFinal: boolean) => void,
    onStatusChange?: (isListening: boolean) => void,
  ) {
    this.onCommandCallback = onCommand;
    if (onError) this.onErrorCallback = onError;
    if (onTranscript) this.onTranscriptCallback = onTranscript;
    if (onStatusChange) this.onStatusChangeCallback = onStatusChange;

    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        if (this.onErrorCallback) {
          this.onErrorCallback("not_supported");
        }
        return;
      }
    }

    this.shouldRestart = true;
    try {
      this.recognition.start();
      this.isListening = true;
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback(true);
      }
    } catch {
      this.isListening = true;
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback(true);
      }
    }
  }

  public stop() {
    this.shouldRestart = false;
    this.isListening = false;
    clearTimeout(this.restartTimeout);
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(false);
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  private isExerciseAction(action: VoiceCommandAction): boolean {
    return action.startsWith("exercise_");
  }

  private parseCommand(text: string, confidence: number): boolean {
    const clean = text.toLowerCase().trim();
    if (!clean) return false;

    let action: VoiceCommandAction | null = null;

    if (this.language === "pl") {
      // 1. WYŁĄCZENIE ODSŁUCHU GŁOSEM
      if (
        clean.includes("wyłącz mikrofon") ||
        clean.includes("wyłącz odsłuch") ||
        clean.includes("przestań słuchać") ||
        clean.includes("koniec odsłuchu") ||
        clean.includes("nie słuchaj") ||
        clean.includes("wyłącz nasłuch") ||
        clean.includes("stop odsłuch")
      ) {
        action = "stop_listening";
      }

      // 2. ZAMYKANIE MODALA / POWRÓT DO PODGLĄDU ĆWICZENIA
      else if (
        clean.includes("zamknij") ||
        clean.includes("zamknij okno") ||
        clean.includes("zamknij modal") ||
        clean.includes("wróć") ||
        clean.includes("powrót") ||
        clean.includes("podgląd") ||
        clean.includes("anuluj") ||
        clean.includes("ukryj") ||
        clean.includes("wyjdź")
      ) {
        action = "close_modal";
      }

      // 3. POWTÓRZENIE SERII
      else if (
        clean.includes("powtórz serię") ||
        clean.includes("jeszcze raz") ||
        clean.includes("ponów") ||
        clean.includes("powtórka")
      ) {
        action = "repeat_set";
      }

      // 4. NAJWYŻSZY PRIORYTET DLA ĆWICZEŃ: Bezpośrednie nazwy ćwiczeń
      else if (
        clean.includes("pajacyk") ||
        clean.includes("pajace") ||
        clean.includes("jumping")
      ) {
        action = "exercise_jumping_jacks";
      } else if (
        clean.includes("przysiad") ||
        clean.includes("siadowe") ||
        clean.includes("squat")
      ) {
        action = "exercise_squats";
      } else if (
        clean.includes("kolan") ||
        clean.includes("bieg") ||
        clean.includes("wysokie")
      ) {
        action = "exercise_high_knees";
      } else if (
        clean.includes("drzewo") ||
        clean.includes("drzewa") ||
        clean.includes("joga") ||
        clean.includes("balans") ||
        clean.includes("równowag")
      ) {
        action = "exercise_tree_pose";
      } else if (
        clean.includes("wznos") ||
        clean.includes("ramion") ||
        clean.includes("barki") ||
        clean.includes("ręce w bok")
      ) {
        action = "exercise_arm_raises";
      }

      // 5. NAWIGACJA
      else if (
        clean.includes("następn") ||
        clean.includes("dalej") ||
        clean.includes("kolejn") ||
        clean.includes("przewiń w prawo")
      ) {
        action = "next";
      } else if (
        clean.includes("poprzedni") ||
        clean.includes("wstecz") ||
        clean.includes("cofnij") ||
        clean.includes("przewiń w lewo")
      ) {
        action = "prev";
      }

      // 6. SYMULATOR (elastyczne rozpoznawanie odmian)
      else if (
        clean.includes("wyłącz symulator") ||
        clean.includes("zatrzymaj symulator") ||
        clean.includes("zatrzymaj symulację") ||
        clean.includes("stop demo")
      ) {
        action = "stop_demo";
      } else if (
        clean.includes("symulacj") ||
        clean.includes("symulator") ||
        clean.includes("włącz symulator") ||
        clean.includes("odpal symulator") ||
        clean.includes("tryb demo") ||
        clean.includes("demo")
      ) {
        action = "start_demo";
      }

      // 7. RESET I DŹWIĘK
      else if (
        clean.includes("reset") ||
        clean.includes("od nowa") ||
        clean.includes("powtórz") ||
        clean.includes("wyzeruj") ||
        clean.includes("zacznij od nowa")
      ) {
        action = "reset";
      } else if (
        clean.includes("wycisz") ||
        clean.includes("cisza") ||
        clean.includes("bez głosu") ||
        clean.includes("wyłącz dźwięk")
      ) {
        action = "mute";
      } else if (
        clean.includes("włącz dźwięk") ||
        clean.includes("włącz głos") ||
        clean.includes("odcisz") ||
        clean.includes("dźwięk")
      ) {
        action = "unmute";
      }

      // 8. MOTYW I JĘZYK
      else if (
        clean.includes("motyw") ||
        clean.includes("ciemny") ||
        clean.includes("jasny") ||
        clean.includes("zmień motyw")
      ) {
        action = "toggle_theme";
      } else if (
        clean.includes("angielski") ||
        clean.includes("język") ||
        clean.includes("zmień język") ||
        clean.includes("english") ||
        clean.includes("polski")
      ) {
        action = "toggle_lang";
      }

      // 9. KAMERA
      else if (
        clean.includes("kamera") ||
        clean.includes("wyłącz kamerę") ||
        clean.includes("włącz kamerę")
      ) {
        action = "toggle_camera";
      }

      // 10. OGÓLNY START / PAUZA
      else if (
        clean.includes("start") ||
        clean.includes("rozpocznij") ||
        clean.includes("zaczynaj") ||
        clean.includes("ćwiczymy") ||
        clean.includes("jedziemy") ||
        clean.includes("wznów")
      ) {
        action = "start";
      } else if (
        clean.includes("pauza") ||
        clean.includes("stop") ||
        clean.includes("zatrzymaj") ||
        clean.includes("przerwa") ||
        clean.includes("czekaj")
      ) {
        action = "pause";
      }
    } else {
      // JĘZYK ANGIELSKI
      if (
        clean.includes("stop listening") ||
        clean.includes("disable voice") ||
        clean.includes("turn off microphone") ||
        clean.includes("mute mic")
      ) {
        action = "stop_listening";
      } else if (
        clean.includes("close") ||
        clean.includes("dismiss") ||
        clean.includes("exit") ||
        clean.includes("back")
      ) {
        action = "close_modal";
      } else if (
        clean.includes("repeat set") ||
        clean.includes("again") ||
        clean.includes("one more time")
      ) {
        action = "repeat_set";
      } else if (clean.includes("jack") || clean.includes("jumping")) {
        action = "exercise_jumping_jacks";
      } else if (clean.includes("squat")) {
        action = "exercise_squats";
      } else if (clean.includes("knee") || clean.includes("high knee")) {
        action = "exercise_high_knees";
      } else if (
        clean.includes("tree") ||
        clean.includes("yoga") ||
        clean.includes("balance")
      ) {
        action = "exercise_tree_pose";
      } else if (
        clean.includes("arm") ||
        clean.includes("raise") ||
        clean.includes("lateral")
      ) {
        action = "exercise_arm_raises";
      } else if (
        clean.includes("next") ||
        clean.includes("forward") ||
        clean.includes("skip")
      ) {
        action = "next";
      } else if (clean.includes("prev") || clean.includes("previous")) {
        action = "prev";
      } else if (
        clean.includes("stop demo") ||
        clean.includes("stop simulator")
      ) {
        action = "stop_demo";
      } else if (
        clean.includes("start simulator") ||
        clean.includes("simulator") ||
        clean.includes("demo")
      ) {
        action = "start_demo";
      } else if (
        clean.includes("reset") ||
        clean.includes("restart") ||
        clean.includes("start over")
      ) {
        action = "reset";
      } else if (
        clean.includes("mute") ||
        clean.includes("quiet") ||
        clean.includes("silence") ||
        clean.includes("sound off")
      ) {
        action = "mute";
      } else if (
        clean.includes("unmute") ||
        clean.includes("sound on") ||
        clean.includes("voice on")
      ) {
        action = "unmute";
      } else if (
        clean.includes("theme") ||
        clean.includes("dark mode") ||
        clean.includes("light mode")
      ) {
        action = "toggle_theme";
      } else if (
        clean.includes("polish") ||
        clean.includes("language") ||
        clean.includes("switch language")
      ) {
        action = "toggle_lang";
      } else if (
        clean.includes("start workout") ||
        clean.includes("start") ||
        clean.includes("resume") ||
        clean.includes("begin")
      ) {
        action = "start";
      } else if (
        clean.includes("pause") ||
        clean.includes("stop") ||
        clean.includes("hold")
      ) {
        action = "pause";
      } else if (clean.includes("camera") || clean.includes("toggle camera")) {
        action = "toggle_camera";
      }
    }

    if (action) {
      const now = Date.now();
      const minInterval = this.isExerciseAction(action)
        ? 3500
        : this.lastTriggeredAction === action
          ? 1800
          : 850;

      if (
        this.lastTriggeredAction === action &&
        now - this.lastTriggeredTime < minInterval
      ) {
        return false;
      }

      this.lastTriggeredAction = action;
      this.lastTriggeredTime = now;

      console.info(
        `[VoiceCommander] Recognized command "${action}" from: "${clean}"`,
      );

      if (this.onCommandCallback) {
        this.onCommandCallback({
          action,
          transcript: clean,
          confidence,
        });
      }
      return true;
    }

    return false;
  }
}

export const voiceCommander = new VoiceCommander();
