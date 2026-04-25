import { createSignal } from "solid-js";
import { deleteScheduleAt } from "./state";
import { motionAllowed } from "../../lib/motion";

/**
 * 予定アイコンの削除 UX 状態。
 *
 * モード遷移:
 *   none ──(長押し 500ms)──> warning ──(ゴミ箱タップ)──> deleting ──(アニメ完了)──> none
 *                                ├──(外タップ)─> none
 *                                └──(3秒タイムアウト)─> none
 *
 * 同時に warning にできるイベントは1つだけ (グローバル単一状態)。
 *
 * Public API:
 *   - accessor: interaction
 *   - action:   enterWarning, cancelWarning, triggerDelete
 *
 * 内部の生 setter (setInteractionRaw) と timer は意図的に export していない。
 */

type Interaction =
  | { type: "none" }
  | { type: "warning"; minutes: number }
  | { type: "deleting"; minutes: number };

const WARNING_AUTO_CANCEL_MS = 3000;
/** くるくる削除アニメの全体 duration と揃える (ScheduleLayer の POOF_DURATION_MS) */
const DELETE_ANIMATION_MS = 900;

// ===== Internal state =====
const [interaction, setInteractionRaw] = createSignal<Interaction>({ type: "none" });
let warningTimer: ReturnType<typeof setTimeout> | undefined;

// ===== Public accessor =====
export { interaction };

// ===== Public actions =====

/** 長押し検出時に呼ぶ。warning 状態に入って 3 秒の自動キャンセルタイマを仕込む。 */
export const enterWarning = (minutes: number) => {
  if (warningTimer) clearTimeout(warningTimer);
  setInteractionRaw({ type: "warning", minutes });
  warningTimer = setTimeout(() => {
    const c = interaction();
    if (c.type === "warning" && c.minutes === minutes) {
      setInteractionRaw({ type: "none" });
    }
  }, WARNING_AUTO_CANCEL_MS);
};

/** 外タップやキャンセル時に呼ぶ。warning 中なら none に戻す。 */
export const cancelWarning = () => {
  if (warningTimer) clearTimeout(warningTimer);
  warningTimer = undefined;
  if (interaction().type === "warning") {
    setInteractionRaw({ type: "none" });
  }
};

/**
 * ゴミ箱タップ時に呼ぶ。deleting 状態に遷移、アニメ後にデータ削除して none に戻す。
 * 削除アニメ中は別のイベントの操作を受け付けない (interaction が "none" でない間は新規操作を弾く)。
 *
 * reduce-motion 中はアニメ自体が走らないので待ち時間を 0 にして即削除する
 * (アイコンが何も起きずに 900ms 居続けるのを避けるため)。
 */
export const triggerDelete = (minutes: number) => {
  if (warningTimer) clearTimeout(warningTimer);
  warningTimer = undefined;
  setInteractionRaw({ type: "deleting", minutes });
  const delay = motionAllowed() ? DELETE_ANIMATION_MS : 0;
  setTimeout(() => {
    deleteScheduleAt(minutes);
    setInteractionRaw({ type: "none" });
  }, delay);
};
