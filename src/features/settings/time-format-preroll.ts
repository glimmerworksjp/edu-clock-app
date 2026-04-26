import { createEffect, createRoot, createSignal, on } from "solid-js";
import { timeFormat } from "./time-format";

/**
 * 12h ⇄ 24h トグル時の preroll の timing.
 *
 * 構成 (時間順):
 *   1. PULSE × 2 — てっぺんの 12 が黄金色に「ピコンッピコンッ」と 2 回光る (fill の色変化のみ).
 *   2. SHOCKWAVE — 12 を震源に細いリング 1 本が外へ広がって消える (manga 風の 1 ドンッ).
 *   3. SETTLE    — 静止 (余韻).
 *   …続いて time-format-animation.ts の stagger が始まる.
 *
 * 旧設計の反省:
 *   - duplicate overlay 12 / scale pulse は元の 12 と二重になって違和感が出た → 実 12 の fill を直接アニメ.
 *   - "+12" を 12 の位置にポップさせるのは意味的に誤り (12 自体は値不変) → 削除.
 *   - blur / drop-shadow / 集中線 / sparkle は重く装飾過多 → 単一 stroke リングだけに削ぎ落とす.
 *
 * Public API:
 *   - prerollKey():    各 toggle で +1 されるカウンタ.
 *   - PULSE_MS / SHOCKWAVE_MS / SETTLE_MS: 各 phase の duration.
 *   - TIME_FORMAT_PREROLL_MS: 全 phase の合計. time-format-animation.ts はこの分 stagger を遅延.
 */

export const PULSE_MS = 440;
export const SHOCKWAVE_MS = 320;
export const SETTLE_MS = 180;
export const TIME_FORMAT_PREROLL_MS = PULSE_MS * 2 + SHOCKWAVE_MS + SETTLE_MS;

const [prerollKey, setPrerollKey] = createSignal(0);

createRoot(() => {
  createEffect(on(timeFormat, () => {
    setPrerollKey((k) => k + 1);
  }, { defer: true }));
});

export { prerollKey };
