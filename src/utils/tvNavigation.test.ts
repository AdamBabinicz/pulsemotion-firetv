import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getTvActionFromEvent,
  getTvDirectionFromEvent,
  TvActionKey,
  TvDirection,
  TV_KEY_MAP,
  TV_KEYCODE_MAP,
} from "./tvNavigation";

describe("tvNavigation - TV Key & Code Mapping", () => {
  it("resolves D-pad directions from KeyboardEvent.key strings", () => {
    assert.strictEqual(
      getTvDirectionFromEvent({ key: "ArrowUp" } as KeyboardEvent),
      TvDirection.UP,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ key: "ArrowDown" } as KeyboardEvent),
      TvDirection.DOWN,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ key: "ArrowLeft" } as KeyboardEvent),
      TvDirection.LEFT,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ key: "ArrowRight" } as KeyboardEvent),
      TvDirection.RIGHT,
    );
  });

  it("resolves D-pad directions from Android/Fire TV numerical keyCodes", () => {
    // Standard web keyCodes
    assert.strictEqual(
      getTvDirectionFromEvent({ keyCode: 38 } as unknown as KeyboardEvent),
      TvDirection.UP,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ keyCode: 40 } as unknown as KeyboardEvent),
      TvDirection.DOWN,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ keyCode: 37 } as unknown as KeyboardEvent),
      TvDirection.LEFT,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ keyCode: 39 } as unknown as KeyboardEvent),
      TvDirection.RIGHT,
    );

    // Android KEYCODE_DPAD_*
    assert.strictEqual(
      getTvDirectionFromEvent({ keyCode: 19 } as unknown as KeyboardEvent),
      TvDirection.UP,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ keyCode: 20 } as unknown as KeyboardEvent),
      TvDirection.DOWN,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ keyCode: 21 } as unknown as KeyboardEvent),
      TvDirection.LEFT,
    );
    assert.strictEqual(
      getTvDirectionFromEvent({ keyCode: 22 } as unknown as KeyboardEvent),
      TvDirection.RIGHT,
    );
  });

  it("resolves Back actions correctly according to Amazon Fire TV Guidelines", () => {
    assert.strictEqual(
      getTvActionFromEvent({ key: "Escape" } as KeyboardEvent),
      TvActionKey.BACK,
    );
    assert.strictEqual(
      getTvActionFromEvent({ key: "Backspace" } as KeyboardEvent),
      TvActionKey.BACK,
    );
    assert.strictEqual(
      getTvActionFromEvent({ key: "BrowserBack" } as KeyboardEvent),
      TvActionKey.BACK,
    );
    assert.strictEqual(
      getTvActionFromEvent({ key: "GoBack" } as KeyboardEvent),
      TvActionKey.BACK,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 27 } as unknown as KeyboardEvent),
      TvActionKey.BACK,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 4 } as unknown as KeyboardEvent),
      TvActionKey.BACK,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 10009 } as unknown as KeyboardEvent),
      TvActionKey.BACK,
    );
  });

  it("resolves Android Media keys accurately (85 toggle, 126 play, 127 pause, 86 stop)", () => {
    // 179 (Fire TV Web) & 85 (Android KEYCODE_MEDIA_PLAY_PAUSE)
    assert.strictEqual(
      getTvActionFromEvent({ key: "MediaPlayPause" } as KeyboardEvent),
      TvActionKey.PLAY_PAUSE,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 179 } as unknown as KeyboardEvent),
      TvActionKey.PLAY_PAUSE,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 85 } as unknown as KeyboardEvent),
      TvActionKey.PLAY_PAUSE,
    );

    // 126 (Android KEYCODE_MEDIA_PLAY)
    assert.strictEqual(
      getTvActionFromEvent({ key: "MediaPlay" } as KeyboardEvent),
      TvActionKey.PLAY,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 126 } as unknown as KeyboardEvent),
      TvActionKey.PLAY,
    );

    // 127 (Android KEYCODE_MEDIA_PAUSE) & 86 (Android KEYCODE_MEDIA_STOP)
    assert.strictEqual(
      getTvActionFromEvent({ key: "MediaPause" } as KeyboardEvent),
      TvActionKey.PAUSE,
    );
    assert.strictEqual(
      getTvActionFromEvent({ key: "MediaStop" } as KeyboardEvent),
      TvActionKey.PAUSE,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 127 } as unknown as KeyboardEvent),
      TvActionKey.PAUSE,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 86 } as unknown as KeyboardEvent),
      TvActionKey.PAUSE,
    );
  });

  it("resolves Select action keys", () => {
    assert.strictEqual(
      getTvActionFromEvent({ key: "Enter" } as KeyboardEvent),
      TvActionKey.SELECT,
    );
    assert.strictEqual(
      getTvActionFromEvent({ key: " " } as KeyboardEvent),
      TvActionKey.SELECT,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 13 } as unknown as KeyboardEvent),
      TvActionKey.SELECT,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 66 } as unknown as KeyboardEvent),
      TvActionKey.SELECT,
    );
    assert.strictEqual(
      getTvActionFromEvent({ keyCode: 23 } as unknown as KeyboardEvent),
      TvActionKey.SELECT,
    );
  });

  it("verifies TV_KEY_MAP and TV_KEYCODE_MAP integrity", () => {
    assert.ok(Object.keys(TV_KEY_MAP).length > 10);
    assert.ok(Object.keys(TV_KEYCODE_MAP).length > 10);
  });
});
