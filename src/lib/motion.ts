/**
 * 装飾的アニメーションを 1 ヶ所で制御する薄い facade。
 *
 * デフォルト挙動は完全に透過 (= el.animate そのまま)。
 * src/lib/motion-bootstrap.ts が import された時のみ predicate が設定され、
 * 「prefers-reduced-motion: reduce」の OS 設定でアニメをスキップするようになる。
 *
 * 機能を消したい時:
 *   src/index.tsx の `import "./lib/motion-bootstrap"` の 1 行を消すだけ。
 *   この時 motionAllowed() は常に true、animateMotion は素通し、body の class も付かない。
 *   CSS 側の body.motion-reduce ルールはセレクタが効かなくなるので dormant。
 */

let skipPredicate: () => boolean = () => false;

export const setAnimationSkipPredicate = (fn: () => boolean): void => {
  skipPredicate = fn;
};

/** モーション (装飾アニメ) が許可されているか。skip predicate の反転。 */
export const motionAllowed = (): boolean => !skipPredicate();

/**
 * Element.animate の薄いラッパー。motion がスキップ対象なら何もせず null を返す。
 * 戻り値は Animation | null。caller は ?. でキャンセル等を呼べる。
 */
export const animateMotion = (
  el: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | null => {
  if (skipPredicate()) return null;
  return el.animate(keyframes, options);
};
