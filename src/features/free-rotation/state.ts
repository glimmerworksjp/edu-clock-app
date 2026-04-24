import { createSignal } from "solid-js";

/**
 * 自由回転モード (じゆうかいてん) のセッション状態。
 * 永続化しない (アプリ再起動で初期状態に戻る)。
 *
 * ===== モード階層 =====
 *
 *   通常モード (rotateActive() === false)
 *     現在時刻を表示。AM/PM バッジ + 長押しプレビューが出る
 *
 *   自由回転モード (rotateActive() === true)
 *     ├─ manual サブモード (rotateMode() === "manual")
 *     │    ドラッグで時刻変更、1ふんもどす、ランダム、かさね/わけ切替
 *     │    かさね (merged) / わける (split) は manual 中でのみ切替可
 *     │
 *     └─ auto サブモード (rotateMode() === "auto")
 *          1日24秒で自動進行
 *
 * ===== 排他性は構造で強制している =====
 * 「通常モードで merged 表示にならない」は AND ガードを書き忘れたら破綻する規約ではなく、
 * **生 signal `rotateMerged` を module-private にして外に出さず、公開 accessor は
 * AND ガード後の `mergedVisible` だけ、公開 action `toggleMerged` も rotateActive 中だけ動く**
 * ことで構造的に保証している。コメントが嘘をつく余地はない。
 *
 * Public API:
 *   - accessor: rotateActive, rotateMinutes, rotateMode, mergedVisible
 *   - action:   enterRotate, exitRotate, seekRotate, setRotateMode, toggleMerged
 *
 * 内部の生 setter (setActiveRaw, setMinutesRaw 等) と生 signal (rotateMerged) は
 * 意図的に export していない。モジュール内でも生 setter を直接呼ばず、必ず action 経由で書き換える。
 *
 * 補足: rotateMinutes は 0..1439 に正規化される (seekRotate が wrap-around を担保)。
 */

/** 自由回転のサブモード: manual=手動, auto=自動進行 (らんだむは単発アクションなのでここには無い) */
export type RotateMode = "manual" | "auto";

function nowAsMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// ===== Internal state (raw setters and rotateMerged signal are intentionally not exported) =====
const [rotateActive, setActiveRaw] = createSignal(false);
const [rotateMinutes, setMinutesRaw] = createSignal(nowAsMinutes());
const [rotateMode, setModeRaw] = createSignal<RotateMode>("manual");
const [rotateMerged, setMergedRaw] = createSignal(true);

// ===== Public accessors (read-only) =====
export { rotateActive, rotateMinutes, rotateMode };

/**
 * merged (かさね) 表示が実際に出ているか。rotateActive との AND を返す。
 * 「通常モードで merged 表示にならない」排他性を構造的に担保するため、
 * 外に露出する merged 関連 accessor はこの関数だけ。生 signal rotateMerged は private。
 */
export const mergedVisible = () => rotateActive() && rotateMerged();

// ===== Public actions (only valid mutations live here) =====

/**
 * 自由回転モードに入る。
 * 入るたびに minutes=現在時刻、mode=manual、merged=true(かさね) に初期化する。
 */
export const enterRotate = () => {
  setActiveRaw(true);
  setMinutesRaw(nowAsMinutes());
  setModeRaw("manual");
  setMergedRaw(true);
};

/**
 * 自由回転モードを抜けて通常モードに戻る。
 * 次回 enter 時にきれいに初期化されるよう、mode と merged も reset しておく。
 */
export const exitRotate = () => {
  setActiveRaw(false);
  setModeRaw("manual");
  setMergedRaw(true);
};

/** rotateMinutes を 0..1439 に wrap-around しながらシーク。負数も正の側に折り返す。 */
export const seekRotate = (m: number) => {
  setMinutesRaw(((m % 1440) + 1440) % 1440);
};

export const setRotateMode = (mode: RotateMode) => setModeRaw(mode);

/**
 * かさね/わけ を切替。rotateActive() === false の時は no-op。
 * (通常モード中に merged 状態が動くと、復帰時の挙動が予期せず変わるため構造的に禁止)
 */
export const toggleMerged = () => {
  if (!rotateActive()) return;
  setMergedRaw(v => !v);
};
