import { createMemo } from "solid-js";
import type { Component } from "solid-js";
import AnalogClock from "./AnalogClock";
import SecondsBar from "./SecondsBar";
import SettingsPanel from "./SettingsPanel";
import { useCurrentTime } from "../hooks/useCurrentTime";

export const ClockLayout: Component = () => {
  const time = useCurrentTime();

  const isAm = createMemo(() => time().hours < 12);

  const amTime = createMemo(() => ({
    hours: time().hours % 12,
    minutes: time().minutes,
  }));

  const pmTime = createMemo(() => ({
    hours: time().hours >= 12 ? time().hours % 12 : time().hours % 12,
    minutes: time().minutes,
  }));

  return (
    <div class="w-full h-full flex flex-col overflow-hidden">
      {/* 秒バー：存在感は最小限 */}
      <SecondsBar seconds={time().seconds} hours={time().hours} />

      {/* 時計を画面いっぱいに！paddingもgapも最小！ */}
      <div class="flex-1 flex flex-col landscape:flex-row items-stretch min-h-0">
        {/* AM */}
        <div class="flex-1 flex flex-col items-center justify-center min-h-0 min-w-0 relative">
          <span class="absolute top-0 left-2 text-[10px] font-extrabold text-blue-500/60 z-10">
            &#x2600;&#xFE0F; AM
          </span>
          <AnalogClock
            period="am"
            hours={amTime().hours}
            minutes={amTime().minutes}
            dimmed={!isAm()}
          />
        </div>

        {/* PM */}
        <div class="flex-1 flex flex-col items-center justify-center min-h-0 min-w-0 relative">
          <span class="absolute top-0 left-2 text-[10px] font-extrabold text-pink-500/60 z-10">
            &#x1F319; PM
          </span>
          <AnalogClock
            period="pm"
            hours={pmTime().hours}
            minutes={pmTime().minutes}
            dimmed={isAm()}
          />
        </div>
      </div>

      <SettingsPanel />
    </div>
  );
};
