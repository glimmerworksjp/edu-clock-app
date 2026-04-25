/**
 * prefers-reduced-motion (OS 設定の「視差効果を減らす」等) を listen して
 * motion.ts の skip predicate と body の motion-reduce class を切り替える起動コード。
 *
 * src/index.tsx で `import "./lib/motion-bootstrap"` するとアクセシビリティ機能 ON。
 * その import 1 行を消せば全部 dormant:
 *   - skip predicate がデフォルト (常に false) のままなので JS アニメは素通し
 *   - body.motion-reduce class が付かないので CSS の reduce-motion ルールも効かない
 *
 * ユーザー識別情報は読み取らない (matchMedia の `(prefers-reduced-motion: reduce)` は
 * OS のアクセシビリティ設定であり、フィンガープリンティング素材ではない)。
 */

import { setAnimationSkipPredicate } from "./motion";

const QUERY = "(prefers-reduced-motion: reduce)";
const mql = window.matchMedia(QUERY);

const updateBodyClass = () => {
  document.body.classList.toggle("motion-reduce", mql.matches);
};

setAnimationSkipPredicate(() => mql.matches);
updateBodyClass();
mql.addEventListener("change", updateBodyClass);
