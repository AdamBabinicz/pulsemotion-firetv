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
}

/**
 * Standardowe kody klawiszy Fire TV Silk Browser & WebView
 */
export const TV_KEY_MAP = {
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

  // Klawisze multimedialne pilota Fire TV
  MediaPlayPause: TvActionKey.PLAY_PAUSE,
  MediaPlay: TvActionKey.PLAY_PAUSE,
  MediaPause: TvActionKey.PLAY_PAUSE,
} as const;

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
