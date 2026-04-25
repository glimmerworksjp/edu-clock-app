import { createEffect } from "solid-js";
import { pickerOpen } from "./schedule/picker";

/**
 * 時計画面 (時針 / 秒バー / 太陽月 / 自動回転 / 星 twinkle 等) を一時的に "凍結" する条件と
 * 副作用を集約するモジュール。
 *
 * なぜ凍結が必要か:
 *   SchedulePicker はオーバーレイで backdrop-filter: blur をかけている。blur の本当の重さは
 *   "下のピクセルが動くたびに再 blur する" コストであり、下が静止していればブラウザは
 *   blur 結果を compositing layer に cache して 1 回 paint で済む。
 *   ピッカー open 中に時計画面の動的要素を全て止めれば、古い iPad / 中華タブレット等の
 *   非力な端末でも blur を実用負荷で動かせる。
 *
 * 仕組み:
 *   - clockFrozen() accessor を tick 系 hook (setInterval / rAF) の `on()` 依存に取れば
 *     凍結中は副作用が止まる。解除時に再開、必要なら最新値にスナップさせる。
 *   - useClockFreezeBodyClass() は body に `.clock-frozen` class を付け外しする。
 *     CSS animation 系 (星の twinkle 等) は CSS セレクタ `body.clock-frozen ...` で
 *     animation-play-state: paused に上書き。
 *
 * 「分離できるものは常に分離する」原則: 各 tick hook はこの 1 つの accessor を読むだけで
 * 凍結条件を観測できる。条件を ピッカー以外でも凍結したくなった時はここの実装だけ広げれば良い。
 */

export const clockFrozen = (): boolean => pickerOpen();

/**
 * body に `.clock-frozen` class を付け外しする副作用を起動する。
 * App や ClockLayout など長命なコンポーネントの setup で 1 回呼ぶ。
 *
 * 純粋な class toggle 効果なので、機能を切る場合はこの呼び出し 1 行を消すだけで dormant になる
 * (CSS の body.clock-frozen ルールはセレクタが付かなくなって無効化される)。
 */
export const useClockFreezeBodyClass = (): void => {
  createEffect(() => {
    document.body.classList.toggle("clock-frozen", clockFrozen());
  });
};
