import { createContext, useContext, type ReactNode } from "react";

type AppReadyContextValue = {
  ready: boolean;
  exiting: boolean;
};

const AppReadyContext = createContext<AppReadyContextValue>({
  ready: false,
  exiting: false,
});

export function AppReadyProvider({ children }: { children: ReactNode }) {
  // Keep server and client markup identical on the first paint. A delayed client-only
  // readiness state made the global loader flash briefly over fully rendered routes.
  return <AppReadyContext.Provider value={{ ready: true, exiting: false }}>{children}</AppReadyContext.Provider>;
}

export function useAppReady() {
  return useContext(AppReadyContext);
}
