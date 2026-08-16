import { useCallback, useEffect, type RefObject } from "react";
import { useInView } from "framer-motion";
import { useMobileViewport } from "./use-mobile-viewport";

type Options = {
  enabled?: boolean;
  rootMargin?: string;
  amount?: number;
  /** Below 1024px: play when ready without waiting for scroll / in-view (hero). */
  playImmediatelyOnMobile?: boolean;
};

export function useAutoplayVideo(
  containerRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  {
    enabled = true,
    rootMargin = "80px 0px",
    amount = 0.2,
    playImmediatelyOnMobile = false,
  }: Options = {},
) {
  const isMobile = useMobileViewport();
  const mobileImmediate = playImmediatelyOnMobile && isMobile;

  const isInView = useInView(containerRef, {
    margin: rootMargin as
      | `${number}${"px" | "%"}`
      | `${number}${"px" | "%"} ${number}${"px" | "%"}`
      | `${number}${"px" | "%"} ${number}${"px" | "%"} ${number}${"px" | "%"} ${number}${"px" | "%"}`,
    amount,
  });

  const shouldPlay = enabled && (mobileImmediate || isInView);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    void video.play().catch(() => {});
  }, [enabled, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    if (!shouldPlay) {
      if (!mobileImmediate) {
        video.pause();
      }
      return;
    }

    tryPlay();

    const onReady = () => tryPlay();
    video.addEventListener("canplay", onReady);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("loadedmetadata", onReady);

    return () => {
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("loadedmetadata", onReady);
    };
  }, [shouldPlay, enabled, mobileImmediate, tryPlay, videoRef]);

  return { isInView, tryPlay, shouldPlay };
}
