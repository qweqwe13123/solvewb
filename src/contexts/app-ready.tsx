import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AppReadyContextValue = {
  ready: boolean;
  exiting: boolean;
};

const AppReadyContext = createContext<AppReadyContextValue>({
  ready: false,
  exiting: false,
});

const MIN_LOADER_MS = 1200;
const EXIT_ANIM_MS = 650;
const MAX_WAIT_MS = 5000;

export function AppReadyProvider({ children }: { children: ReactNode }) {
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname !== "/";
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      setReady(true);
      return;
    }
    let exitTimer: number | undefined;
    let readyTimer: number | undefined;
    let safetyTimer: number | undefined;

    const finish = () => {
      if (exiting) return;
      setExiting(true);
      exitTimer = window.setTimeout(() => {
        setReady(true);
      }, EXIT_ANIM_MS);
    };

    const domReady =
      document.readyState === "interactive" || document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
          });

    const minDelay = new Promise<void>((resolve) => {
      readyTimer = window.setTimeout(resolve, MIN_LOADER_MS);
    });

    const safetyDelay = new Promise<void>((resolve) => {
      safetyTimer = window.setTimeout(resolve, MAX_WAIT_MS);
    });

    Promise.race([Promise.all([domReady, minDelay]), safetyDelay]).then(finish);

    return () => {
      if (exitTimer) window.clearTimeout(exitTimer);
      if (readyTimer) window.clearTimeout(readyTimer);
      if (safetyTimer) window.clearTimeout(safetyTimer);
    };
  }, []);

  return <AppReadyContext.Provider value={{ ready, exiting }}>{children}</AppReadyContext.Provider>;
}

export function useAppReady() {
  return useContext(AppReadyContext);
}
