import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroScrollHint } from "@/components/hero/HeroScrollHint";
import { HeroSocialProof } from "@/components/hero/HeroSocialProof";
import { HeroStatsBar } from "@/components/hero/HeroStatsBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JackPortfolio } from "@/components/jack/JackPortfolio";
import { useAppReady } from "@/contexts/app-ready";
import { useAutoplayVideo } from "@/hooks/use-autoplay-video";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";
import { siteMetaTags } from "@/lib/site-meta";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: siteMetaTags(),
  }),
  component: Index,
});

function Index() {
  const display = { fontFamily: "'Instrument Serif', serif" } as const;
  const { ready } = useAppReady();
  const [heroVideoSrc, setHeroVideoSrc] = useState<string | null>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useGlobalVideoUnlock();
  const { tryPlay } = useAutoplayVideo(heroWrapRef, heroVideoRef, {
    amount: 0.1,
    playImmediatelyOnMobile: true,
  });

  useEffect(() => {
    if (!ready) return;
    setHeroVideoSrc(HERO_VIDEO);
  }, [ready]);

  useEffect(() => {
    if (!heroVideoSrc || typeof window === "undefined" || window.innerWidth >= 1024) return;

    const play = () => tryPlay();
    play();
    const timers = [50, 200, 500, 1200, 2500].map((ms) => window.setTimeout(play, ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [heroVideoSrc, tryPlay]);

  return (
    <div className="w-full overflow-x-clip bg-background">
      <section className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#0C0C0C]" aria-hidden />
        <div ref={heroWrapRef} className="absolute inset-0 z-0">
          {heroVideoSrc ? (
            <video
              ref={heroVideoRef}
              data-hero-video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              src={heroVideoSrc}
              onLoadedData={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) tryPlay();
              }}
              onCanPlay={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) tryPlay();
              }}
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
          ) : null}
        </div>

        <SiteHeader logoStyle={display} variant="light" />

        <div className="relative z-10 flex flex-col items-center px-4 py-[90px] pt-32 pb-56 text-center max-lg:px-5 max-lg:py-0 max-lg:pt-20 max-lg:pb-10 sm:px-6">
          <h1
            className="animate-fade-rise max-w-7xl font-normal leading-[0.95] tracking-[-2.46px] max-lg:max-w-[20rem] max-lg:text-[2.15rem] max-lg:leading-[1.02] max-lg:tracking-[-1.5px] max-lg:sm:max-w-xl max-lg:sm:text-4xl max-lg:md:text-5xl lg:text-5xl lg:sm:text-7xl lg:md:text-8xl"
            style={display}
          >
            Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
            <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>
          <p className="animate-fade-rise-delay mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:mt-8 sm:text-base lg:mt-8 lg:text-lg">
            We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the
            chaos, we build digital spaces for sharp focus and inspired work.
          </p>
          <HeroSocialProof />
          <Link
            to="/contact"
            className="liquid-glass mt-8 inline-flex cursor-pointer items-center justify-center rounded-full px-10 py-4 text-sm text-foreground transition-transform hover:scale-[1.03] max-lg:w-full max-lg:max-w-xs sm:mt-10 sm:px-14 sm:py-5 sm:text-base lg:mt-12 lg:w-auto"
          >
            Begin Journey
          </Link>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 px-4 pb-8 pt-4 max-lg:static max-lg:mt-2 lg:absolute lg:bottom-2 lg:left-0 lg:right-0 lg:gap-5 lg:pb-0 lg:pt-0 lg:sm:bottom-3 lg:md:gap-6">
          <HeroScrollHint />
          <HeroStatsBar />
        </div>
      </section>
      <JackPortfolio />
    </div>
  );
}
