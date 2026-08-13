import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MobileNav } from "./MobileNav";

type SiteHeaderProps = {
  logoStyle?: React.CSSProperties;
  variant?: "light" | "dark";
  showDesktopCta?: boolean;
  desktopCta?: ReactNode;
  backLink?: ReactNode;
};

export function SiteHeader({
  logoStyle,
  variant = "light",
  showDesktopCta = true,
  desktopCta,
  backLink,
}: SiteHeaderProps) {
  const textMuted = variant === "dark" ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground";
  const textMain = variant === "dark" ? "text-white" : "text-foreground";

  return (
    <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <Link to="/" className="shrink-0 text-2xl tracking-tight sm:text-3xl" style={logoStyle}>
        Solver<sup className="text-xs">®</sup>
      </Link>

      {!backLink ? (
        <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          <Link to="/" className={`text-sm transition-colors ${textMain}`}>
            Home
          </Link>
          <Link to="/services" className={`text-sm transition-colors ${textMuted}`}>
            Services
          </Link>
          <Link to="/courses" className={`text-sm transition-colors ${textMuted}`}>
            Courses
          </Link>
          <Link to="/subscriptions" className={`text-sm transition-colors ${textMuted}`}>
            Subscriptions
          </Link>
          <Link to="/refund-policy" className={`text-sm transition-colors ${textMuted}`}>
            Refund Policy
          </Link>
          <Link to="/contact" className={`text-sm transition-colors ${textMuted}`}>
            Reach Us
          </Link>
        </div>
      ) : (
        <div className="hidden flex-1 lg:block" aria-hidden />
      )}

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {backLink ? <div className="hidden lg:block">{backLink}</div> : null}
        {showDesktopCta ? (
          <div className="hidden lg:block">
            {desktopCta ?? (
              <Link
                to="/contact"
                className={`rounded-full px-6 py-2.5 text-sm transition-transform hover:scale-[1.03] ${
                  variant === "dark"
                    ? "border border-white/20 bg-white/10 text-white"
                    : "liquid-glass text-foreground"
                }`}
              >
                Begin Journey
              </Link>
            )}
          </div>
        ) : null}
        <MobileNav logoStyle={logoStyle} variant={variant} />
      </div>
    </nav>
  );
}
