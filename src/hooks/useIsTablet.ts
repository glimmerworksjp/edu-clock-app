import { createSignal, onCleanup } from "solid-js";

/**
 * タブレット判定 (= 子ども向けにボタン等を大きく見せたい条件)。
 *
 * 条件は index.css の `@custom-variant tablet` と同じ:
 *   width >= 48rem (768px) かつ height >= 32rem (512px)
 *
 * 高さも見ることで「スマホのランドスケープ (幅は広いが高さが低い)」を除外する。
 *
 * matchMedia の change event でリサイズに追従。
 */
const TABLET_QUERY = "(min-width: 48rem) and (min-height: 32rem)";

export function useIsTablet() {
  const mql = window.matchMedia(TABLET_QUERY);
  const [isTablet, setIsTablet] = createSignal(mql.matches);
  const update = (e: MediaQueryListEvent) => setIsTablet(e.matches);
  mql.addEventListener("change", update);
  onCleanup(() => mql.removeEventListener("change", update));
  return isTablet;
}
