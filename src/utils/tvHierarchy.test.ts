import { describe, it } from "node:test";
import assert from "node:assert";
import {
  BackAction,
  BackContext,
  isNativelyActivated,
  resolveBackHierarchy,
  shouldProgrammaticClick,
  TV_KEYCODE_MAP,
} from "./tvNavigation";

/**
 * Regresyjne testy hierarchii Back i rozłączności aktywacji Select.
 * Kolejność Back zgodna z wytycznymi Amazon Fire TV:
 * Modals → Summary → Fullscreen → Active Workout → Pause → System
 */

const base: BackContext = {
  isAnyModalOpen: false,
  isSummaryOpen: false,
  isFullscreen: false,
  isWorkoutRunning: false,
  isPaused: false,
};

describe("tvHierarchy - hierarchia Back (Fire TV guidelines)", () => {
  it("1. otwarte modale mają najwyższy priorytet — zamykają się przed podsumowaniem", () => {
    const action = resolveBackHierarchy({
      ...base,
      isAnyModalOpen: true,
      isSummaryOpen: true,
      isFullscreen: true,
      isWorkoutRunning: true,
    });
    assert.strictEqual(action, BackAction.DISMISS_MODALS);
  });

  it("2. podsumowanie treningu zamyka się przed wyjściem z pełnego ekranu", () => {
    const action = resolveBackHierarchy({
      ...base,
      isSummaryOpen: true,
      isFullscreen: true,
      isWorkoutRunning: true,
    });
    assert.strictEqual(action, BackAction.CLOSE_SUMMARY);
  });

  it("3. pełny ekran jest opuszczany przed pauzą treningu", () => {
    const action = resolveBackHierarchy({
      ...base,
      isFullscreen: true,
      isWorkoutRunning: true,
    });
    assert.strictEqual(action, BackAction.EXIT_FULLSCREEN);
  });

  it("4. aktywny trening najpierw przechodzi w pauzę, nie do systemu", () => {
    const action = resolveBackHierarchy({
      ...base,
      isWorkoutRunning: true,
      isPaused: false,
    });
    assert.strictEqual(action, BackAction.PAUSE_WORKOUT);
  });

  it("5. w pauzie na poziomie głównym Back przechodzi do systemu (launcher)", () => {
    const action = resolveBackHierarchy({
      ...base,
      isWorkoutRunning: true,
      isPaused: true,
    });
    assert.strictEqual(action, BackAction.PASS_TO_SYSTEM);
  });

  it("6. drabinka pełnej sesji zachowuje kolejność wszystkich poziomów", () => {
    // Symulacja pełnej sesji: każdy krok Back zdejmuje dokładnie jeden poziom
    const ladder: BackAction[] = [];
    let ctx: BackContext = {
      isAnyModalOpen: true,
      isSummaryOpen: true,
      isFullscreen: true,
      isWorkoutRunning: true,
      isPaused: false,
    };
    for (let i = 0; i < 5; i++) {
      const action = resolveBackHierarchy(ctx);
      ladder.push(action);
      if (action === BackAction.DISMISS_MODALS) ctx = { ...ctx, isAnyModalOpen: false };
      else if (action === BackAction.CLOSE_SUMMARY) ctx = { ...ctx, isSummaryOpen: false };
      else if (action === BackAction.EXIT_FULLSCREEN) ctx = { ...ctx, isFullscreen: false };
      else if (action === BackAction.PAUSE_WORKOUT) ctx = { ...ctx, isPaused: true };
    }
    assert.deepStrictEqual(ladder, [
      BackAction.DISMISS_MODALS,
      BackAction.CLOSE_SUMMARY,
      BackAction.EXIT_FULLSCREEN,
      BackAction.PAUSE_WORKOUT,
      BackAction.PASS_TO_SYSTEM,
    ]);
  });
});

describe("tvHierarchy - rozłączność ścieżek aktywacji Select", () => {
  // Test guarantees exactly one activation path for every focusable element:
  // native && programmatic nigdy nie jest prawdą jednocześnie → brak podwójnego click()
  const nativeFactory = (): Record<string, () => HTMLElement> => {
    if (typeof document === "undefined") {
      // Środowisko bez DOM (tsx --test): minimalne atrapy na bazie obiektów
      const fake = (tag: string, attrs: Record<string, string> = {}): HTMLElement =>
        ({
          tagName: tag.toUpperCase(),
          getAttribute: (k: string) => (k in attrs ? attrs[k] : null),
          hasAttribute: (k: string) => k in attrs,
        }) as unknown as HTMLElement;
      return {
        button: () => fake("button"),
        anchor: () => fake("a"),
        input: () => fake("input"),
        roleButton: () => fake("div", { role: "button" }),
        tvFocusable: () => fake("div", { "data-tv-focusable": "true" }),
      };
    }
    const mk = (tag: string, attrs: Record<string, string> = {}): HTMLElement => {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      return el;
    };
    return {
      button: () => mk("button"),
      anchor: () => mk("a", { href: "#" }),
      input: () => mk("input"),
      roleButton: () => mk("div", { role: "button" }),
      tvFocusable: () => mk("div", { "data-tv-focusable": "true" }),
    };
  };

  const cases: Array<[string, HTMLElement, boolean, boolean]> = [];
  {
    const f = nativeFactory();
    for (const [name, el] of Object.entries({
      button: f.button(),
      anchor: f.anchor(),
      input: f.input(),
    })) {
      // W środowisku bez DOM shouldProgrammaticClick czyta tylko atrybuty —
      // atrapy tagów natywnych muszą tu i tak trafić w ścieżkę native
      cases.push([name, el, true, false]);
    }
    cases.push(["role-button", f.roleButton(), false, true]);
    cases.push(["tv-focusable", f.tvFocusable(), false, true]);
  }

  for (const [name, el, expectNative, expectProgrammatic] of cases) {
    it(`element <${name}> ma dokładnie jedną ścieżkę aktywacji`, () => {
      const native = isNativelyActivated(el);
      const programmatic = shouldProgrammaticClick(el);
      assert.strictEqual(native, expectNative, `native path dla ${name}`);
      assert.strictEqual(programmatic, expectProgrammatic, `programmatic path dla ${name}`);
      // Nigdy oba naraz — to jest maszynowy wykrywacz podwójnego click() na Enter
      assert.ok(!(native && programmatic), `podwójna aktywacja dla ${name}!`);
      // I co najmniej jedna — element interaktywny nie może być martwy
      assert.ok(native || programmatic, `martwy element ${name} — zero ścieżek`);
    });
  }

  it("null i body nigdy nie aktywują niczego", () => {
    assert.strictEqual(isNativelyActivated(null), false);
    assert.strictEqual(shouldProgrammaticClick(null), false);
    if (typeof document !== "undefined") {
      assert.strictEqual(shouldProgrammaticClick(document.body), false);
    }
  });

  it("mapowanie pilota: kody Fire TV 85/179, 126, 127/86, 89/90, 227/228 są zgodne z README", () => {
    // Play/Pause
    assert.strictEqual(TV_KEYCODE_MAP[85], "PLAY_PAUSE");
    assert.strictEqual(TV_KEYCODE_MAP[179], "PLAY_PAUSE");
    // Play
    assert.strictEqual(TV_KEYCODE_MAP[126], "PLAY");
    // Pause / Stop
    assert.strictEqual(TV_KEYCODE_MAP[127], "PAUSE");
    assert.strictEqual(TV_KEYCODE_MAP[86], "PAUSE");
    // MEDIA_REWIND (89) i MEDIA_FAST_FORWARD (90): zmapowane na zmianę ćwiczenia
    // (TRACK_PREV / TRACK_NEXT) — decyzja semantyczna zgodna z konwencją
    // Media Session API na Fire TV (patrz README, tabela pilota)
    assert.strictEqual(TV_KEYCODE_MAP[89], "TRACK_PREV");
    assert.strictEqual(TV_KEYCODE_MAP[90], "TRACK_NEXT");
    // 227/228 (Fire TV track prev/next) — ta sama semantyka
    assert.strictEqual(TV_KEYCODE_MAP[227], "TRACK_PREV");
    assert.strictEqual(TV_KEYCODE_MAP[228], "TRACK_NEXT");
  });
});
