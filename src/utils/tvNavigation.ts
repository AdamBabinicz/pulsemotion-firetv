/**
 * PulseMotion Fire TV - Spatial Navigation Engine & D-Pad Focus Manager
 * Implementuje nawigację 10-foot UI dla pilota Amazon Fire TV / Android TV
 */

export enum TvDirection {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum TvActionKey {
  SELECT = "SELECT",
  BACK = "BACK",
  PLAY_PAUSE = "PLAY_PAUSE",
  PLAY = "PLAY",
  PAUSE = "PAUSE",
}

/**
 * Standardowe mapowanie nazw klawiszy (KeyboardEvent.key) na kierunki i akcje Fire TV
 */
export const TV_KEY_MAP: Record<string, TvDirection | TvActionKey> = {
  // Kierunki D-pad
  ArrowUp: TvDirection.UP,
  Up: TvDirection.UP,
  ArrowDown: TvDirection.DOWN,
  Down: TvDirection.DOWN,
  ArrowLeft: TvDirection.LEFT,
  Left: TvDirection.LEFT,
  ArrowRight: TvDirection.RIGHT,
  Right: TvDirection.RIGHT,

  // Akcja wyboru / Center D-pad
  Enter: TvActionKey.SELECT,
  " ": TvActionKey.SELECT,

  // Przycisk powrotu (Back)
  Escape: TvActionKey.BACK,
  Esc: TvActionKey.BACK,
  Backspace: TvActionKey.BACK,
  BrowserBack: TvActionKey.BACK,
  GoBack: TvActionKey.BACK,

  // Klawisze multimedialne pilota Fire TV / Android
  MediaPlayPause: TvActionKey.PLAY_PAUSE,
  MediaPlay: TvActionKey.PLAY,
  MediaPause: TvActionKey.PAUSE,
  MediaStop: TvActionKey.PAUSE,
} as const;

/**
 * Numeryczne kody klawiszy (KeyboardEvent.keyCode / Android KeyEvent) dla Fire TV / WebView
 */
export const TV_KEYCODE_MAP: Record<number, TvDirection | TvActionKey> = {
  // D-pad
  38: TvDirection.UP, // ArrowUp
  19: TvDirection.UP, // Android KEYCODE_DPAD_UP
  40: TvDirection.DOWN, // ArrowDown
  20: TvDirection.DOWN, // Android KEYCODE_DPAD_DOWN
  37: TvDirection.LEFT, // ArrowLeft
  21: TvDirection.LEFT, // Android KEYCODE_DPAD_LEFT
  39: TvDirection.RIGHT, // ArrowRight
  22: TvDirection.RIGHT, // Android KEYCODE_DPAD_RIGHT

  // Select / Center
  13: TvActionKey.SELECT, // Enter
  66: TvActionKey.SELECT, // Android KEYCODE_ENTER
  23: TvActionKey.SELECT, // Android KEYCODE_DPAD_CENTER

  // Back
  27: TvActionKey.BACK, // Escape
  4: TvActionKey.BACK, // Android KEYCODE_BACK
  10009: TvActionKey.BACK, // Smart TV Return

  // Media
  179: TvActionKey.PLAY_PAUSE, // Fire TV Play/Pause
  85: TvActionKey.PLAY_PAUSE, // Android KEYCODE_MEDIA_PLAY_PAUSE
  126: TvActionKey.PLAY, // Android KEYCODE_MEDIA_PLAY
  127: TvActionKey.PAUSE, // Android KEYCODE_MEDIA_PAUSE
  86: TvActionKey.PAUSE, // Android KEYCODE_MEDIA_STOP
} as const;

/**
 * Pobiera kierunek nawigacji przestrzennej ze zdarzenia klawiatury pilota
 */
export function getTvDirectionFromEvent(e: KeyboardEvent): TvDirection | null {
  const byKey = TV_KEY_MAP[e.key];
  if (byKey && Object.values(TvDirection).includes(byKey as TvDirection)) {
    return byKey as TvDirection;
  }
  const keyCode = (e as any).keyCode as number | undefined;
  if (keyCode !== undefined) {
    const byCode = TV_KEYCODE_MAP[keyCode];
    if (byCode && Object.values(TvDirection).includes(byCode as TvDirection)) {
      return byCode as TvDirection;
    }
  }
  return null;
}

/**
 * Pobiera akcję pilota ze zdarzenia klawiatury (Back, Select, Play, Pause, Play/Pause)
 */
export function getTvActionFromEvent(e: KeyboardEvent): TvActionKey | null {
  const byKey = TV_KEY_MAP[e.key];
  if (byKey && Object.values(TvActionKey).includes(byKey as TvActionKey)) {
    return byKey as TvActionKey;
  }
  const keyCode = (e as any).keyCode as number | undefined;
  if (keyCode !== undefined) {
    const byCode = TV_KEYCODE_MAP[keyCode];
    if (byCode && Object.values(TvActionKey).includes(byCode as TvActionKey)) {
      return byCode as TvActionKey;
    }
  }
  return null;
}

/**
 * Selector elementów interaktywnych kwalifikujących się do fokusu na TV
 */
export const TV_FOCUSABLE_SELECTOR =
  'button:not([disabled]):not([aria-hidden="true"]), ' +
  'a[href]:not([tabindex="-1"]):not([aria-hidden="true"]), ' +
  'input:not([disabled]):not([type="hidden"]), ' +
  "select:not([disabled]), " +
  "textarea:not([disabled]), " +
  '[tabindex]:not([tabindex="-1"]):not([disabled]), ' +
  '[data-tv-focusable="true"]:not([disabled])';

/**
 * Bezpieczne pobranie wszystkich widocznych elementów interaktywnych
 */
export function getFocusableElements(
  container: HTMLElement | Document = document,
): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(TV_FOCUSABLE_SELECTOR),
  );
  return elements.filter((el) => {
    // Sprawdź czy element jest faktycznie widoczny na ekranie
    const style = window.getComputedStyle(el);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

/**
 * Algorytm nawigacji przestrzennej (Spatial Navigation)
 * Wyszukuje geometrycznie najbliższy element w zadanym kierunku D-pad
 */
export function findNextSpatialElement(
  currentElement: HTMLElement,
  direction: TvDirection,
  container: HTMLElement | Document = document,
): HTMLElement | null {
  const allFocusables = getFocusableElements(container).filter(
    (el) => el !== currentElement,
  );
  if (allFocusables.length === 0) return null;

  const currentRect = currentElement.getBoundingClientRect();
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2,
  };

  let bestCandidate: HTMLElement | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const candidate of allFocusables) {
    const candidateRect = candidate.getBoundingClientRect();
    const candidateCenter = {
      x: candidateRect.left + candidateRect.width / 2,
      y: candidateRect.top + candidateRect.height / 2,
    };

    const deltaX = candidateCenter.x - currentCenter.x;
    const deltaY = candidateCenter.y - currentCenter.y;

    // Filtr kątowy i kierunkowy (element musi leżeć w żądanym kierunku)
    let isCandidateInDirection = false;
    let primaryAxisDistance = 0;
    let secondaryAxisDistance = 0;

    switch (direction) {
      case TvDirection.UP:
        // Kandydat musi znajdować się powyżej (z małą tolerancją na zaokrąglenia)
        if (candidateRect.bottom <= currentRect.top + 4) {
          isCandidateInDirection = true;
          primaryAxisDistance = Math.abs(deltaY);
          secondaryAxisDistance = Math.abs(deltaX);
        }
        break;

      case TvDirection.DOWN:
        // Kandydat musi znajdować się poniżej
        if (candidateRect.top >= currentRect.bottom - 4) {
          isCandidateInDirection = true;
          primaryAxisDistance = Math.abs(deltaY);
          secondaryAxisDistance = Math.abs(deltaX);
        }
        break;

      case TvDirection.LEFT:
        // Kandydat musi znajdować się po lewej
        if (candidateRect.right <= currentRect.left + 4) {
          isCandidateInDirection = true;
          primaryAxisDistance = Math.abs(deltaX);
          secondaryAxisDistance = Math.abs(deltaY);
        }
        break;

      case TvDirection.RIGHT:
        // Kandydat musi znajdować się po prawej
        if (candidateRect.left >= currentRect.right - 4) {
          isCandidateInDirection = true;
          primaryAxisDistance = Math.abs(deltaX);
          secondaryAxisDistance = Math.abs(deltaY);
        }
        break;
    }

    if (!isCandidateInDirection) continue;

    // Ważona odległość euklidesowa: silniej preferujemy elementy leżące w linii prostej
    // Oś prostopadła jest mnożona przez współczynnik 2.2, aby unikać przypadkowych przeskoków po skosie
    const weightedDistance = primaryAxisDistance + secondaryAxisDistance * 2.2;

    if (weightedDistance < minDistance) {
      minDistance = weightedDistance;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

/**
 * Ustawia fokus na elemencie wraz z płynnym przewinięciem do środka widoku (10-Foot standard)
 */
export function setTvFocus(element: HTMLElement | null): boolean {
  if (!element) return false;

  document.querySelectorAll('[data-tv-focused="true"]').forEach((el) => {
    el.removeAttribute("data-tv-focused");
  });
  element.setAttribute("data-tv-focused", "true");

  element.focus({ preventScroll: true });
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });

  return true;
}

/**
 * Bezpieczne ustawienie fokusu na elemencie po identyfikatorze ID
 */
export function focusElementById(id: string): boolean {
  const el = document.getElementById(id);
  if (el) {
    return setTvFocus(el);
  }
  return false;
}

/**
 * Pułapka fokusu dla okien modalnych (Focus Trap)
 * Zapobiega wyjściu kursora pilota poza otwarte okno modalne
 */
export function handleModalFocusTrap(
  event: KeyboardEvent,
  modalContainer: HTMLElement | null,
): boolean {
  if (!modalContainer) return false;

  const focusables = getFocusableElements(modalContainer);
  if (focusables.length === 0) return false;

  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];
  const activeElement = document.activeElement as HTMLElement | null;

  // Jeśli fokus jest poza oknem modalnym, przenieś go na pierwszy element modalu
  if (!activeElement || !modalContainer.contains(activeElement)) {
    event.preventDefault();
    setTvFocus(firstFocusable);
    return true;
  }

  // Sprawdź czy naciśnięto klawisze nawigacji w modalu
  const isNext =
    (event.key === "Tab" && !event.shiftKey) ||
    event.key === "ArrowDown" ||
    event.key === "ArrowRight";
  const isPrev =
    (event.key === "Tab" && event.shiftKey) ||
    event.key === "ArrowUp" ||
    event.key === "ArrowLeft";

  if (isNext && activeElement === lastFocusable) {
    event.preventDefault();
    setTvFocus(firstFocusable);
    return true;
  }

  if (isPrev && activeElement === firstFocusable) {
    event.preventDefault();
    setTvFocus(lastFocusable);
    return true;
  }

  return false;
}

/**
 * Deklarowany przez kontekst aplikacji stan, który wpływa na hierarchię Back
 */
export interface BackContext {
  isAnyModalOpen: boolean;
  isSummaryOpen: boolean;
  isFullscreen: boolean;
  isWorkoutRunning: boolean;
  isPaused: boolean;
}

/**
 * Akcja wynikająca z naciśnięcia Back — zgodna z wytycznymi Fire TV:
 * Modals → Summary → Fullscreen → Active Workout → Pause → System
 */
export enum BackAction {
  DISMISS_MODALS = "DISMISS_MODALS",
  CLOSE_SUMMARY = "CLOSE_SUMMARY",
  EXIT_FULLSCREEN = "EXIT_FULLSCREEN",
  PAUSE_WORKOUT = "PAUSE_WORKOUT",
  PASS_TO_SYSTEM = "PASS_TO_SYSTEM",
}

/**
 * Czysta (bez DOM) rozdzielczość hierarchii Back do celów testowych.
 * Kolejność ma znaczenie i jest pilnowana testem regresyjnym.
 */
export function resolveBackHierarchy(ctx: BackContext): BackAction {
  if (ctx.isAnyModalOpen) return BackAction.DISMISS_MODALS;
  if (ctx.isSummaryOpen) return BackAction.CLOSE_SUMMARY;
  if (ctx.isFullscreen) return BackAction.EXIT_FULLSCREEN;
  if (ctx.isWorkoutRunning && !ctx.isPaused) return BackAction.PAUSE_WORKOUT;
  return BackAction.PASS_TO_SYSTEM;
}

/**
 * Element natywnie aktywowalny (button / a / input...) — Enter NIE woła click()
 * ani preventDefault(), bo oba mechanizmy mogłyby zadziałać razem → podwójna aktywacja.
 */
export function isNativelyActivated(element: HTMLElement | null): boolean {
  if (!element) return false;
  return (
    element.tagName === "BUTTON" ||
    element.tagName === "A" ||
    element.tagName === "INPUT" ||
    element.tagName === "SELECT" ||
    element.tagName === "TEXTAREA"
  );
}

/**
 * Element, który wymaga programistycznego click() przy Enter (role="button",
 * data-tv-focusable itd. — elementy bez natywnej obsługi Enter).
 */
export function shouldProgrammaticClick(element: HTMLElement | null): boolean {
  if (!element) return false;
  if (isNativelyActivated(element)) return false;

  // Klasyfikacja po atrybutach — działa też w środowisku bez DOM (node:test)
  const isRoleButton = element.getAttribute("role") === "button";
  const isTvFocusable = element.hasAttribute("data-tv-focusable");
  if (!isRoleButton && !isTvFocusable) return false;

  // document.body nigdy nie jest celem programistycznej aktywacji
  if (typeof document !== "undefined" && element === document.body) return false;

  return true;
}
