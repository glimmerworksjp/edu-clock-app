import { createEffect, on } from "solid-js";
import type { Component } from "solid-js";
import {
  prerollKey,
  PULSE_MS,
  SHOCKWAVE_MS,
} from "../features/settings/time-format-preroll";
import { animateMotion } from "../lib/motion";

/**
 * 12h ⇄ 24h トグル時の preroll エフェクトのうち、12 を震源にした衝撃波リング担当。
 *
 * 12 自体の色変化 (ドゥンドゥドゥンッ) は ClockFace 側で position 0 の <text> の fill を
 * 直接アニメしている。本 component は 2 度のネオン点灯が終わった直後に外へふわっと
 * 抜ける「ドンッ」リングだけを描く (12 周りの常時 halo は撤廃して情報量を減らした).
 *
 * fill / blur / drop-shadow / filter 系は一切使わない (重い). 高彩度の stroke と
 * opacity だけで衝撃波を表現する。
 */

interface Props {
  /** てっぺん 12 の中心 (SVG viewBox 単位) */
  centerX: number;
  centerY: number;
}

const TimeFormatPrerollFx: Component<Props> = (props) => {
  let ringRef: SVGCircleElement | undefined;

  createEffect(on(prerollKey, () => {
    if (!ringRef) return;
    ringRef.getAnimations().forEach((a) => a.cancel());

    // 2 度のネオン点灯が完全に終わった瞬間 (delay = PULSE_MS * 2) に
    // 外へふわっと抜ける衝撃波.
    animateMotion(
      ringRef,
      [
        { transform: "scale(0.15)", opacity: 0 },
        { transform: "scale(0.9)",  opacity: 0.95, offset: 0.30 },
        { transform: "scale(1.6)",  opacity: 0 },
      ],
      {
        delay: PULSE_MS * 2,
        duration: SHOCKWAVE_MS,
        easing: "cubic-bezier(0.2, 0.6, 0.3, 1)",
        fill: "forwards",
      },
    );
  }, { defer: true }));

  return (
    <g
      style={{ "pointer-events": "none" }}
      transform={`translate(${props.centerX}, ${props.centerY})`}
    >
      {/* shockwave: 点灯後にふわっと外へ抜ける残響リング. */}
      <circle
        ref={ringRef}
        cx="0"
        cy="0"
        r="22"
        fill="none"
        stroke="#80FFC0"
        stroke-width="3.5"
        opacity="0"
        style={{
          "transform-box": "fill-box",
          "transform-origin": "center",
        }}
      />
    </g>
  );
};

export default TimeFormatPrerollFx;
