import { createEffect, on, onCleanup, type Accessor } from "solid-js";
import { rotateMinutes, seekRotate } from "./state";

/**
 * 回転モードで動きが止まった瞬間に rotateMinutes の小数部を「視覚的に逆回転させずに」整数分へ
 * 収束させる設計。
 *
 * - frac < 0.5: float のまま表示。ceil すると 0.5 分以上の前ジャンプで違和感、floor は逆回転で
 *   NG (UI 都合の視覚逆回転は思想上禁止) なので、整数化を諦めて float 位置で針を残す。
 * - 0.5 ≤ frac < 0.85: 表示は ceil(整数)、internal は float のまま。視覚 jump (0.15〜0.5 分) を
 *   ビィィーンッ motion で演出。FLOAT_RETENTION_MS 経過後に internal も ceil に commit。
 * - frac ≥ 0.85: 即時 commit (ceil)。視覚 jump < 0.15 分でほぼ知覚されないので motion 不要。
 *
 * idle→moving 遷移 (drag 再開 / autoRotate 開始) では pending commit を即時 flush する。
 * これが無いと「ceil 表示 32 → moving 中の float 表示 31.7」で 0.3 分の逆回転が視覚に出る。
 */

const SNAP_THRESHOLD = 0.5;
const COMMIT_THRESHOLD = 0.85;
const FLOAT_RETENTION_MS = 8000;

/** 表示用 minutes。showFloat=true は drag / autoRotate 中で snap 抑制したい時に渡す。 */
export const computeVisibleMinutes = (m: number, showFloat: boolean): number => {
  if (showFloat) return m;
  const frac = m - Math.floor(m);
  return frac < SNAP_THRESHOLD ? m : Math.ceil(m);
};

export interface UseReleaseSnapOptions {
  /** rotateMinutes が連続的に動いてる状態 (drag / autoRotate)。falsy 遷移で snap 発動。 */
  moving: Accessor<boolean>;
  /** 0.5 ≤ frac < 0.85 の snap で発火。HandsLayer の minuteTickKey を increment する想定。 */
  fireMotion: () => void;
}

export const useReleaseSnap = (opts: UseReleaseSnapOptions) => {
  let commitTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelCommit = () => {
    if (commitTimer !== null) {
      clearTimeout(commitTimer);
      commitTimer = null;
    }
  };

  /** 視覚 ceil 状態と internal float の不一致を解消。drag 開始 / autoRotate 開始の頭で呼ぶ。
   *  timer が走ってない (= 既に整合済) 時は no-op。 */
  const flushPendingCommit = () => {
    if (commitTimer === null) return;
    cancelCommit();
    seekRotate(Math.ceil(rotateMinutes()));
  };

  createEffect(on(opts.moving, (curr, prev) => {
    if (prev === undefined) return;
    if (curr === prev) return;
    if (curr) {
      flushPendingCommit();
      return;
    }
    const m = rotateMinutes();
    const frac = m - Math.floor(m);
    if (frac < SNAP_THRESHOLD) return;
    if (frac >= COMMIT_THRESHOLD) {
      seekRotate(Math.ceil(m));
      return;
    }
    opts.fireMotion();
    cancelCommit();
    commitTimer = setTimeout(() => {
      commitTimer = null;
      seekRotate(Math.ceil(rotateMinutes()));
    }, FLOAT_RETENTION_MS);
  }));

  onCleanup(cancelCommit);

  return { flushPendingCommit };
};
