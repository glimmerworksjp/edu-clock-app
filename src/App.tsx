import type { Component } from "solid-js";
import { ClockLayout } from "./components/ClockLayout";
import { useClockFreezeBodyClass } from "./features/freeze";
import { I18nProvider } from "./i18n";

const App: Component = () => {
  // SchedulePicker open 中の clock 凍結用 body class を起動。
  useClockFreezeBodyClass();
  return (
    <I18nProvider>
      <ClockLayout />
    </I18nProvider>
  );
};

export default App;
