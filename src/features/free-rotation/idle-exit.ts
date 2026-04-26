import { createEffect, onCleanup } from "solid-js";
import { exitRotate, rotateActive, rotateMode } from "./state";
import { pickerOpen } from "../schedule/picker";

/**
 * じゆうかいてん manual モードに入った後、IDLE_EXIT_MS ユーザー操作が
 * 無ければ exitRotate() で通常モードに戻す。
 *
 * Public API:
 *   - hook: useIdleExitTimer (ClockLayout 内で1回呼ぶ)
 *
 * 戻すのは「manual モード + 何もしてない」時のみ。以下では timer を停止して
 * 戻さない:
 *   - rotateActive === false (通常モード) → そもそも対象外
 *   - rotateMode === "auto" (じどうかいてん) → 動き続けてほしいので戻さない
 *   - pickerOpen === true (予定 picker 開いている) → 操作中扱いで戻さない
 *
 * 「操作」の検出は document の discrete + continuous な input event を広めに
 * watch する。pointermove / touchmove も含めるので、drag 中や mouse hover
 * 中に誤って idle 判定されることは無い。
 */

/** 何 ms 無操作で通常モードに戻すか */
const IDLE_EXIT_MS = 60_000;

/** 操作と見做す DOM event 一覧。capture phase で document に listen する。 */
const ACTIVITY_EVENTS = [
  "pointerdown",
  "pointermove",
  "wheel",
  "touchstart",
  "touchmove",
  "keydown",
] as const;

const LISTENER_OPTIONS: AddEventListenerOptions = { capture: true, passive: true };
const REMOVE_OPTIONS: EventListenerOptions = { capture: true };

export const useIdleExitTimer = () => {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const clearTimer = () => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
  };

  const armTimer = () => {
    clearTimer();
    timerId = setTimeout(() => {
      // fire 時に再 check (60 秒の間に状態が変わっている可能性がある)。
      // shouldRun と同じ条件で gate。
      if (rotateActive() && rotateMode() === "manual" && !pickerOpen()) {
        exitRotate();
      }
    }, IDLE_EXIT_MS);
  };

  const shouldRun = () =>
    rotateActive() && rotateMode() === "manual" && !pickerOpen();

  const onActivity = () => {
    if (shouldRun()) armTimer();
  };

  // 状態変化 (rotate モード切替 / picker 開閉) を見て自動 arm/clear。
  // mode=auto に切り替わった時 / picker 開いた時に timer が止まる。
  createEffect(() => {
    if (shouldRun()) {
      armTimer();
    } else {
      clearTimer();
    }
  });

  ACTIVITY_EVENTS.forEach((ev) =>
    document.addEventListener(ev, onActivity, LISTENER_OPTIONS),
  );

  onCleanup(() => {
    clearTimer();
    ACTIVITY_EVENTS.forEach((ev) =>
      document.removeEventListener(ev, onActivity, REMOVE_OPTIONS),
    );
  });
};
