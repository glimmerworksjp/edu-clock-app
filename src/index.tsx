/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

// iOS Safari の長押し callout / 文字選択を JS 側でも封殺。CSS (user-select: none,
// -webkit-touch-callout: none) だけだと iOS で取り切れないケースがあるため、
// - contextmenu: デスクトップ右クリック + iOS 長押し menu
// - selectstart: 選択開始イベント
// の両方を preventDefault し、さらに selectionchange で発生済みの選択を
// 即 clear する。
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());
document.addEventListener("selectionchange", () => {
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed) sel.removeAllRanges();
});

// iOS 16+ では上記だけでも長押し callout(「コピー/検索/翻訳」メニュー)が
// 残ることがある。touchstart で時刻を記録し、touchend が 400ms 超なら
// 長押しと判定して preventDefault — これで callout 表示を抑止できる。
// 400ms 未満の通常タップは素通しさせるのでボタンのクリックは壊さない。
// rewind ボタンは pointerdown/up ベースなので touchend の default
// キャンセルには影響されない。
let touchStartAt = 0;
document.addEventListener(
  "touchstart",
  () => {
    touchStartAt = Date.now();
  },
  { passive: true },
);
document.addEventListener(
  "touchend",
  (e) => {
    if (Date.now() - touchStartAt > 400) e.preventDefault();
  },
  { passive: false },
);

// PWA: 新SWが有効化されたらリロードして新アセットを取り込む。
// 初回インストール（起動時に controller が居ない）の場合はスキップ。
if ("serviceWorker" in navigator) {
  const hadControllerAtStart = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadControllerAtStart) window.location.reload();
  });
}

render(() => <App />, root);
