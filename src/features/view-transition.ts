/**
 * View Transitions API のラッパー。
 * 対応ブラウザでは fn の実行を startViewTransition 経由にして、
 * 同じ view-transition-name を持つ要素同士の消滅→出現を自動でモーフィングさせる。
 * 非対応ブラウザでは単に fn を呼ぶだけ (機能としてはフォールバック)。
 *
 * Public API:
 *   - withViewTransition(fn)
 *   - MORPHING_SLOT (morphing slot 名の定数)
 *
 * 副作用のないシンプルなヘルパー (state 無し)。
 */

export const withViewTransition = (fn: () => void) => {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(fn);
  } else {
    fn();
  }
};

/**
 * View Transitions の "morphing slot" 名。
 *
 * 同じ slot 名を持つ要素が消滅→出現すると、対応ブラウザが合成的にモーフィング描画する。
 * 各 slot は「モードによって入れ替わる UI スロット」を表す。同時に両方が描画されることはなく、
 * モード遷移 (通常 ↔ 自由回転) 時にブラウザがモーフィング:
 *
 *   LEFT   通常モード:        AM/PM バッジ + 長押しプレビュー
 *          自由回転 manual:    (将来) 予定ボタン
 *                              ※ 旧「てまわし/ぐりぐり」切替もここに居た
 *
 *   RIGHT  通常モード:        パレット切替ボタン
 *          自由回転 manual:    1ふんもどす
 *
 * 新しい morphing slot を追加する時はここに名前を加え、共有関係をコメントに残す。
 */
export const MORPHING_SLOT = {
  LEFT: "clock-left-slot",
  RIGHT: "clock-right-slot",
} as const;
