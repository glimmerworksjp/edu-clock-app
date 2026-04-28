/**
 * Kiosk-style 全画面ロックを起動する側だけの薄い entrypoint。 ルールは ./kiosk-bootstrap.css 側に
 * 寄せて、 こちら側は import の有無で feature を toggle するだけの責務 (motion-bootstrap.ts と
 * 同パターン)。 src/index.tsx で `import "./lib/kiosk-bootstrap"` すれば ON、その 1 行を
 * 消せば全部 dormant。
 */

import "./kiosk-bootstrap.css";
