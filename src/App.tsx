import type { Component } from "solid-js";
import { SettingsProvider } from "./store/settings";
import { ClockLayout } from "./components/ClockLayout";

const App: Component = () => {
  return (
    <SettingsProvider>
      <ClockLayout />
    </SettingsProvider>
  );
};

export default App;
